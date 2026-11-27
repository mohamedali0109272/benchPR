package com.benchpr.app

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import android.util.Log
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.view.WindowCompat
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes
import com.google.android.gms.common.api.ApiException
import org.json.JSONObject
import java.io.BufferedReader
import java.io.ByteArrayInputStream
import java.io.IOException
import java.io.InputStreamReader
import java.net.InetAddress
import java.net.ServerSocket
import java.net.SocketTimeoutException
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var pageLoaded = false
    private var pendingAuthResult: Triple<String?, String?, String?>? = null
    @Volatile
    private var authServerSocket: ServerSocket? = null
    private val authServerExecutor = Executors.newSingleThreadExecutor()
    private val updateExecutor = Executors.newSingleThreadExecutor()
    @Volatile
    private var updateInProgress = false
    @Volatile
    private var pendingUpdateApk: File? = null

    private val googleSignInClient: GoogleSignInClient by lazy {
        GoogleSignIn.getClient(
            this,
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestIdToken(WEB_CLIENT_ID)
                .build(),
        )
    }

    /** Exposed to JavaScript as window.AndroidAuth. */
    inner class AndroidAuthBridge {
        @JavascriptInterface
        fun signIn() {
            runOnUiThread {
                try {
                    startActivityForResult(googleSignInClient.signInIntent, RC_GOOGLE_SIGN_IN)
                } catch (e: Exception) {
                    Log.w(TAG, "Native sign-in start failed, falling back to browser", e)
                    launchBrowserAuth()
                }
            }
        }

        @JavascriptInterface
        fun openBrowserAuth() {
            runOnUiThread {
                launchBrowserAuth()
            }
        }

        @JavascriptInterface
        fun installUpdate(downloadUrl: String) {
            runOnUiThread {
                startInAppUpdate(downloadUrl)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleAuthIntent(intent)
    }

    private fun handleAuthIntent(intent: Intent?) {
        val data = intent?.data ?: return
        if (data.scheme == "benchpr" && data.host == "auth") {
            stopAuthServer()
            val idToken = data.getQueryParameter("idToken")
            val accessToken = data.getQueryParameter("accessToken")
            val error = data.getQueryParameter("error")
            Log.d(TAG, "Received deep link auth: hasIdToken=${idToken != null}, hasAccessToken=${accessToken != null}, error=$error")
            deliverGoogleResult(idToken, error, accessToken)
        }
    }

    private fun stopAuthServer() {
        try {
            authServerSocket?.close()
        } catch (_: Exception) {
        } finally {
            authServerSocket = null
        }
    }

    private fun launchBrowserAuth() {
        stopAuthServer()
        authServerExecutor.execute {
            try {
                val htmlBytes = assets.open("auth-popup.html").readBytes()
                val server = ServerSocket(0, 16, InetAddress.getByName("127.0.0.1")).apply {
                    soTimeout = 180_000
                }
                authServerSocket = server
                val port = server.localPort
                val authUrl = "http://localhost:$port/auth-popup.html"

                runOnUiThread {
                    try {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(authUrl)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(browserIntent)
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to open browser for local auth", e)
                        stopAuthServer()
                        deliverGoogleResult(null, "Could not open browser for sign-in")
                    }
                }

                while (authServerSocket === server && !server.isClosed) {
                    val client = try {
                        server.accept()
                    } catch (_: SocketTimeoutException) {
                        break
                    } catch (_: IOException) {
                        break
                    }

                    client.use { socket ->
                        val reader = BufferedReader(InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))
                        val requestLine = reader.readLine().orEmpty()
                        while (true) {
                            val header = reader.readLine()
                            if (header.isNullOrEmpty()) break
                        }

                        val out = socket.getOutputStream()
                        if (requestLine.startsWith("GET /auth-popup.html")) {
                            val headers = (
                                "HTTP/1.1 200 OK\r\n" +
                                    "Content-Type: text/html; charset=UTF-8\r\n" +
                                    "Content-Length: ${htmlBytes.size}\r\n" +
                                    "Cache-Control: no-store\r\n" +
                                    "Connection: close\r\n\r\n"
                                ).toByteArray(StandardCharsets.US_ASCII)
                            out.write(headers)
                            out.write(htmlBytes)
                        } else {
                            val body = "Not Found".toByteArray(StandardCharsets.UTF_8)
                            val headers = (
                                "HTTP/1.1 404 Not Found\r\n" +
                                    "Content-Type: text/plain; charset=UTF-8\r\n" +
                                    "Content-Length: ${body.size}\r\n" +
                                    "Connection: close\r\n\r\n"
                                ).toByteArray(StandardCharsets.US_ASCII)
                            out.write(headers)
                            out.write(body)
                        }
                        out.flush()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to launch local browser auth server", e)
                runOnUiThread {
                    deliverGoogleResult(null, "Could not start browser sign-in")
                }
            } finally {
                stopAuthServer()
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != RC_GOOGLE_SIGN_IN) return

        val account = try {
            GoogleSignIn.getSignedInAccountFromIntent(data).getResult(ApiException::class.java)
        } catch (e: ApiException) {
            Log.w(TAG, "Google sign-in failed with status ${e.statusCode}", e)
            if (e.statusCode == GoogleSignInStatusCodes.SIGN_IN_CANCELLED) {
                deliverGoogleResult(null, "CANCELLED")
            } else if (e.statusCode == 10) {
                // 10 = DEVELOPER_ERROR: SHA-1 is not registered in Firebase console.
                // Automatically fall back to browser-based OAuth so the user signs in seamlessly!
                Log.i(TAG, "Error 10 encountered: SHA-1 not registered. Falling back to browser OAuth...")
                launchBrowserAuth()
            } else {
                deliverGoogleResult(null, "Google error ${e.statusCode}")
            }
            return
        }

        val token = account.idToken
        if (token == null) {
            Log.e(TAG, "Google account returned no ID token; falling back to browser")
            launchBrowserAuth()
        } else {
            deliverGoogleResult(token, null)
        }
    }

    private fun reportUpdateToJs(fnName: String, argJs: String) {
        runOnUiThread {
            if (::webView.isInitialized) {
                webView.evaluateJavascript("window.$fnName && window.$fnName($argJs);", null)
            }
        }
    }

    /** Downloads the release APK inside the app, then hands it to Android's installer. */
    private fun startInAppUpdate(downloadUrl: String) {
        if (updateInProgress) return
        updateInProgress = true
        updateExecutor.execute {
            val updatesDir = File(cacheDir, "updates").apply { mkdirs() }
            val target = File(updatesDir, "benchpr-update.apk")
            try {
                downloadApk(downloadUrl, target) { pct ->
                    reportUpdateToJs("__onUpdateProgress", pct.toString())
                }
                updateInProgress = false
                pendingUpdateApk = target
                runOnUiThread { installDownloadedApk() }
            } catch (e: Exception) {
                Log.e(TAG, "In-app update download failed", e)
                target.delete()
                updateInProgress = false
                reportUpdateToJs("__onUpdateError", JSONObject.quote(e.message ?: "Download failed"))
            }
        }
    }

    private fun downloadApk(url: String, target: File, onProgress: (Int) -> Unit) {
        val partial = File(target.parentFile, target.name + ".part")
        val conn = (URL(url).openConnection() as HttpURLConnection).apply {
            instanceFollowRedirects = true
            connectTimeout = 15_000
            readTimeout = 30_000
            setRequestProperty("Accept", "application/octet-stream")
        }
        try {
            if (conn.responseCode !in 200..299) {
                throw IOException("Download failed (HTTP ${conn.responseCode})")
            }
            val total = conn.contentLengthLong
            conn.inputStream.use { input ->
                partial.outputStream().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    var done = 0L
                    var lastPct = -1
                    while (true) {
                        val read = input.read(buffer)
                        if (read < 0) break
                        output.write(buffer, 0, read)
                        done += read
                        if (total > 0) {
                            val pct = ((done * 100) / total).toInt()
                            if (pct != lastPct) {
                                lastPct = pct
                                onProgress(pct)
                            }
                        }
                    }
                }
            }
        } finally {
            conn.disconnect()
        }
        if (target.exists()) target.delete()
        if (!partial.renameTo(target)) throw IOException("Could not save the update file")
    }

    private fun installDownloadedApk() {
        val apk = pendingUpdateApk ?: return
        if (!packageManager.canRequestPackageInstalls()) {
            // One-time permission: allow BenchPR to install apps. Return to the app afterwards.
            val settingsIntent = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:$packageName"),
            ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
            startActivity(settingsIntent)
            reportUpdateToJs(
                "__onUpdateError",
                JSONObject.quote("Allow BenchPR to install apps, then return to the app to finish the update."),
            )
            return
        }
        pendingUpdateApk = null
        val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", apk)
        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(installIntent)
    }

    override fun onResume() {
        super.onResume()
        // Returning from the "install unknown apps" screen: continue the pending update.
        if (pendingUpdateApk != null && packageManager.canRequestPackageInstalls()) {
            installDownloadedApk()
        }
    }

    private fun deliverGoogleResult(idToken: String?, error: String?, accessToken: String? = null) {
        if (!::webView.isInitialized || !pageLoaded) {
            pendingAuthResult = Triple(idToken, error, accessToken)
            return
        }
        val tokenArg = idToken?.let { JSONObject.quote(it) } ?: "null"
        val errorArg = error?.let { JSONObject.quote(it) } ?: "null"
        val accessTokenArg = accessToken?.let { JSONObject.quote(it) } ?: "null"
        runOnUiThread {
            webView.evaluateJavascript(
                "window.__onNativeGoogleResult && window.__onNativeGoogleResult($tokenArg, $errorArg, $accessTokenArg);",
                null,
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val bgColor = Color.parseColor("#080A0F")
        window.setBackgroundDrawable(ColorDrawable(bgColor))
        window.statusBarColor = bgColor
        window.navigationBarColor = bgColor
        WindowCompat.getInsetsController(window, window.decorView)?.apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }

        WebView.setWebContentsDebuggingEnabled(true)

        webView = WebView(this).apply {
            setBackgroundColor(bgColor)
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                useWideViewPort = true
                loadWithOverviewMode = true
            }
            addJavascriptInterface(AndroidAuthBridge(), "AndroidAuth")
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    if (consoleMessage != null) {
                        Log.d(TAG, "WebView [${consoleMessage.messageLevel()}]: ${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})")
                    }
                    return super.onConsoleMessage(consoleMessage)
                }
            }
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?,
                ): WebResourceResponse? {
                    val uri = request?.url ?: return null
                    if (uri.host != APP_HOST) return null

                    if (request.method.equals("OPTIONS", ignoreCase = true)) {
                        return WebResourceResponse(
                            "text/plain",
                            "UTF-8",
                            200,
                            "OK",
                            corsHeaders(),
                            ByteArrayInputStream(ByteArray(0)),
                        )
                    }

                    val rawPath = uri.path.orEmpty().trimStart('/')
                    val assetPath = if (rawPath.isEmpty()) "index.html" else rawPath
                    return try {
                        val stream = assets.open(assetPath)
                        val (mime, encoding) = mimeAndEncodingFor(assetPath)
                        WebResourceResponse(
                            mime,
                            encoding,
                            200,
                            "OK",
                            corsHeaders(),
                            stream,
                        )
                    } catch (e: IOException) {
                        Log.w(TAG, "Asset not found: $assetPath", e)
                        null
                    }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    pageLoaded = true
                    val pending = pendingAuthResult
                    if (pending != null) {
                        pendingAuthResult = null
                        deliverGoogleResult(pending.first, pending.second, pending.third)
                    }
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?,
                ) {
                    Log.e(TAG, "WebView error on ${request?.url}: ${error?.description}")
                    super.onReceivedError(view, request, error)
                }
            }
        }

        setContentView(
            webView,
            ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            ),
        )
        webView.loadUrl("https://$APP_HOST/index.html")
        handleAuthIntent(intent)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        stopAuthServer()
        authServerExecutor.shutdownNow()
        if (::webView.isInitialized) {
            webView.destroy()
        }
        super.onDestroy()
    }

    private fun corsHeaders(): Map<String, String> = mapOf(
        "Access-Control-Allow-Origin" to "*",
        "Access-Control-Allow-Methods" to "GET, OPTIONS",
        "Access-Control-Allow-Headers" to "*",
        "Cache-Control" to "no-cache",
    )

    private fun mimeAndEncodingFor(path: String): Pair<String, String?> {
        val lower = path.lowercase()
        return when {
            lower.endsWith(".html") -> "text/html" to "UTF-8"
            lower.endsWith(".js") || lower.endsWith(".mjs") -> "text/javascript" to "UTF-8"
            lower.endsWith(".css") -> "text/css" to "UTF-8"
            lower.endsWith(".json") -> "application/json" to "UTF-8"
            lower.endsWith(".svg") -> "image/svg+xml" to "UTF-8"
            lower.endsWith(".png") -> "image/png" to null
            lower.endsWith(".jpg") || lower.endsWith(".jpeg") -> "image/jpeg" to null
            lower.endsWith(".woff2") -> "font/woff2" to null
            else -> "application/octet-stream" to null
        }
    }

    companion object {
        private const val TAG = "BenchPRWebView"
        private const val APP_HOST = "appassets.androidplatform.net"
        private const val RC_GOOGLE_SIGN_IN = 9001
        // OAuth web client ID from firebase-applet-config.json (oAuthClientId).
        private const val WEB_CLIENT_ID =
            "426592709819-n9ledc71i26kj3mmhqbs92k9kq8sk1ub.apps.googleusercontent.com"
    }
}

package com.benchpr.app

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.content.Intent
import android.net.Uri
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
import java.io.ByteArrayInputStream
import java.io.IOException

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var pageLoaded = false
    private var pendingAuthResult: Triple<String?, String?, String?>? = null

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
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl)).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to start install update", e)
                }
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
            val idToken = data.getQueryParameter("idToken")
            val accessToken = data.getQueryParameter("accessToken")
            val error = data.getQueryParameter("error")
            Log.d(TAG, "Received deep link auth: hasIdToken=${idToken != null}, hasAccessToken=${accessToken != null}, error=$error")
            deliverGoogleResult(idToken, error, accessToken)
        }
    }

    private fun launchBrowserAuth() {
        try {
            val authUrl = "https://ais-pre-xfm4qcf5k75dpba4xnkto3-697317136065.europe-west3.run.app/auth-popup.html"
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(authUrl)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(browserIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch browser auth", e)
            deliverGoogleResult(null, "Could not open browser for sign-in")
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

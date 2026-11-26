package com.benchpr.app

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.view.WindowCompat
import java.io.ByteArrayInputStream
import java.io.IOException

class MainActivity : Activity() {
    private lateinit var webView: WebView

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
    }
}

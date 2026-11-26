package com.benchpr.app

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant

/** Checks the latest GitHub release and downloads its APK for in-app updates. */
object AppUpdater {
    private const val LATEST_RELEASE_API =
        "https://api.github.com/repos/mohamedali0109272/benchPR/releases/latest"
    private const val USER_AGENT = "BenchPR-Android"

    class Release(val tag: String, val publishedAt: Long, val apkUrl: String?)

    fun fetchLatest(): Release {
        val conn = (URL(LATEST_RELEASE_API).openConnection() as HttpURLConnection).apply {
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("User-Agent", USER_AGENT)
            connectTimeout = 15_000
            readTimeout = 15_000
        }
        try {
            if (conn.responseCode != 200) throw IOException("GitHub responded ${conn.responseCode}")
            val json = JSONObject(conn.inputStream.bufferedReader().use { it.readText() })
            var apkUrl: String? = null
            val assets = json.optJSONArray("assets")
            if (assets != null) {
                for (i in 0 until assets.length()) {
                    val asset = assets.getJSONObject(i)
                    if (asset.getString("name").endsWith(".apk")) {
                        apkUrl = asset.getString("browser_download_url")
                        break
                    }
                }
            }
            return Release(
                tag = json.optString("tag_name"),
                publishedAt = Instant.parse(json.getString("published_at")).toEpochMilli(),
                apkUrl = apkUrl,
            )
        } finally {
            conn.disconnect()
        }
    }

    /** When this build was installed; a release published after this is newer than the installed app. */
    fun installedTime(context: Context): Long =
        context.packageManager.getPackageInfo(context.packageName, 0).lastUpdateTime

    fun installedVersion(context: Context): String =
        context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "unknown"

    /** Downloads the APK, following GitHub's redirect to its CDN. */
    fun download(context: Context, url: String): File {
        val dest = File(context.cacheDir, "update/benchpr-update.apk")
        dest.parentFile?.mkdirs()
        var current = URL(url)
        var redirects = 0
        while (true) {
            val conn = (current.openConnection() as HttpURLConnection).apply {
                instanceFollowRedirects = false
                setRequestProperty("User-Agent", USER_AGENT)
                connectTimeout = 15_000
                readTimeout = 60_000
            }
            val code = conn.responseCode
            if (code in 300..399) {
                val location = conn.getHeaderField("Location") ?: throw IOException("Redirect without location")
                conn.disconnect()
                if (++redirects > 5) throw IOException("Too many redirects")
                current = URL(current, location)
                continue
            }
            if (code != 200) {
                conn.disconnect()
                throw IOException("Download failed ($code)")
            }
            conn.inputStream.use { input -> dest.outputStream().use { input.copyTo(it) } }
            conn.disconnect()
            return dest
        }
    }

    /** Refuses to install anything that is not this app's package. */
    fun isSameApp(context: Context, apk: File): Boolean {
        val info = context.packageManager.getPackageArchiveInfo(apk.path, 0) ?: return false
        return info.packageName == context.packageName
    }
}

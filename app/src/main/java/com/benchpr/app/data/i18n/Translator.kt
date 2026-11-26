package com.benchpr.app.data.i18n

import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

/**
 * Translates the app's English UI text. Screens are written in English; every string shown on
 * screen goes through [text], which returns it unchanged for English and the Arabic version for
 * Arabic. Strings that are not known are returned as they are, so a missing translation never
 * breaks the screen.
 */
class Translator(val language: AppLanguage) {

    val isRtl: Boolean get() = language.isRtl

    /** Locale for dates. Arabic keeps Western digits so numbers look the same everywhere. */
    val locale: Locale
        get() = if (isRtl) Locale.forLanguageTag("ar-u-nu-latn") else Locale.getDefault()

    private val cache = ConcurrentHashMap<String, String>()

    fun text(english: String): String {
        if (language == AppLanguage.ENGLISH || english.isEmpty()) return english
        return cache.getOrPut(english) { ArabicTranslation.translate(english) }
    }
}

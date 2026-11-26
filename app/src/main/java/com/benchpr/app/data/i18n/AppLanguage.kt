package com.benchpr.app.data.i18n

enum class AppLanguage(val code: String, val nativeName: String, val isRtl: Boolean) {
    ENGLISH("en", "English", false),
    ARABIC("ar", "العربية", true);

    companion object {
        fun fromCode(code: String?): AppLanguage = entries.firstOrNull { it.code == code } ?: ENGLISH

        /** First launch: follow the phone's language when it is Arabic, otherwise English. */
        fun forDeviceLanguage(deviceLanguageCode: String?): AppLanguage =
            if (deviceLanguageCode.equals("ar", ignoreCase = true)) ARABIC else ENGLISH
    }
}

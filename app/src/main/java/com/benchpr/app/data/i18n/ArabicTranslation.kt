package com.benchpr.app.data.i18n

import com.benchpr.app.data.model.ExerciseLibrary
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.RankTier
import com.benchpr.app.data.model.Splits

/**
 * English to Arabic translation in four steps, stopping at the first that applies:
 *  1. an exact match in the dictionary (case does not matter),
 *  2. a sentence pattern such as "Goal: ..." whose parts are translated on their own,
 *  3. a string joined with " - " or " | ", translated piece by piece,
 *  4. in-text replacements for counts ("3 sets"), seconds, units and the multiplication sign.
 */
internal object ArabicTranslation {

    private const val MAX_DEPTH = 4

    private class Rule(
        val regex: Regex,
        val build: (groups: List<String>, translate: (String) -> String) -> String
    )

    private fun rule(pattern: String, build: (List<String>, (String) -> String) -> String) =
        Rule(Regex(pattern, RegexOption.IGNORE_CASE), build)

    private fun commaList(value: String, translate: (String) -> String): String =
        value.split(", ").joinToString("، ") { translate(it) }

    /** Arabic number agreement: 1 and 2 use their own forms, 3-10 take the plural, 11+ the singular. */
    internal fun count(n: Int, one: String, two: String, few: String, many: String): String = when {
        n == 1 -> one
        n == 2 -> two
        n in 3..10 -> "$n $few"
        else -> "$n $many"
    }

    private val dictionary: Map<String, String> by lazy {
        val map = HashMap<String, String>()
        fun put(english: String, arabic: String) {
            map[english.trim().lowercase()] = arabic
        }

        ArabicData.ui.forEach { (en, ar) -> put(en, ar) }
        ArabicData.programText.forEach { (en, ar) -> put(en, ar) }
        ArabicData.splitLevels.forEach { (en, ar) -> put(en, ar) }
        ArabicData.splitGoals.forEach { (en, ar) -> put(en, ar) }
        ArabicData.dayNames.forEach { (en, ar) -> put(en, ar) }
        ArabicData.dayFocus.forEach { (en, ar) -> put(en, ar) }
        ArabicData.programExerciseNames.forEach { (en, ar) -> put(en, ar) }

        MuscleGroup.entries.forEach { put(it.displayName, ArabicData.muscleName(it)) }
        RankTier.entries.forEach { put(it.displayName, ArabicData.tierName(it)) }

        for (item in ExerciseLibrary.PRESET_EXERCISES) {
            val (name, description) = ArabicData.exercises[item.id] ?: continue
            put(item.name, name)
            put(item.description, description)
        }
        for (split in Splits.ALL_SPLITS) {
            ArabicData.splitNames[split.id]?.let { put(split.name, it) }
            ArabicData.splitTaglines[split.id]?.let { put(split.tagline, it) }
        }
        map
    }

    private val rules: List<Rule> = listOf(
        rule("""START SESSION (\d+)""") { g, _ -> "ابدأ الجلسة ${g[0]}" },
        rule("""START (.+)""") { g, tr -> "ابدأ ${tr(g[0])}" },
        rule("""SET (\d+)""") { g, _ -> "المجموعة ${g[0]}" },
        rule("""Set (\d+): (.+) x (\d+) reps""") { g, tr ->
            "المجموعة ${g[0]}: ${tr(g[1])} × ${count(g[2].toIntOrNull() ?: 0, "تكرار واحد", "تكراران", "تكرارات", "تكرارًا")}"
        },
        rule("""Target 1RM: (.+)""") { g, tr -> "1RM المستهدف: ${tr(g[0])}" },
        rule("""Duration: (\d+)m""") { g, _ -> "المدة: ${g[0]} د" },
        rule("""Main goal: (.+)""") { g, tr -> "الهدف الأساسي: ${tr(g[0])}" },
        rule("""Goal: (.+)""") { g, tr -> "الهدف: ${tr(g[0])}" },
        rule("""(\d+) / (\d+) sets done""") { g, _ -> "تم إنجاز ${g[0]} من ${g[1]} مجموعة" },
        rule("""You have (\d+) completed sets that have not been saved\.""") { g, _ ->
            "عدد المجموعات المكتملة التي لم تُحفظ: ${g[0]}"
        },
        rule("""Next: (.+)""") { g, tr -> "التالي: ${tr(g[0])}" },
        rule("""Body weight: (.+)""") { g, tr -> "وزن الجسم: ${tr(g[0])}" },
        rule("""Body weight \((.+)\)""") { g, tr -> "وزن الجسم (${tr(g[0])})" },
        rule("""Not ranked yet\. Log sets of (.+) to get a rank\.""") { g, tr ->
            "بدون رتبة بعد. سجّل مجموعات من ${commaList(g[0], tr)} لتحصل على رتبة."
        },
        rule("""Strength score (.+)""") { g, _ -> "درجة القوة ${g[0]}" },
        rule("""(\d+)% to (.+)""") { g, tr -> "${g[0]}% للوصول إلى ${tr(g[1])}" },
        rule("""Best: (.+) - (.+) x (\d+) \(est\. 1RM (.+)\)""") { g, tr ->
            "الأفضل: ${tr(g[0])} - ${tr(g[1])} × ${g[2]} (1RM تقديري ${tr(g[3])})"
        },
        rule("""(\d+) sets - (.+) total volume""") { g, tr ->
            "${count(g[0].toIntOrNull() ?: 0, "مجموعة واحدة", "مجموعتان", "مجموعات", "مجموعة")} - ${tr(g[1])} إجمالي الحجم"
        },
        rule("""Also works: (.+)""") { g, tr -> "يعمل أيضًا على: ${commaList(g[0], tr)}" }
    )

    private val inlineRules: List<Pair<Regex, (MatchResult) -> String>> = listOf(
        Regex("""(\d+)s hold""", RegexOption.IGNORE_CASE) to { m -> "ثبات ${m.groupValues[1]}ث" },
        Regex("""(\d+) sets?\b""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "مجموعة واحدة", "مجموعتان", "مجموعات", "مجموعة")
        },
        Regex("""(\d+) reps?\b""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "تكرار واحد", "تكراران", "تكرارات", "تكرارًا")
        },
        Regex("""(\d+) seconds?\b""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "ثانية واحدة", "ثانيتان", "ثوانٍ", "ثانية")
        },
        Regex("""(\d+) exercises?\b""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "تمرين واحد", "تمرينان", "تمارين", "تمرينًا")
        },
        Regex("""(\d+) workouts?\b""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "جلسة واحدة", "جلستان", "جلسات", "جلسة")
        },
        Regex("""(\d+) days/week""", RegexOption.IGNORE_CASE) to { m ->
            val n = m.groupValues[1].toIntOrNull()
            if (n == null) m.value else count(n, "يوم واحد", "يومان", "أيام", "يومًا") + " أسبوعيًا"
        },
        Regex("""(\d+)s\b""") to { m -> "${m.groupValues[1]}ث" },
        Regex("""(\d+)% Target""", RegexOption.IGNORE_CASE) to { m -> "${m.groupValues[1]}% من الهدف" },
        Regex("""\blast: """, RegexOption.IGNORE_CASE) to { _ -> "آخر وزن: " },
        Regex("""\bkg\b""") to { _ -> "كجم" },
        Regex("""\blbs\b""") to { _ -> "رطل" },
        Regex("""\s+x\s+""") to { _ -> " × " }
    )

    fun translate(english: String): String = translate(english, 0)

    private fun translate(english: String, depth: Int): String {
        val trimmed = english.trim()
        if (trimmed.isEmpty()) return english

        dictionary[trimmed.lowercase()]?.let { return it }
        if (depth >= MAX_DEPTH) return applyInline(trimmed)

        val next: (String) -> String = { translate(it, depth + 1) }

        for (rule in rules) {
            val match = rule.regex.matchEntire(trimmed) ?: continue
            return rule.build(match.groupValues.drop(1), next)
        }

        for (separator in listOf(" - ", " | ")) {
            if (trimmed.contains(separator)) {
                return trimmed.split(separator).joinToString(separator) { next(it) }
            }
        }

        return applyInline(trimmed)
    }

    private fun applyInline(text: String): String {
        var result = text
        for ((regex, replacement) in inlineRules) {
            result = regex.replace(result) { replacement(it) }
        }
        return result
    }
}

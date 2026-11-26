package com.benchpr.app.data.i18n

import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.RankTier

/** Arabic wording for the app's fixed content. Keys are the English texts or ids. */
internal object ArabicData {

    /**
     * Rank names use gym slang instead of metals. The ladder, lowest to highest:
     * beginner, working, stud, executioner, beast, ogre, king, legend.
     */
    fun tierName(tier: RankTier): String = when (tier) {
        RankTier.UNRANKED -> "بدون رتبة"
        RankTier.IRON -> "مبتدئ"
        RankTier.BRONZE -> "شغّال"
        RankTier.SILVER -> "فحل"
        RankTier.GOLD -> "جلاد"
        RankTier.PLATINUM -> "وحش"
        RankTier.DIAMOND -> "غول"
        RankTier.MASTER -> "ملك"
        RankTier.LEGEND -> "أسطورة"
    }

    fun muscleName(muscle: MuscleGroup): String = when (muscle) {
        MuscleGroup.CHEST -> "الصدر"
        MuscleGroup.SHOULDERS -> "الأكتاف"
        MuscleGroup.BICEPS -> "الباي"
        MuscleGroup.TRICEPS -> "التراي"
        MuscleGroup.FOREARMS -> "الساعد"
        MuscleGroup.CORE -> "البطن"
        MuscleGroup.TRAPS -> "الترابيس"
        MuscleGroup.LATS -> "الجناح"
        MuscleGroup.LOWER_BACK -> "أسفل الظهر"
        MuscleGroup.GLUTES -> "الأرداف"
        MuscleGroup.QUADS -> "الفخذ الأمامي"
        MuscleGroup.HAMSTRINGS -> "الفخذ الخلفي"
        MuscleGroup.CALVES -> "السمانة"
    }

    /** Exercise id -> (name, description). */
    val exercises: Map<String, Pair<String, String>> = mapOf(
        // Chest
        "ex_bench" to ("بنش برس" to "تمرين مركب بالبار لتقوية عضلات الصدر."),
        "ex_paused_bench" to ("بنش برس بتوقف" to "بنش برس مع توقف ثانية واحدة على الصدر."),
        "ex_incline" to ("ضغط مائل" to "تمرين ضغط يركز على أعلى الصدر."),
        "ex_db_bench" to ("ضغط الصدر بالدمبل" to "ضغط بالدمبل بمدى حركة أعمق. سجّل وزن كل دمبل."),
        "ex_db_incline" to ("ضغط مائل بالدمبل" to "ضغط الدمبل لأعلى الصدر. سجّل وزن كل دمبل."),
        "ex_chest_press_machine" to ("ضغط الصدر بالجهاز" to "ضغط بالجهاز، مناسب للوصول للفشل بأمان."),
        "ex_pec_fly" to ("فراشة الصدر" to "تمرين عزل للصدر لزيادة الحجم."),
        "ex_cable_crossover" to ("تقاطع الكابل" to "تمرين فتح بالكابل يعطي شدًا مستمرًا على الصدر."),
        "ex_pushup" to ("تمرين الضغط" to "تمرين بوزن الجسم للصدر. أضف وزنًا عندما يصبح سهلًا."),
        "ex_static_hold" to ("ثبات بحمل زائد" to "ثبات أيزومتري بحمل زائد في وضع الضغط."),
        // Shoulders
        "ex_ohp" to ("ضغط الأكتاف بالبار" to "ضغط أكتاف صارم بالبار فوق الرأس."),
        "ex_db_shoulder_press" to ("ضغط الأكتاف بالدمبل" to "ضغط بالدمبل جالسًا أو واقفًا. سجّل وزن كل دمبل."),
        "ex_arnold_press" to ("ضغط أرنولد" to "ضغط بالدمبل مع دوران يشغّل رؤوس الكتف الثلاثة."),
        "ex_lateral_raise" to ("رفرفة جانبية" to "تمرين عزل بالدمبل للكتف الجانبي."),
        "ex_front_raise" to ("رفرفة أمامية" to "تمرين عزل للكتف الأمامي."),
        "ex_rear_delt_fly" to ("رفرفة خلفية" to "فتح عكسي للكتف الخلفي وأعلى الظهر."),
        "ex_face_pull" to ("سحب الوجه" to "سحب بالكابل نحو الوجه للكتف الخلفي وصحة الكتف."),
        "ex_upright_row" to ("سحب عمودي" to "سحب بالبار أو الكابل نحو الصدر للأكتاف والترابيس."),
        // Biceps
        "ex_bicep_curl" to ("ثني الباي بالبار" to "التمرين الكلاسيكي لبناء عضلة الباي."),
        "ex_db_curl" to ("ثني الباي بالدمبل" to "ثني بالتبادل أو جالسًا. سجّل وزن كل دمبل."),
        "ex_hammer_curl" to ("ثني المطرقة" to "يبني العضلة العضدية والساعد. سجّل وزن كل دمبل."),
        "ex_preacher_curl" to ("ثني على مقعد بريتشر" to "ثني صارم على مقعد بريتشر للرأس القصير."),
        "ex_incline_curl" to ("ثني الدمبل على مقعد مائل" to "ثني بتمدد للرأس الطويل. سجّل وزن كل دمبل."),
        "ex_cable_curl" to ("ثني الباي بالكابل" to "ثني بشدّ مستمر على الكابل."),
        // Triceps
        "ex_close_grip" to ("ضغط بقبضة ضيقة" to "ضغط مركب يركز بشدة على التراي."),
        "ex_rope_push" to ("دفع الحبل للأسفل" to "تمرين عزل بالكابل لقوة قفل الذراع."),
        "ex_seated_dips" to ("ديبس جالس" to "ديبس بأوزان للتراي وأسفل الصدر."),
        "ex_dips" to ("ديبس" to "ديبس على المتوازي. أضف وزنًا عندما يصبح وزن الجسم سهلًا."),
        "ex_skull_crusher" to ("سكل كراشر" to "تمديد مستلقٍ بالبار المتعرج للرأس الطويل."),
        "ex_overhead_tricep_ext" to ("تمديد التراي فوق الرأس" to "تمديد بالكابل أو الدمبل فوق الرأس."),
        "ex_single_arm" to ("تمديد التراي بذراع واحدة" to "تمديد بذراع واحدة بالكابل أو الدمبل."),
        // Forearms
        "ex_wrist_curl" to ("ثني الرسغ" to "ثني الرسغ بالبار أو الدمبل."),
        "ex_reverse_curl" to ("ثني عكسي" to "ثني بقبضة علوية للساعد والعضدية."),
        // Traps
        "ex_barbell_shrug" to ("هز الأكتاف بالبار" to "هز ثقيل لبناء الترابيس العلوية."),
        "ex_db_shrug" to ("هز الأكتاف بالدمبل" to "هز بالدمبل. سجّل وزن كل دمبل."),
        // Back
        "ex_deadlift" to ("ديدلفت" to "أقوى تمرين مركب لسلسلة العضلات الخلفية."),
        "ex_barbell_row" to ("تجديف بالبار" to "تجديف مركب ثقيل لسُمك منتصف الظهر."),
        "ex_db_row" to ("تجديف بالدمبل" to "تجديف بذراع واحدة. سجّل وزن الدمبل."),
        "ex_seated_row" to ("تجديف بالكابل جالسًا" to "تجديف بالكابل لحجم الجناح ومنتصف الظهر."),
        "ex_tbar_row" to ("تجديف تي بار" to "تجديف تي بار واقفًا أو بإسناد الصدر."),
        "ex_lat_pulldown" to ("سحب أمامي" to "سحب عمودي لعرض الجناح."),
        "ex_pullup" to ("عقلة" to "سحب عمودي بوزن الجسم. أضف وزنًا عندما يصبح سهلًا."),
        "ex_chinup" to ("عقلة بقبضة سفلية" to "عقلة بقبضة سفلية تشرك الباي أكثر."),
        "ex_back_extension" to ("تمديد الظهر" to "تمرين لتقوية عضلات أسفل الظهر."),
        "ex_good_morning" to ("جود مورنينج" to "ثني الوركين بالبار لأسفل الظهر والفخذ الخلفي."),
        // Legs
        "ex_squat" to ("سكوات بالبار" to "ملك تمارين الجزء السفلي المركبة."),
        "ex_front_squat" to ("سكوات أمامي" to "سكوات يركز على الفخذ الأمامي بجذع منتصب."),
        "ex_leg_press" to ("ضغط الأرجل" to "ضغط بالجهاز للفخذ الأمامي والأرداف."),
        "ex_hack_squat" to ("هاك سكوات" to "سكوات بالجهاز يحمّل الفخذ الأمامي."),
        "ex_leg_extension" to ("تمديد الأرجل" to "تمرين عزل للفخذ الأمامي بالجهاز."),
        "ex_lunge" to ("طعنات المشي" to "طعنات بالدمبل. سجّل وزن كل دمبل."),
        "ex_romanian_deadlift" to ("ديدلفت روماني" to "تمرين ثني الوركين للفخذ الخلفي والأرداف."),
        "ex_leg_curl" to ("ثني الأرجل" to "تمرين عزل للفخذ الخلفي بالجهاز."),
        "ex_hip_thrust" to ("هيب ثرست" to "دفع الحوض بالبار، أفضل تمرين للأرداف."),
        "ex_cable_kickback" to ("ركلة خلفية بالكابل" to "تمرين عزل للأرداف بالكابل."),
        "ex_standing_calf" to ("رفع السمانة واقفًا" to "رفع يركز على العضلة التوأمية."),
        "ex_seated_calf" to ("رفع السمانة جالسًا" to "رفع يركز على العضلة النعلية."),
        // Core
        "ex_plank" to ("بلانك" to "ثبات أيزومتري لتثبيت البطن."),
        "ex_hanging_leg_raise" to ("رفع الأرجل من التعلق" to "يقوّي أسفل البطن."),
        "ex_cable_crunch" to ("كرنش بالكابل" to "كرنش بأوزان لعضلات البطن."),
        "ex_ab_wheel" to ("عجلة البطن" to "تمرين للبطن يقاوم تمدد الجذع."),
        "ex_russian_twist" to ("التفاف روسي" to "عمل دوراني للبطن والجوانب.")
    )

    /** Names the original bench program uses for exercises. */
    val programExerciseNames: Map<String, String> = mapOf(
        "Heavy Single" to "رفعة واحدة ثقيلة",
        "Paused Bench" to "بنش بتوقف",
        "Close Grip Bench" to "بنش بقبضة ضيقة",
        "Single Arm" to "ذراع واحدة"
    )

    val programText: Map<String, String> = mapOf(
        "Session 1 - Heavy / Strength" to "الجلسة 1 - ثقيل / قوة",
        "Strength Focus" to "تركيز القوة",
        "get stronger" to "ازداد قوة",
        "Session 2 - Volume / Muscle" to "الجلسة 2 - حجم / عضلات",
        "Hypertrophy Focus" to "تركيز التضخيم",
        "build your chest and pressing volume" to "ابنِ صدرك وحجم الضغط",
        "Session 3 - Technique / Speed" to "الجلسة 3 - تقنية / سرعة",
        "Technique & Speed Focus" to "تركيز التقنية والسرعة",
        "better bench technique + recovery" to "تقنية أفضل في البنش + استشفاء"
    )

    val splitNames: Map<String, String> = mapOf(
        "ppl6" to "دفع / سحب / أرجل (6 أيام)",
        "ppl3" to "دفع / سحب / أرجل (3 أيام)",
        "upper_lower" to "علوي / سفلي (4 أيام)",
        "full_body" to "الجسم الكامل (3 أيام)",
        "bro" to "تقسيمة البرو (5 أيام)",
        "arnold" to "تقسيمة أرنولد (6 أيام)",
        "phul" to "PHUL (4 أيام)",
        "ppl_ul" to "دفع / سحب / أرجل + علوي / سفلي (5 أيام)",
        "five_by_five" to "قوة 5×5 (أ/ب)"
    )

    val splitTaglines: Map<String, String> = mapOf(
        "ppl6" to "كل عضلة مرتين في الأسبوع",
        "ppl3" to "تقسيمة كلاسيكية مع يوم راحة بين الجلسات",
        "upper_lower" to "يوم قوة ثم يوم حجم لكل نصف من الجسم",
        "full_body" to "درّب كل الجسم ثلاث مرات أسبوعيًا",
        "bro" to "مجموعة عضلية واحدة كل يوم بحجم تدريب عالٍ",
        "arnold" to "صدر وظهر، أكتاف وأذرع، أرجل، مرتين أسبوعيًا",
        "phul" to "قوة وتضخيم للجزء العلوي والسفلي",
        "ppl_ul" to "دفع وسحب وأرجل ثم علوي وسفلي",
        "five_by_five" to "بدّل بين تمرينين بسيطين بالبار"
    )

    val splitLevels: Map<String, String> = mapOf(
        "Beginner" to "للمبتدئين",
        "Intermediate" to "للمتوسطين",
        "Advanced" to "للمتقدمين"
    )

    val splitGoals: Map<String, String> = mapOf(
        "Hypertrophy" to "تضخيم",
        "Strength + size" to "قوة + حجم",
        "General strength" to "قوة عامة",
        "Strength" to "قوة"
    )

    val dayNames: Map<String, String> = mapOf(
        "Push A" to "دفع أ", "Push B" to "دفع ب", "Push" to "دفع",
        "Pull A" to "سحب أ", "Pull B" to "سحب ب", "Pull" to "سحب",
        "Legs A" to "أرجل أ", "Legs B" to "أرجل ب", "Legs" to "أرجل",
        "Upper A" to "علوي أ", "Upper B" to "علوي ب", "Upper" to "علوي",
        "Lower A" to "سفلي أ", "Lower B" to "سفلي ب", "Lower" to "سفلي",
        "Full Body A" to "الجسم كامل أ", "Full Body B" to "الجسم كامل ب", "Full Body C" to "الجسم كامل ج",
        "Chest" to "الصدر", "Back" to "الظهر", "Shoulders" to "الأكتاف", "Arms" to "الذراعان",
        "Chest & Back" to "صدر وظهر", "Chest & Back 2" to "صدر وظهر 2",
        "Shoulders & Arms" to "أكتاف وأذرع", "Shoulders & Arms 2" to "أكتاف وأذرع 2",
        "Legs & Abs" to "أرجل وبطن", "Legs & Abs 2" to "أرجل وبطن 2",
        "Upper Power" to "علوي (قوة)", "Lower Power" to "سفلي (قوة)",
        "Upper Hypertrophy" to "علوي (تضخيم)", "Lower Hypertrophy" to "سفلي (تضخيم)",
        "Workout A" to "تمرين أ", "Workout B" to "تمرين ب"
    )

    val dayFocus: Map<String, String> = mapOf(
        "Chest, shoulders, triceps" to "الصدر والأكتاف والتراي",
        "Back, biceps, rear delts" to "الظهر والباي والكتف الخلفي",
        "Quads, hamstrings, calves" to "الفخذ الأمامي والخلفي والسمانة",
        "Shoulders, chest, triceps" to "الأكتاف والصدر والتراي",
        "Lats, traps, biceps" to "الجناح والترابيس والباي",
        "Posterior chain, quads, abs" to "السلسلة الخلفية والفخذ الأمامي والبطن",
        "Strength" to "قوة",
        "Volume" to "حجم",
        "Squat and bench focus" to "تركيز على السكوات والبنش",
        "Deadlift and incline focus" to "تركيز على الديدلفت والضغط المائل",
        "Volume and hinge focus" to "تركيز على الحجم وثني الوركين",
        "Pecs" to "الصدر",
        "Lats, traps, lower back" to "الجناح والترابيس وأسفل الظهر",
        "Delts and traps" to "الأكتاف والترابيس",
        "Biceps, triceps, forearms" to "الباي والتراي والساعد",
        "Antagonist supersets" to "سوبر سيت للعضلات المتقابلة",
        "Delts, biceps, triceps" to "الأكتاف والباي والتراي",
        "Lower body and core" to "الجزء السفلي والبطن",
        "Heavy compounds" to "تمارين مركبة ثقيلة",
        "Volume work" to "عمل بحجم عالٍ",
        "Squat, bench, row" to "سكوات، بنش، تجديف",
        "Squat, press, deadlift" to "سكوات، ضغط، ديدلفت"
    )

    /** Fixed screen text. */
    val ui: Map<String, String> = mapOf(
        // navigation
        "Workouts" to "الجلسات",
        "Splits" to "التقسيمات",
        "Muscles" to "العضلات",
        "Exercises" to "التمارين",
        "History" to "السجل",
        // units
        "kg" to "كجم",
        "lbs" to "رطل",
        // body model
        "FRONT" to "الأمام",
        "BACK" to "الظهر",
        // picker and exercises
        "Pick an exercise" to "اختر تمرينًا",
        "Add exercise" to "إضافة تمرين",
        "Start an exercise" to "ابدأ تمرينًا",
        "Close" to "إغلاق",
        "Search exercises..." to "ابحث عن تمرين...",
        "All" to "الكل",
        "No exercises match your search." to "لا توجد تمارين مطابقة لبحثك.",
        "timed" to "بالوقت",
        "EXERCISE LIBRARY" to "مكتبة التمارين",
        "START THIS EXERCISE" to "ابدأ هذا التمرين",
        // history
        "WORKOUT LOG HISTORY" to "سجل التمارين",
        "Back" to "الظهر",
        "No recorded workouts yet" to "لا توجد تمارين مسجلة بعد",
        "Complete your first program session to track your PR!" to "أكمل أول جلسة لك لتتبع رقمك القياسي!",
        "Delete Log" to "حذف السجل",
        "Expand" to "توسيع",
        "Collapse" to "طي",
        "Completed" to "مكتمل",
        // home
        "BENCH PR TRACKER" to "متتبع رقم البنش",
        "Workout History" to "سجل التمارين",
        "BENCH PR PROGRAM" to "برنامج رقم البنش",
        "QUICK START" to "بدء سريع",
        "Train what you feel like, no plan needed." to "تمرّن على ما تريد، بدون خطة.",
        "START AN EXERCISE" to "ابدأ تمرينًا",
        "EMPTY WORKOUT" to "تمرين فارغ",
        "BROWSE SPLITS" to "تصفّح التقسيمات",
        "TARGET BENCH PR (1RM)" to "هدف رقم البنش (1RM)",
        "Edit Target 1RM" to "تعديل هدف 1RM",
        "BEST RECORDED" to "أفضل رقم مسجل",
        "No logs yet" to "لا سجلات بعد",
        "COMPLETED" to "المكتملة",
        "Set Target Bench PR" to "حدد هدف رقم البنش",
        "Enter your goal single rep max (1RM). Exercise weights in all 3 sessions will auto-scale." to
            "أدخل هدفك لأقصى وزن لتكرار واحد (1RM). ستُضبط أوزان التمارين في الجلسات الثلاث تلقائيًا.",
        "Target Weight" to "الوزن المستهدف",
        "Unit:" to "الوحدة:",
        "Save Target" to "حفظ الهدف",
        "Cancel" to "إلغاء",
        "Language" to "اللغة",
        "Quick Workout" to "تمرين سريع",
        "Freestyle" to "تمرين حر",
        "train what you want" to "تمرّن على ما تريد",
        // muscles
        "MUSCLE RANKS" to "رتب العضلات",
        "ALL MUSCLES" to "كل العضلات",
        "OVERALL RANK" to "الرتبة العامة",
        "Log a workout to get ranked" to "سجّل تمرينًا لتحصل على رتبة",
        "Top tier reached" to "وصلت لأعلى رتبة",
        "Top tier" to "أعلى رتبة",
        "Ranks compare your lifts to your body weight" to "تُقارَن رتبك بأوزانك نسبةً لوزن جسمك",
        "Tap a muscle to see its rank" to "اضغط على عضلة لترى رتبتها",
        "Not ranked yet." to "بدون رتبة بعد.",
        "Bodyweight" to "وزن الجسم",
        "Body weight" to "وزن الجسم",
        "Your muscle ranks are based on how much you lift compared to your body weight." to
            "رتب عضلاتك مبنية على ما ترفعه نسبةً إلى وزن جسمك.",
        "Save" to "حفظ",
        // session
        "No active workout session." to "لا توجد جلسة تمرين نشطة.",
        "FINISH & LOG WORKOUT" to "إنهاء وتسجيل التمرين",
        "Your workout is empty" to "تمرينك فارغ",
        "Add an exercise to start logging sets." to "أضف تمرينًا لتبدأ تسجيل المجموعات.",
        "ADD EXERCISE" to "إضافة تمرين",
        "Discard workout?" to "تجاهل التمرين؟",
        "Discard" to "تجاهل",
        "Keep going" to "تابع",
        "STATIC HOLD TIMER RUNNING" to "مؤقت الثبات يعمل",
        "TIMER PAUSED" to "المؤقت متوقف",
        "ADD SET" to "إضافة مجموعة",
        "REMOVE SET" to "حذف مجموعة",
        // splits
        "TRAINING SPLITS" to "تقسيمات التمرين",
        "Pick a split, open a day and start logging. Weights are filled in from your last session." to
            "اختر تقسيمة وافتح يومًا وابدأ التسجيل. تُملأ الأوزان من آخر جلسة لك.",
        "Split" to "تقسيمة",
        "This split could not be found." to "تعذّر العثور على هذه التقسيمة."
    )
}

import { MuscleGroup, RankTier } from '../types/models';

export function tierNameArabic(tier: RankTier): string {
  switch (tier) {
    case RankTier.UNRANKED: return 'بدون رتبة';
    case RankTier.IRON: return 'مبتدئ';
    case RankTier.BRONZE: return 'شغّال';
    case RankTier.SILVER: return 'فحل';
    case RankTier.GOLD: return 'جلاد';
    case RankTier.PLATINUM: return 'وحش';
    case RankTier.DIAMOND: return 'غول';
    case RankTier.MASTER: return 'ملك';
    case RankTier.LEGEND: return 'أسطورة';
  }
}

export function muscleNameArabic(muscle: MuscleGroup): string {
  switch (muscle) {
    case MuscleGroup.CHEST: return 'الصدر';
    case MuscleGroup.SHOULDERS: return 'الأكتاف';
    case MuscleGroup.BICEPS: return 'الباي';
    case MuscleGroup.TRICEPS: return 'التراي';
    case MuscleGroup.FOREARMS: return 'الساعد';
    case MuscleGroup.CORE: return 'البطن';
    case MuscleGroup.TRAPS: return 'الترابيس';
    case MuscleGroup.LATS: return 'الجناح';
    case MuscleGroup.LOWER_BACK: return 'أسفل الظهر';
    case MuscleGroup.GLUTES: return 'الأرداف';
    case MuscleGroup.QUADS: return 'الفخذ الأمامي';
    case MuscleGroup.HAMSTRINGS: return 'الفخذ الخلفي';
    case MuscleGroup.CALVES: return 'السمانة';
  }
}

export const arabicExercises: Record<string, [string, string]> = {
  ex_bench: ['بنش برس', 'تمرين مركب بالبار لتقوية عضلات الصدر.'],
  ex_paused_bench: ['بنش برس مع توقف', 'بنش برس مع توقف ثانية واحدة على الصدر.'],
  ex_incline: ['ضغط مائل', 'تمرين ضغط يركز على أعلى الصدر.'],
  ex_db_bench: ['ضغط الصدر بالدمبل', 'ضغط بالدمبل بمدى حركة أعمق. سجّل وزن كل دمبل.'],
  ex_db_incline: ['ضغط مائل بالدمبل', 'ضغط الدمبل لأعلى الصدر. سجّل وزن كل دمبل.'],
  ex_chest_press_machine: ['ضغط الصدر بالجهاز', 'ضغط بالجهاز، مناسب للوصول للفشل بأمان.'],
  ex_pec_fly: ['فراشة الصدر', 'تمرين عزل للصدر لزيادة الحجم.'],
  ex_cable_crossover: ['تقاطع الكابل', 'تمرين فتح بالكابل يعطي شدًا مستمرًا على الصدر.'],
  ex_pushup: ['ضغط بوزن الجسم', 'تمرين بوزن الجسم للصدر. أضف وزنًا عندما يصبح سهلًا.'],
  ex_static_hold: ['ثبات الضغط مع حمل زائد', 'ثبات أيزومتري بحمل زائد في وضع الضغط.'],
  ex_ohp: ['ضغط الأكتاف بالبار', 'ضغط أكتاف صارم بالبار فوق الرأس.'],
  ex_db_shoulder_press: ['ضغط الأكتاف بالدمبل', 'ضغط بالدمبل جالسًا أو واقفًا. سجّل وزن كل دمبل.'],
  ex_arnold_press: ['ضغط أرنولد', 'ضغط بالدمبل مع دوران يشغّل رؤوس الكتف الثلاثة.'],
  ex_lateral_raise: ['رفرفة جانبية', 'تمرين عزل بالدمبل للكتف الجانبي.'],
  ex_front_raise: ['رفرفة أمامية', 'تمرين عزل للكتف الأمامي.'],
  ex_rear_delt_fly: ['رفرفة خلفية', 'فتح عكسي للكتف الخلفي وأعلى الظهر.'],
  ex_face_pull: ['سحب الوجه', 'سحب بالكابل نحو الوجه للكتف الخلفي وصحة الكتف.'],
  ex_upright_row: ['سحب عمودي', 'سحب بالبار أو الكابل نحو الصدر للأكتاف والترابيس.'],
  ex_bicep_curl: ['ثني الباي بالبار', 'التمرين الكلاسيكي لبناء عضلة الباي.'],
  ex_db_curl: ['ثني الباي بالدمبل', 'ثني بالتبادل أو جالسًا. سجّل وزن كل دمبل.'],
  ex_hammer_curl: ['ثني المطرقة', 'يبني العضلة العضدية والساعد. سجّل وزن كل دمبل.'],
  ex_preacher_curl: ['ثني على مقعد بريتشر', 'ثني صارم على مقعد بريتشر للرأس القصير.'],
  ex_incline_curl: ['ثني الدمبل على مقعد مائل', 'ثني بتمدد للرأس الطويل. سجّل وزن كل دمبل.'],
  ex_cable_curl: ['ثني الباي بالكابل', 'ثني بشدّ مستمر على الكابل.'],
  ex_close_grip: ['بنش برس بقبضة ضيقة', 'بنش برس مركب يركز بشدة على التراي.'],
  ex_rope_push: ['دفع الحبل للأسفل', 'تمرين عزل بالكابل لقوة قفل الذراع.'],
  ex_seated_dips: ['ديبس بأوزان', 'ديبس بأوزان للتراي وأسفل الصدر.'],
  ex_dips: ['ديبس', 'ديبس على المتوازي. أضف وزنًا عندما يصبح وزن الجسم سهلًا.'],
  ex_skull_crusher: ['سكل كراشر', 'تمديد مستلقٍ بالبار المتعرج للرأس الطويل.'],
  ex_overhead_tricep_ext: ['تمديد التراي فوق الرأس', 'تمديد بالكابل أو الدمبل فوق الرأس.'],
  ex_single_arm: ['تمديد التراي بذراع واحدة', 'تمديد بذراع واحدة بالكابل أو الدمبل.'],
  ex_wrist_curl: ['ثني الرسغ', 'ثني الرسغ بالبار أو الدمبل.'],
  ex_reverse_curl: ['ثني عكسي', 'ثني بقبضة علوية للساعد والعضدية.'],
  ex_barbell_shrug: ['هز الأكتاف بالبار', 'هز ثقيل لبناء الترابيس العلوية.'],
  ex_db_shrug: ['هز الأكتاف بالدمبل', 'هز بالدمبل. سجّل وزن كل دمبل.'],
  ex_deadlift: ['ديدلفت', 'أقوى تمرين مركب لسلسلة العضلات الخلفية.'],
  ex_barbell_row: ['تجديف بالبار', 'تجديف مركب ثقيل لسُمك منتصف الظهر.'],
  ex_db_row: ['تجديف بالدمبل', 'تجديف بذراع واحدة. سجّل وزن الدمبل.'],
  ex_seated_row: ['تجديف بالكابل جالسًا', 'تجديف بالكابل لحجم الجناح ومنتصف الظهر.'],
  ex_tbar_row: ['تجديف تي بار', 'تجديف تي بار واقفًا أو بإسناد الصدر.'],
  ex_lat_pulldown: ['سحب علوي للظهر', 'سحب عمودي لعرض الجناح.'],
  ex_pullup: ['عقلة', 'سحب عمودي بوزن الجسم. أضف وزنًا عندما يصبح سهلًا.'],
  ex_chinup: ['عقلة بقبضة سفلية', 'عقلة بقبضة سفلية تشرك الباي أكثر.'],
  ex_back_extension: ['تمديد الظهر', 'تمرين لتقوية عضلات أسفل الظهر.'],
  ex_good_morning: ['جود مورنينج', 'ثني الوركين بالبار لأسفل الظهر والفخذ الخلفي.'],
  ex_squat: ['سكوات بالبار', 'ملك تمارين الجزء السفلي المركبة.'],
  ex_front_squat: ['سكوات أمامي', 'سكوات يركز على الفخذ الأمامي بجذع منتصب.'],
  ex_leg_press: ['ضغط الأرجل', 'ضغط بالجهاز للفخذ الأمامي والأرداف.'],
  ex_hack_squat: ['هاك سكوات', 'سكوات بالجهاز يحمّل الفخذ الأمامي.'],
  ex_leg_extension: ['تمديد الأرجل', 'تمرين عزل للفخذ الأمامي بالجهاز.'],
  ex_lunge: ['طعنات أمامية بالدمبل', 'طعنات للأرجل والأرداف. سجّل وزن كل دمبل.'],
  ex_romanian_deadlift: ['ديدلفت روماني', 'تمرين ثني الوركين للفخذ الخلفي والأرداف.'],
  ex_leg_curl: ['ثني الأرجل', 'تمرين عزل للفخذ الخلفي بالجهاز.'],
  ex_hip_thrust: ['هيب ثرست', 'دفع الحوض بالبار، أفضل تمرين للأرداف.'],
  ex_cable_kickback: ['ركلة خلفية بالكابل', 'تمرين عزل للأرداف بالكابل.'],
  ex_standing_calf: ['رفع السمانة واقفًا', 'رفع يركز على العضلة التوأمية.'],
  ex_seated_calf: ['رفع السمانة جالسًا', 'رفع يركز على العضلة النعلية.'],
  ex_plank: ['بلانك', 'ثبات أيزومتري لتثبيت البطن.'],
  ex_hanging_leg_raise: ['رفع الأرجل من التعلق', 'يقوّي أسفل البطن.'],
  ex_cable_crunch: ['كرنش بالكابل', 'كرنش بأوزان لعضلات البطن.'],
  ex_ab_wheel: ['عجلة البطن', 'تمرين للبطن يقاوم تمدد الجذع.'],
  ex_russian_twist: ['التفاف روسي', 'عمل دوراني للبطن والجوانب.'],
};

export const programExerciseNames: Record<string, string> = {
  'Heavy Single': 'رفعة واحدة ثقيلة',
  'Paused Bench': 'بنش بتوقف',
  'Close Grip Bench': 'بنش بقبضة ضيقة',
  'Single Arm': 'ذراع واحدة',
};

export const programText: Record<string, string> = {
  'Session 1 - Heavy / Strength': 'الجلسة 1 - ثقيل / قوة',
  'Strength Focus': 'تركيز القوة',
  'get stronger': 'ازداد قوة',
  'Session 2 - Volume / Muscle': 'الجلسة 2 - حجم / عضلات',
  'Hypertrophy Focus': 'تركيز التضخيم',
  'build your chest and pressing volume': 'ابنِ صدرك وحجم الضغط',
  'Session 3 - Technique / Speed': 'الجلسة 3 - تقنية / سرعة',
  'Technique & Speed Focus': 'تركيز التقنية والسرعة',
  'better bench technique + recovery': 'تقنية أفضل في البنش + استشفاء',
};

export const splitNames: Record<string, string> = {
  ppl6: 'دفع / سحب / أرجل (6 أيام)',
  ppl3: 'دفع / سحب / أرجل (3 أيام)',
  upper_lower: 'علوي / سفلي (4 أيام)',
  full_body: 'الجسم الكامل (3 أيام)',
  bro: 'تقسيمة البرو (5 أيام)',
  arnold: 'تقسيمة أرنولد (6 أيام)',
  phul: 'PHUL (4 أيام)',
  ppl_ul: 'دفع / سحب / أرجل + علوي / سفلي (5 أيام)',
  five_by_five: 'قوة 5×5 (أ/ب)',
};

export const splitTaglines: Record<string, string> = {
  ppl6: 'كل عضلة مرتين في الأسبوع',
  ppl3: 'تقسيمة كلاسيكية مع يوم راحة بين الجلسات',
  upper_lower: 'يوم قوة ثم يوم حجم لكل نصف من الجسم',
  full_body: 'درّب كل الجسم ثلاث مرات أسبوعيًا',
  bro: 'مجموعة عضلية واحدة كل يوم بحجم تدريب عالٍ',
  arnold: 'صدر وظهر، أكتاف وأذرع، أرجل، مرتين أسبوعيًا',
  phul: 'قوة وتضخيم للجزء العلوي والسفلي',
  ppl_ul: 'دفع وسحب وأرجل ثم علوي وسفلي',
  five_by_five: 'بدّل بين تمرينين بسيطين بالبار',
};

export const splitLevels: Record<string, string> = {
  Beginner: 'للمبتدئين',
  Intermediate: 'للمتوسطين',
  Advanced: 'للمتقدمين',
};

export const splitGoals: Record<string, string> = {
  Hypertrophy: 'تضخيم',
  'Strength + size': 'قوة + حجم',
  'General strength': 'قوة عامة',
  Strength: 'قوة',
};

export const dayNames: Record<string, string> = {
  'Push A': 'دفع أ', 'Push B': 'دفع ب', Push: 'دفع',
  'Pull A': 'سحب أ', 'Pull B': 'سحب ب', Pull: 'سحب',
  'Legs A': 'أرجل أ', 'Legs B': 'أرجل ب', Legs: 'أرجل',
  'Upper A': 'علوي أ', 'Upper B': 'علوي ب', Upper: 'علوي',
  'Lower A': 'سفلي أ', 'Lower B': 'سفلي ب', Lower: 'سفلي',
  'Full Body A': 'الجسم كامل أ', 'Full Body B': 'الجسم كامل ب', 'Full Body C': 'الجسم كامل ج',
  Chest: 'الصدر', Back: 'الظهر', Shoulders: 'الأكتاف', Arms: 'الذراعان',
  'Chest & Back': 'صدر وظهر', 'Chest & Back 2': 'صدر وظهر 2',
  'Shoulders & Arms': 'أكتاف وأذرع', 'Shoulders & Arms 2': 'أكتاف وأذرع 2',
  'Legs & Abs': 'أرجل وبطن', 'Legs & Abs 2': 'أرجل وبطن 2',
  'Upper Power': 'علوي (قوة)', 'Lower Power': 'سفلي (قوة)',
  'Upper Hypertrophy': 'علوي (تضخيم)', 'Lower Hypertrophy': 'سفلي (تضخيم)',
  'Workout A': 'تمرين أ', 'Workout B': 'تمرين ب',
};

export const dayFocus: Record<string, string> = {
  'Chest, shoulders, triceps': 'الصدر والأكتاف والتراي',
  'Back, biceps, rear delts': 'الظهر والباي والكتف الخلفي',
  'Quads, hamstrings, calves': 'الفخذ الأمامي والخلفي والسمانة',
  'Shoulders, chest, triceps': 'الأكتاف والصدر والتراي',
  'Lats, traps, biceps': 'الجناح والترابيس والباي',
  'Posterior chain, quads, abs': 'السلسلة الخلفية والفخذ الأمامي والبطن',
  Strength: 'قوة',
  Volume: 'حجم',
  'Squat and bench focus': 'تركيز على السكوات والبنش',
  'Deadlift and incline focus': 'تركيز على الديدلفت والضغط المائل',
  'Volume and hinge focus': 'تركيز على الحجم وثني الوركين',
  Pecs: 'الصدر',
  'Lats, traps, lower back': 'الجناح والترابيس وأسفل الظهر',
  'Delts and traps': 'الأكتاف والترابيس',
  'Biceps, triceps, forearms': 'الباي والتراي والساعد',
  'Antagonist supersets': 'سوبر سيت للعضلات المتقابلة',
  'Delts, biceps, triceps': 'الأكتاف والباي والتراي',
  'Lower body and core': 'الجزء السفلي والبطن',
  'Heavy compounds': 'تمارين مركبة ثقيلة',
  'Volume work': 'عمل بحجم عالٍ',
  'Squat, bench, row': 'سكوات، بنش، تجديف',
  'Squat, press, deadlift': 'سكوات، ضغط، ديدلفت',
};

export const uiStrings: Record<string, string> = {
  Account: 'الحساب',
  'Sign in with Google': 'تسجيل الدخول بحساب Google',
  'Sign Out': 'تسجيل الخروج',
  'Signed in with Google': 'مسجّل الدخول بحساب Google',
  'Not signed in': 'لم تسجّل الدخول',
  'Sign in to sync your workouts across devices.': 'سجّل الدخول لمزامنة تمارينك على كل أجهزتك.',
  Athlete: 'رياضي',
  "Couldn't sign in. Please try again.": 'تعذّر تسجيل الدخول. حاول مرة أخرى.',
  "Couldn't sign out. Please try again.": 'تعذّر تسجيل الخروج. حاول مرة أخرى.',
  Workouts: 'الجلسات',
  Splits: 'التقسيمات',
  Muscles: 'العضلات',
  Exercises: 'التمارين',
  History: 'السجل',
  kg: 'كجم',
  lbs: 'رطل',
  FRONT: 'الأمام',
  BACK: 'الظهر',
  'Pick an exercise': 'اختر تمرينًا',
  'Add exercise': 'إضافة تمرين',
  'Start an exercise': 'ابدأ تمرينًا',
  Close: 'إغلاق',
  'Search exercises...': 'ابحث عن تمرين...',
  All: 'الكل',
  'No exercises match your search.': 'لا توجد تمارين مطابقة لبحثك.',
  timed: 'بالوقت',
  'EXERCISE LIBRARY': 'مكتبة التمارين',
  'START THIS EXERCISE': 'ابدأ هذا التمرين',
  'WORKOUT LOG HISTORY': 'سجل التمارين',
  Back: 'الظهر',
  'No recorded workouts yet': 'لا توجد تمارين مسجلة بعد',
  'Complete your first program session to track your PR!': 'أكمل أول جلسة لك لتتبع رقمك القياسي!',
  'Delete Log': 'حذف السجل',
  Expand: 'توسيع',
  Collapse: 'طي',
  Completed: 'مكتمل',
  'BENCH PR TRACKER': 'متتبع رقم البنش',
  'Workout History': 'سجل التمارين',
  'BENCH PR PROGRAM': 'برنامج رقم البنش',
  'QUICK START': 'بدء سريع',
  'Train what you feel like, no plan needed.': 'تمرّن على ما تريد، بدون خطة.',
  'START AN EXERCISE': 'ابدأ تمرينًا',
  'EMPTY WORKOUT': 'تمرين فارغ',
  'BROWSE SPLITS': 'تصفّح التقسيمات',
  'TARGET BENCH PR (1RM)': 'هدف رقم البنش (1RM)',
  'Edit Target 1RM': 'تعديل هدف 1RM',
  'BEST RECORDED': 'أفضل رقم مسجل',
  'No logs yet': 'لا سجلات بعد',
  COMPLETED: 'المكتملة',
  'Set Target Bench PR': 'حدد هدف رقم البنش',
  'Enter your goal single rep max (1RM). Exercise weights in all 3 sessions will auto-scale.':
    'أدخل هدفك لأقصى وزن لتكرار واحد (1RM). ستُضبط أوزان التمارين في الجلسات الثلاث تلقائيًا.',
  'Target Weight': 'الوزن المستهدف',
  'Unit:': 'الوحدة:',
  'Save Target': 'حفظ الهدف',
  Cancel: 'إلغاء',
  Language: 'اللغة',
  'Quick Workout': 'تمرين سريع',
  Freestyle: 'تمرين حر',
  'train what you want': 'تمرّن على ما تريد',
  'MUSCLE RANKS': 'رتب العضلات',
  'ALL MUSCLES': 'كل العضلات',
  'OVERALL RANK': 'الرتبة العامة',
  'Log a workout to get ranked': 'سجّل تمرينًا لتحصل على رتبة',
  'Top tier reached': 'وصلت لأعلى رتبة',
  'Top tier': 'أعلى رتبة',
  'Ranks compare your lifts to your body weight': 'تُقارَن رتبك بأوزانك نسبةً لوزن جسمك',
  'Tap a muscle to see its rank': 'اضغط على عضلة لترى رتبتها',
  'Not ranked yet.': 'بدون رتبة بعد.',
  Bodyweight: 'وزن الجسم',
  'Body weight': 'وزن الجسم',
  'Your muscle ranks are based on how much you lift compared to your body weight.':
    'رتب عضلاتك مبنية على ما ترفعه نسبةً إلى وزن جسمك.',
  Save: 'حفظ',
  'No active workout session.': 'لا توجد جلسة تمرين نشطة.',
  'FINISH & LOG WORKOUT': 'إنهاء وتسجيل التمرين',
  'Your workout is empty': 'تمرينك فارغ',
  'Add an exercise to start logging sets.': 'أضف تمرينًا لتبدأ تسجيل المجموعات.',
  'ADD EXERCISE': 'إضافة تمرين',
  'Discard workout?': 'تجاهل التمرين؟',
  Discard: 'تجاهل',
  'Keep going': 'تابع',
  'STATIC HOLD TIMER RUNNING': 'مؤقت الثبات يعمل',
  'TIMER PAUSED': 'المؤقت متوقف',
  'ADD SET': 'إضافة مجموعة',
  'REMOVE SET': 'حذف مجموعة',
  'TRAINING SPLITS': 'تقسيمات التمرين',
  'Pick a split, open a day and start logging. Weights are filled in from your last session.':
    'اختر تقسيمة وافتح يومًا وابدأ التسجيل. تُملأ الأوزان من آخر جلسة لك.',
  Split: 'تقسيمة',
  'This split could not be found.': 'تعذّر العثور على هذه التقسيمة.',
  'TARGET SQUAT PR (1RM)': 'هدف رقم السكوات (1RM)',
  'TARGET DEADLIFT PR (1RM)': 'هدف رقم الديدلفت (1RM)',
  'TARGET PRS (1RM)': 'أهداف الأرقام القياسية (1RM)',
  'Set Target PRs': 'حدد أهداف الأرقام القياسية',
  'Enter your goal single rep max (1RM) targets. Bench session weights auto-scale from your Bench PR.':
    'أدخل أهدافك لأقصى وزن لتكرار واحد (1RM). ستُضبط أوزان جلسات البنش تلقائيًا من هدف البنش.',
  'Bench 1RM': 'بنش 1RM',
  'Squat 1RM': 'سكوات 1RM',
  'Deadlift 1RM': 'ديدلفت 1RM',
  Bench: 'البنش',
  Squat: 'السكوات',
  Deadlift: 'الديدلفت',
  'Target Total': 'المجموع المستهدف',
  Best: 'الأفضل',
  'Edit Target PRs': 'تعديل أهداف 1RM',
  'ESTIMATED 1RM TREND (30D)': 'اتجاه 1RM التقديري (30 يومًا)',
  'Peak daily Epley 1RM across main lifts': 'أعلى 1RM يومي مقدّر للرفعات الرئيسية',
  'No main lift logs in the last 30 days': 'لا توجد سجلات للرفعات الرئيسية في آخر 30 يومًا',
  'Log Bench, Squat, or Deadlift sets to see your 30-day estimated 1RM progression.':
    'سجّل مجموعات البنش أو السكوات أو الديدلفت لعرض تطور 1RM التقديري خلال 30 يومًا.',
  'Est. 1RM': '1RM تقديري',
  'Goal reached!': 'تم تحقيق الهدف!',
  ETA: 'الوقت المتوقع',
  'Est.': 'تقديري',
  'Log to estimate': 'سجّل للتقدير',
  'TIME TO TARGET 1RM': 'الوقت المتوقع للوصول إلى 1RM',
  wk: 'أسبوع',
  pace: 'الوتيرة',
  'typical pace': 'وتيرة معتادة',
  days: 'أيام',
  wks: 'أسابيع',
  mos: 'أشهر',
  yrs: 'سنوات',
  List: 'القائمة',
  Calendar: 'التقويم',
  'Current Streak': 'السلسلة الحالية',
  'This Month': 'هذا الشهر',
  'Active Days': 'أيام التدريب',
  Today: 'اليوم',
  'Previous Month': 'الشهر السابق',
  'Next Month': 'الشهر التالي',
  'Rest day — no workouts logged on this date.': 'يوم راحة — لم يتم تسجيل أي تمارين في هذا اليوم.',
  'Completed Day': 'يوم تدريب مكتمل',
  'Multi-session': 'أكثر من جلسة',
  day: 'يوم',
  'Enter your goal single rep max (1RM) targets for Bench, Squat, and Deadlift.':
    'أدخل أهدافك لأقصى وزن لتكرار واحد (1RM) للبنش والسكوات والديدلفت.',
  'Search by name or target muscle...': 'ابحث بالاسم أو العضلة المستهدفة...',
  'Clear search': 'مسح البحث',
  'Reset filters': 'إعادة ضبط الفلاتر',
  exercises: 'تمارين',
};

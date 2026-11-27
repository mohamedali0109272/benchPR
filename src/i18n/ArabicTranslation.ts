import { ALL_MUSCLE_GROUPS, MUSCLE_DISPLAY_NAMES } from '../types/models';
import { PRESET_EXERCISES } from '../data/ExerciseLibrary';
import { RANK_TIERS } from '../data/RankingEngine';
import { ALL_SPLITS } from '../data/Splits';
import {
  arabicExercises,
  dayFocus,
  dayNames,
  muscleNameArabic,
  programExerciseNames,
  programText,
  splitGoals,
  splitLevels,
  splitNames,
  splitTaglines,
  tierNameArabic,
  uiStrings,
} from './ArabicData';

const MAX_DEPTH = 4;

type RuleBuilder = (groups: string[], tr: (s: string) => string) => string;

interface Rule {
  regex: RegExp;
  build: RuleBuilder;
}

function countArabic(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

function commaList(value: string, tr: (s: string) => string): string {
  return value.split(', ').map((p) => tr(p)).join('، ');
}

const dictionary: Map<string, string> = (() => {
  const map = new Map<string, string>();
  const put = (en: string, ar: string) => {
    map.set(en.trim().toLowerCase(), ar);
  };

  for (const [en, ar] of Object.entries(uiStrings)) put(en, ar);
  for (const [en, ar] of Object.entries(programText)) put(en, ar);
  for (const [en, ar] of Object.entries(splitLevels)) put(en, ar);
  for (const [en, ar] of Object.entries(splitGoals)) put(en, ar);
  for (const [en, ar] of Object.entries(dayNames)) put(en, ar);
  for (const [en, ar] of Object.entries(dayFocus)) put(en, ar);
  for (const [en, ar] of Object.entries(programExerciseNames)) put(en, ar);

  for (const m of ALL_MUSCLE_GROUPS) {
    put(MUSCLE_DISPLAY_NAMES[m], muscleNameArabic(m));
  }
  for (const t of RANK_TIERS) {
    put(t.displayName, tierNameArabic(t.tier));
  }
  for (const item of PRESET_EXERCISES) {
    const pair = arabicExercises[item.id];
    if (pair) {
      put(item.name, pair[0]);
      put(item.description, pair[1]);
    }
  }
  for (const split of ALL_SPLITS) {
    if (splitNames[split.id]) put(split.name, splitNames[split.id]);
    if (splitTaglines[split.id]) put(split.tagline, splitTaglines[split.id]);
  }
  return map;
})();

const rules: Rule[] = [
  { regex: /^START SESSION (\d+)$/i, build: (g) => `ابدأ الجلسة ${g[0]}` },
  { regex: /^START (.+)$/i, build: (g, tr) => `ابدأ ${tr(g[0])}` },
  { regex: /^SET (\d+)$/i, build: (g) => `المجموعة ${g[0]}` },
  {
    regex: /^Set (\d+): (.+) x (\d+) reps$/i,
    build: (g, tr) =>
      `المجموعة ${g[0]}: ${tr(g[1])} × ${countArabic(parseInt(g[2], 10) || 0, 'تكرار واحد', 'تكراران', 'تكرارات', 'تكرارًا')}`,
  },
  { regex: /^Target 1RM: (.+)$/i, build: (g, tr) => `1RM المستهدف: ${tr(g[0])}` },
  { regex: /^Duration: (\d+)m$/i, build: (g) => `المدة: ${g[0]} د` },
  { regex: /^Avg RPE: (.+)$/i, build: (g) => `متوسط الجهد (RPE): ${g[0]}` },
  { regex: /^Main goal: (.+)$/i, build: (g, tr) => `الهدف الأساسي: ${tr(g[0])}` },
  { regex: /^Goal: (.+)$/i, build: (g, tr) => `الهدف: ${tr(g[0])}` },
  { regex: /^(\d+) \/ (\d+) sets done$/i, build: (g) => `تم إنجاز ${g[0]} من ${g[1]} مجموعة` },
  {
    regex: /^You have (\d+) completed sets that have not been saved\.$/i,
    build: (g) => `عدد المجموعات المكتملة التي لم تُحفظ: ${g[0]}`,
  },
  { regex: /^Next: (.+)$/i, build: (g, tr) => `التالي: ${tr(g[0])}` },
  { regex: /^Body weight: (.+)$/i, build: (g, tr) => `وزن الجسم: ${tr(g[0])}` },
  { regex: /^Body weight \((.+)\)$/i, build: (g, tr) => `وزن الجسم (${tr(g[0])})` },
  {
    regex: /^Not ranked yet\. Log sets of (.+) to get a rank\.$/i,
    build: (g, tr) => `بدون رتبة بعد. سجّل مجموعات من ${commaList(g[0], tr)} لتحصل على رتبة.`,
  },
  { regex: /^Strength score (.+)$/i, build: (g) => `درجة القوة ${g[0]}` },
  { regex: /^(\d+)% to (.+)$/i, build: (g, tr) => `${g[0]}% للوصول إلى ${tr(g[1])}` },
  {
    regex: /^Best: (.+) - (.+) x (\d+) \(est\. 1RM (.+)\)$/i,
    build: (g, tr) => `الأفضل: ${tr(g[0])} - ${tr(g[1])} × ${g[2]} (1RM تقديري ${tr(g[3])})`,
  },
  {
    regex: /^(\d+) sets - (.+) total volume$/i,
    build: (g, tr) =>
      `${countArabic(parseInt(g[0], 10) || 0, 'مجموعة واحدة', 'مجموعتان', 'مجموعات', 'مجموعة')} - ${tr(g[1])} إجمالي الحجم`,
  },
  { regex: /^Also works: (.+)$/i, build: (g, tr) => `يعمل أيضًا على: ${commaList(g[0], tr)}` },
];

const inlineRules: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/(\d+)s hold/gi, (m) => `ثبات ${m[1]}ث`],
  [
    /(\d+) sets?\b/gi,
    (m) => countArabic(parseInt(m[1], 10), 'مجموعة واحدة', 'مجموعتان', 'مجموعات', 'مجموعة'),
  ],
  [
    /(\d+) reps?\b/gi,
    (m) => countArabic(parseInt(m[1], 10), 'تكرار واحد', 'تكراران', 'تكرارات', 'تكرارًا'),
  ],
  [
    /(\d+) seconds?\b/gi,
    (m) => countArabic(parseInt(m[1], 10), 'ثانية واحدة', 'ثانيتان', 'ثوانٍ', 'ثانية'),
  ],
  [
    /(\d+) exercises?\b/gi,
    (m) => countArabic(parseInt(m[1], 10), 'تمرين واحد', 'تمرينان', 'تمارين', 'تمرينًا'),
  ],
  [
    /(\d+) workouts?\b/gi,
    (m) => countArabic(parseInt(m[1], 10), 'جلسة واحدة', 'جلستان', 'جلسات', 'جلسة'),
  ],
  [
    /(\d+) days\/week/gi,
    (m) => `${countArabic(parseInt(m[1], 10), 'يوم واحد', 'يومان', 'أيام', 'يومًا')} أسبوعيًا`,
  ],
  [/(\d+)s\b/g, (m) => `${m[1]}ث`],
  [/(\d+)% Target/gi, (m) => `${m[1]}% من الهدف`],
  [/\blast: /gi, () => 'آخر وزن: '],
  [/\bkg\b/g, () => 'كجم'],
  [/\blbs\b/g, () => 'رطل'],
  [/\s+x\s+/g, () => ' × '],
];

function applyInline(text: string): string {
  let result = text;
  for (const [regex, replacement] of inlineRules) {
    result = result.replace(regex, (...args) => replacement(args as unknown as RegExpMatchArray));
  }
  return result;
}

function translateDepth(english: string, depth: number): string {
  const trimmed = english.trim();
  if (!trimmed) return english;

  const exact = dictionary.get(trimmed.toLowerCase());
  if (exact !== undefined) return exact;
  if (depth >= MAX_DEPTH) return applyInline(trimmed);

  const next = (s: string) => translateDepth(s, depth + 1);

  for (const rule of rules) {
    const match = trimmed.match(rule.regex);
    if (match) {
      return rule.build(match.slice(1), next);
    }
  }

  for (const sep of [' - ', ' | ']) {
    if (trimmed.includes(sep)) {
      return trimmed.split(sep).map(next).join(sep);
    }
  }

  return applyInline(trimmed);
}

const cache = new Map<string, string>();

export function translateToArabic(english: string): string {
  if (!english) return english;
  const cached = cache.get(english);
  if (cached !== undefined) return cached;
  const translated = translateDepth(english, 0);
  cache.set(english, translated);
  return translated;
}

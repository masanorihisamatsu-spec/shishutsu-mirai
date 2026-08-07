/**
 * OCRで認識した店舗名から、カテゴリをルールベースで推定する。
 * frontend/src/lib/analysis/convenience-stores.ts と同じ「店舗名キーワードの部分一致」方式。
 */
const CATEGORY_KEYWORD_RULES: { category: string; keywords: string[] }[] = [
  {
    category: "食費",
    keywords: [
      "スーパー",
      "イオン",
      "イトーヨーカドー",
      "コンビニ",
      "セブンイレブン",
      "ファミリーマート",
      "ローソン",
      "スターバックス",
      "マクドナルド",
    ],
  },
  {
    category: "日用品",
    keywords: ["ドラッグストア", "マツモトキヨシ", "ウエルシア", "ホームセンター"],
  },
  {
    category: "交通費",
    keywords: [
      "JR",
      "地下鉄",
      "タクシー",
      "Suica",
      "ICOCA",
      "パーキング",
      "駐車場",
      "駐車",
      "PARKING",
      "コインパーク",
      "タイムズ",
    ],
  },
  {
    category: "医療費",
    keywords: ["病院", "クリニック", "薬局", "調剤"],
  },
  {
    category: "趣味",
    keywords: ["映画", "Amazon", "ゲーム", "書店"],
  },
];

/**
 * 店舗名からカテゴリを推定する。マッチしない場合や、推定したカテゴリ名が
 * availableCategories（現在登録されているカテゴリ一覧）に存在しない場合は null を返す。
 */
export function guessCategoryFromStoreName(
  storeName: string,
  availableCategories: string[]
): string | null {
  const rule = CATEGORY_KEYWORD_RULES.find((r) => r.keywords.some((keyword) => storeName.includes(keyword)));
  if (!rule) return null;

  return availableCategories.includes(rule.category) ? rule.category : null;
}

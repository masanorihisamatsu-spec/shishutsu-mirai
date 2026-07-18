export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

/** "2026-04" のような <input type="month"> の値を "2026年4月" 表記に変換する */
export function formatMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split("-");
  if (!year || !month) return monthValue;
  return `${year}年${Number(month)}月`;
}

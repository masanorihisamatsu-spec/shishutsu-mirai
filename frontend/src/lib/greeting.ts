export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "おはようございます";
  if (hour >= 11 && hour < 17) return "こんにちは";
  return "こんばんは";
}

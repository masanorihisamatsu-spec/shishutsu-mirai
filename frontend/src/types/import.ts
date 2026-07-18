export type ImportMethodId = "receipt" | "pdf" | "csv" | "excel";

export interface ImportMethod {
  id: ImportMethodId;
  title: string;
  description?: string;
  /** CSVカードなど、対応している具体的な提供元がある場合のみ */
  supportedSources?: string[];
  actionLabel: string;
}

export interface UpcomingIntegration {
  id: string;
  label: string;
}

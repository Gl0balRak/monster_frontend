export interface LSIItem {
  ngram: string;
  forms?: string[];
  competitors: number;
  avg_count: number;
  my_count: number;
  coverage_percent: number;
}

export const mockLSIData: LSIItem[] = [
  {
    ngram: "семантический анализ",
    forms: ["семантического анализа", "семантическому анализу"],
    competitors: 5,
    avg_count: 12.5,
    my_count: 8,
    coverage_percent: 64
  },
  {
    ngram: "поисковые запросы",
    forms: ["поисковых запросов", "поисковым запросам"],
    competitors: 8,
    avg_count: 18.2,
    my_count: 15,
    coverage_percent: 82
  },
  {
    ngram: "ключевые слова",
    forms: ["ключевых слов", "ключевым словам"],
    competitors: 3,
    avg_count: 25.7,
    my_count: 0,
    coverage_percent: 0
  },
  {
    ngram: "веб аналитика",
    forms: ["веб аналитики", "веб аналитике"],
    competitors: 6,
    avg_count: 9.3,
    my_count: 12,
    coverage_percent: 129
  },
  // больше данных для тестирования пагинации
  ...Array.from({ length: 20 }, (_, i) => ({
    ngram: `тестовый термин ${i + 5}`,
    forms: [`форма ${i + 5}`],
    competitors: i % 8 + 1,
    avg_count: i * 2 + 5,
    my_count: i + 2,
    coverage_percent: Math.round(((i + 2) / (i * 2 + 5)) * 100)
  }))
];
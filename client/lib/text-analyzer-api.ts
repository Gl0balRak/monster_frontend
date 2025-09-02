import { API_ENDPOINTS } from "@/config/api.config.js";

// Types based on the backend schemas
export interface AnalysisRequest {
  check_ai?: boolean;
  check_spelling?: boolean;
  check_uniqueness?: boolean;
  page_url?: string;
  main_query: string;
  additional_queries?: string[];
  parse_saved_copies?: boolean;
  search_engine?: "yandex" | "google";
  region?: string;
  top_size?: number;
  excluded_words?: string[];
  auto_update?: boolean;
  update_interval_sec?: number;
  median_mode?: boolean;
}

export interface CompetitorResult {
  position: number;
  url: string;
  parsed_data: {
    word_count_in_a?: number;
    word_count_outside_a?: number;
    text_fragments_count?: number;
    total_visible_words?: number;
  };
  status: string;
  parsed_from?: "saved_copy" | "original" | string;
  fallback_used?: boolean;
}

export interface MySiteAnalysis {
  url: string;
  parsed_data: {
    word_count_in_a?: number;
    word_count_outside_a?: number;
    text_fragments_count?: number;
    total_visible_words?: number;
  } | null;
  status: string;
  error?: string;
}

export interface AnalysisResult {
  task_id: string;
  my_page: MySiteAnalysis | null;
  competitors: CompetitorResult[];
  analysis_data: {
    main_query: string;
    additional_queries: string[];
  };
  summary: {
    my_page_analyzed: boolean;
    my_page_success: boolean;
    competitors_found: number;
    competitors_successful: number;
    total_pages_analyzed: number;
  };
  error?: string;
}

export interface ProgressEvent {
  type: string;
  [key: string]: any;
}

export interface SinglePageAnalysis {
  url?: string;
  word_count_in_a?: number;
  word_count_outside_a?: number;
  total_visible_words?: number;
  text_fragments_count?: number;
  error?: string;
}

export interface LSIAnalysisRequest {
  competitor_urls: string[];
  my_url: string;
  n?: number;
  top_k?: number;
  exact_phrases?: boolean;
  median_mode?: boolean;
  main_query?: string;
  additional_queries?: string[];
}

export interface LSIItem {
  ngram: string;
  competitors: number;
  avg_count: number;
  my_count: number;
  coverage_percent: number;
}

export interface LSIAnalysisResult {
  ngrams: LSIItem[];
  total_competitors: number;
  filtered_count: number;
  query_words_filtered: number;
  median_mode: boolean;
  error?: string;
}

export interface KeywordsAnalysisRequest {
  competitor_urls: string[];
  my_url: string;
  main_query: string;
  additional_queries?: string[];
  search_engine?: "yandex" | "google";
}

export interface KeywordData {
  keyword: string;
  [key: string]: any; // Для динамических полей тегов
}

export interface TotalWordsData {
  [key: string]: number;
}

export interface KeywordsAnalysisResult {
  table: KeywordData[];
  total_words: TotalWordsData;
  search_engine: string;
  tags_used: string[];
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
}

// Text Analyzer API functions
export const textAnalyzerApi = {
  // Start analysis
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    return apiCall<AnalysisResult>(API_ENDPOINTS.analyzer.analyzeATags, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Get progress stream (SSE)
  getProgressStream(taskId: string): EventSource {
    const url = `${API_ENDPOINTS.analyzer.analyzeATagsProgress}?task_id=${taskId}`;
    return new EventSource(url);
  },

  // Analyze single page
  async analyzeSinglePage(url: string): Promise<SinglePageAnalysis> {
    const endpoint = `${API_ENDPOINTS.analyzer.analyzeSinglePage}?url=${encodeURIComponent(url)}`;
    return apiCall<SinglePageAnalysis>(endpoint, {
      method: "POST",
    });
  },

  // LSI Analysis
  async analyzeLSI(request: LSIAnalysisRequest): Promise<LSIAnalysisResult> {
    return apiCall<LSIAnalysisResult>(API_ENDPOINTS.analyzer.compareNgrams, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Keywords Analysis
  async analyzeKeywords(
    request: KeywordsAnalysisRequest,
  ): Promise<KeywordsAnalysisResult> {
    return apiCall<KeywordsAnalysisResult>(
      API_ENDPOINTS.analyzer.keywordsAnalyzeFull,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  },
};

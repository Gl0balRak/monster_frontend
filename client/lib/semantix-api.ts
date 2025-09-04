// API для работы с Семантиксом
const API_BASE_URL = "http://localhost:7000";

// Типы данных
export interface SemanticQuery {
  id: number;
  query: string;
  group?: string;
  w?: number;
  w_quoted?: number;
  not_w?: number;
  demand?: number;
  clicks?: number;
  competition?: string;
  commerce?: number;
  relevant_page?: string;
  position?: number;
}

export interface ParseResponse {
  success: boolean;
  message: string;
  data: SemanticQuery[];
  total_count: number;
  requires_auth?: boolean;
  auth_url?: string;
}

export interface TaskStatus {
  success: boolean;
  tasks: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
  total_tasks: number;
}

export interface Region {
  value: string;
  label: string;
}

// Мок-функция для получения токена
const getAuthToken = () => "Bearer " + localStorage.getItem("access_token");

// Базовая функция для API запросов
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: getAuthToken(),
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Функция для построения query параметров
function buildQueryParams(params: Record<string, string>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

export const semantixApi = {
  // Получение таблицы ключевых слов
  async refreshKeywords(): Promise<ParseResponse> {
    return apiCall<ParseResponse>("/semantix/service/keywords/refresh", {
      method: "POST",
    });
  },

  // Парсинг ключевых слов
  async parseKeywords(params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      competitors: params.competitors || "",
      services: params.services || "",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/parse?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Чистка ключевых слов
  async cleanKeywords(params: {
    region: string;
    domain: string;
    cleaning_settings?: string;
    stop_words?: string;
    exclude_cities?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      cleaning_settings: params.cleaning_settings || "",
      stop_words: params.stop_words || "",
      exclude_cities: params.exclude_cities || "",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/clean?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Парсинг поисковых подсказок
  async parseSearchSuggestions(params: {
    region: string;
    domain: string;
    target?: string;
    search_suggestions_method?: string;
    search_suggestions_engine?: string;
    search_suggestions_depth?: string;
    search_suggestions_exclude_porn?: string;
    search_suggestions_exclude_news?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      target: params.target || "Не корзина",
      search_suggestions_method: params.search_suggestions_method || "",
      search_suggestions_engine: params.search_suggestions_engine || "",
      search_suggestions_depth: params.search_suggestions_depth || "",
      search_suggestions_exclude_porn:
        params.search_suggestions_exclude_porn || "",
      search_suggestions_exclude_news:
        params.search_suggestions_exclude_news || "",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/search-suggestions?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Парсинг частот
  async parseFrequencies(params: {
    region: string;
    domain: string;
    target?: string;
    competitors?: string;
    parse_w?: string;
    parse_not_w?: string;
    parse_w_quoted?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      target: params.target || "Не корзина",
      competitors: params.competitors || "",
      parse_w: params.parse_w || "false",
      parse_not_w: params.parse_not_w || "false",
      parse_w_quoted: params.parse_w_quoted || "false",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/frequencies?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Загрузка спроса и кликов
  async loadDemandAndClicks(params: {
    region: string;
    domain: string;
    services?: string;
    target?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      services: params.services || "",
      target: params.target || "Не корзина",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/demand-clicks?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Проверка конкурентности
  async checkCompetition(params: {
    region: string;
    domain: string;
    competitors?: string;
    target?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      competitors: params.competitors || "",
      target: params.target || "Не корзина",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/competition?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Проверка коммерциализации
  async checkCommercialization(params: {
    region: string;
    domain: string;
    keywords?: string;
    target?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      keywords: params.keywords || "",
      target: params.target || "Не корзина",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/commercialization?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Кластеризация
  async clusterKeywords(params: {
    region: string;
    domain: string;
    grouping_method?: string;
    grouping_level?: string;
    check_depth?: string;
    exclude_main?: string;
    search_engine?: string;
  }): Promise<ParseResponse> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      grouping_method: params.grouping_method || "soft",
      grouping_level: params.grouping_level || "5",
      check_depth: params.check_depth || "10",
      exclude_main: params.exclude_main || "false",
      search_engine: params.search_engine || "yandex",
    });

    return apiCall<ParseResponse>(
      `/semantix/service/keywords/clustering?${queryParams}`,
      {
        method: "POST",
      },
    );
  },

  // Обновление группы для строки
  async updateKeywordGroup(params: {
    region: string;
    domain: string;
    row_id: number;
    new_group: string;
  }): Promise<{
    success: boolean;
    message: string;
    row_id: number;
    new_group: string;
  }> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      row_id: params.row_id.toString(),
      new_group: params.new_group,
    });

    return apiCall(`/semantix/service/keywords/update-group?${queryParams}`, {
      method: "POST",
    });
  },

  // Массовое обновление группы
  async bulkUpdateKeywordGroup(params: {
    region: string;
    domain: string;
    row_ids: number[];
    new_group: string;
  }): Promise<{ success: boolean; message: string; updated_count: number }> {
    return apiCall("/semantix/service/keywords/bulk-update-group-v2", {
      method: "POST",
      body: JSON.stringify({
        region: params.region,
        domain: params.domain,
        row_ids: params.row_ids,
        new_group: params.new_group,
      }),
    });
  },

  // Получение статуса задач
  async getTasksStatus(): Promise<TaskStatus> {
    return apiCall<TaskStatus>("/semantix/service/tasks/status");
  },

  // Получение списка регионов
  async getRegions(): Promise<{
    success: boolean;
    regions: Region[];
    count: number;
    default_region: string;
  }> {
    return apiCall("/semantix/service/regions");
  },

  // Очистка всех данных
  async clearKeywords(): Promise<ParseResponse> {
    return apiCall<ParseResponse>("/semantix/service/keywords/clear", {
      method: "DELETE",
    });
  },

  // Добавление ключевых слов вручную
  async addManualKeywords(params: {
    region: string;
    domain: string;
    keywords_text?: string;
    file_content?: string;
    file_name?: string;
  }): Promise<ParseResponse> {
    return apiCall<ParseResponse>(
      "/semantix/service/keywords/add-manual-keywords",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  },

  // Скачивание сокращенной таблицы
  async downloadShortTable(params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
    stop_words?: string;
  }): Promise<Blob> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      competitors: params.competitors || "",
      services: params.services || "",
      stop_words: params.stop_words || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/semantix/service/keywords/xlsx-short?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: getAuthToken(),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  },

  // Скачивание полной т��блицы
  async downloadFullTable(params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
    stop_words?: string;
    words_count?: number;
  }): Promise<Blob> {
    const queryParams = buildQueryParams({
      region: params.region,
      domain: params.domain,
      competitors: params.competitors || "",
      services: params.services || "",
      stop_words: params.stop_words || "",
      words_count: (params.words_count || 500).toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/semantix/service/keywords/xlsx?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: getAuthToken(),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  },
};

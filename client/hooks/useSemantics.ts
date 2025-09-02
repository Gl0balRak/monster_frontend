import { useState, useEffect, useCallback, useRef } from "react";
import { semantixApi, SemanticQuery, TaskStatus } from "@/lib/semantix-api";

interface UseSemanticsReturn {
  // Data state
  keywords: SemanticQuery[];
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Individual loading states
  loadingStates: {
    parsing: boolean;
    cleaning: boolean;
    searchSuggestions: boolean;
    frequencies: boolean;
    demandClicks: boolean;
    competition: boolean;
    commercialization: boolean;
    clustering: boolean;
    downloadShort: boolean;
    downloadFull: boolean;
    addManual: boolean;
  };

  // Task state
  activeTasks: TaskStatus["tasks"];

  // Actions
  refreshKeywords: () => Promise<void>;
  parseKeywords: (params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
  }) => Promise<void>;
  cleanKeywords: (params: {
    region: string;
    domain: string;
    cleaning_settings?: string;
    stop_words?: string;
    exclude_cities?: string;
  }) => Promise<void>;
  parseSearchSuggestions: (params: {
    region: string;
    domain: string;
    target?: string;
    search_suggestions_method?: string;
    search_suggestions_engine?: string;
    search_suggestions_depth?: string;
    search_suggestions_exclude_porn?: string;
    search_suggestions_exclude_news?: string;
  }) => Promise<void>;
  parseFrequencies: (params: {
    region: string;
    domain: string;
    target?: string;
    competitors?: string;
    parse_w?: string;
    parse_not_w?: string;
    parse_w_quoted?: string;
  }) => Promise<void>;
  loadDemandAndClicks: (params: {
    region: string;
    domain: string;
    services?: string;
    target?: string;
  }) => Promise<void>;
  checkCompetition: (params: {
    region: string;
    domain: string;
    competitors?: string;
    target?: string;
  }) => Promise<void>;
  checkCommercialization: (params: {
    region: string;
    domain: string;
    keywords?: string;
    target?: string;
  }) => Promise<void>;
  clusterKeywords: (params: {
    region: string;
    domain: string;
    grouping_method?: string;
    grouping_level?: string;
    check_depth?: string;
    exclude_main?: string;
    search_engine?: string;
  }) => Promise<void>;
  updateKeywordGroup: (
    row_id: number,
    new_group: string,
    region: string,
    domain: string,
  ) => Promise<void>;
  bulkUpdateKeywordGroup: (
    row_ids: number[],
    new_group: string,
    region: string,
    domain: string,
  ) => Promise<void>;
  clearKeywords: () => Promise<void>;
  addManualKeywords: (params: {
    region: string;
    domain: string;
    keywords_text?: string;
    file_content?: string;
    file_name?: string;
  }) => Promise<void>;
  downloadShortTable: (params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
    stop_words?: string;
  }) => Promise<void>;
  downloadFullTable: (params: {
    region: string;
    domain: string;
    competitors?: string;
    services?: string;
    stop_words?: string;
    words_count?: number;
  }) => Promise<void>;
}

export const useSemantics = (): UseSemanticsReturn => {
  // State
  const [keywords, setKeywords] = useState<SemanticQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTasks, setActiveTasks] = useState<TaskStatus["tasks"]>([]);

  const [loadingStates, setLoadingStates] = useState({
    parsing: false,
    cleaning: false,
    searchSuggestions: false,
    frequencies: false,
    demandClicks: false,
    competition: false,
    commercialization: false,
    clustering: false,
    downloadShort: false,
    downloadFull: false,
    addManual: false,
  });

  // Refs
  const mountedRef = useRef(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to handle API responses
  const handleApiResponse = useCallback((response: any) => {
    if (!mountedRef.current) return;

    if (response.success) {
      setError(null);
      setMessage(response.message);
      if (response.data) {
        setKeywords(response.data);
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        if (mountedRef.current) {
          setMessage(null);
        }
      }, 5000);

      // Handle auth redirects
      if (response.requires_auth && response.auth_url) {
        // Open auth URL in new window
        window.open(response.auth_url, "_blank", "width=600,height=600");
      }
    } else {
      setError(response.message);
      setMessage(null);
    }
  }, []);

  // Helper to set loading with timeout protection
  const setLoadingWithTimeout = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (loading) {
      // Auto-clear loading after 30 seconds to prevent stuck state
      setTimeout(() => {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }, 30000);
    }
  }, []);

  // Helper to manage individual loading states
  const setActionLoading = useCallback(
    (action: keyof typeof loadingStates, loading: boolean) => {
      setLoadingStates((prev) => ({
        ...prev,
        [action]: loading,
      }));
    },
    [],
  );

  // Refresh keywords
  const refreshKeywords = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoadingWithTimeout(true);
      setError(null);

      const response = await semantixApi.refreshKeywords();
      if (mountedRef.current) {
        handleApiResponse(response);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Ошибка при загрузке данных",
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoadingWithTimeout(false);
      }
    }
  }, [handleApiResponse, setLoadingWithTimeout]);

  // Polling for task status with smart intervals
  const startTaskPolling = useCallback(() => {
    let currentInterval = 2000; // Start with 2 seconds
    let lastTaskCount = 0;

    const poll = async () => {
      try {
        if (!mountedRef.current) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        const status = await semantixApi.getTasksStatus();

        if (!mountedRef.current) return;

        if (status.success) {
          setActiveTasks(status.tasks);

          // Determine polling interval based on task count
          const newInterval = status.tasks.length > 0 ? 2000 : 10000; // 2s when active, 10s when idle

          // If interval should change, restart polling
          if (newInterval !== currentInterval) {
            currentInterval = newInterval;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
            pollingRef.current = setInterval(poll, currentInterval);
          }

          // Если задач нет или их количество изменилось, обновляем ключевые слова
          if (status.tasks.length === 0 || status.tasks.length !== lastTaskCount) {
            lastTaskCount = status.tasks.length;
            setTimeout(() => {
              if (mountedRef.current) {
                refreshKeywords();
              }
            }, 100);
          }
        }
      } catch (err) {
        console.error("Error polling task status:", err);
        // Continue polling even on error, but with longer interval
        currentInterval = 10000;
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
        pollingRef.current = setInterval(poll, currentInterval);
      }
    };

    if (pollingRef.current) return; // Already polling

    // Start initial poll
    poll();
    pollingRef.current = setInterval(poll, currentInterval);
  }, [refreshKeywords]);

  // Stop task polling
  const stopTaskPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Parse keywords
  const parseKeywords = useCallback(
    async (params: {
      region: string;
      domain: string;
      competitors?: string;
      services?: string;
    }) => {
      try {
        setActionLoading("parsing", true);
        setError(null);

        // Сохраняем параметры парсинга в localStorage для автоматического возобновления
        localStorage.setItem("parsingParams", JSON.stringify(params));

        const response = await semantixApi.parseKeywords(params);

        // Проверяем, требуется ли авторизация
        if (response.requires_auth && response.auth_url) {
          // Открываем окно авторизации
          window.open(response.auth_url, "_blank", "width=600,height=600");
          return; // Не обрабатываем ответ здесь, продолжим после авторизации
        }

        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Ошибка при парсинге ключевых слов",
          );
        }
      } finally {
        if (mountedRef.current) {
          setActionLoading("parsing", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Clean keywords
  const cleanKeywords = useCallback(
    async (params: {
      region: string;
      domain: string;
      cleaning_settings?: string;
      stop_words?: string;
      exclude_cities?: string;
    }) => {
      try {
        setActionLoading("cleaning", true);
        setError(null);

        const response = await semantixApi.cleanKeywords(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при чистке ключевых слов",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("cleaning", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Parse search suggestions
  const parseSearchSuggestions = useCallback(
    async (params: {
      region: string;
      domain: string;
      target?: string;
      search_suggestions_method?: string;
      search_suggestions_engine?: string;
      search_suggestions_depth?: string;
      search_suggestions_exclude_porn?: string;
      search_suggestions_exclude_news?: string;
    }) => {
      try {
        setActionLoading("searchSuggestions", true);
        setError(null);

        const response = await semantixApi.parseSearchSuggestions(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при парсинге поисковых подсказок",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("searchSuggestions", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Parse frequencies
  const parseFrequencies = useCallback(
    async (params: {
      region: string;
      domain: string;
      target?: string;
      competitors?: string;
      parse_w?: string;
      parse_not_w?: string;
      parse_w_quoted?: string;
    }) => {
      try {
        setActionLoading("frequencies", true);
        setError(null);

        const response = await semantixApi.parseFrequencies(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ошибка при парсинге частот",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("frequencies", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Load demand and clicks
  const loadDemandAndClicks = useCallback(
    async (params: {
      region: string;
      domain: string;
      services?: string;
      target?: string;
    }) => {
      try {
        setActionLoading("demandClicks", true);
        setError(null);

        const response = await semantixApi.loadDemandAndClicks(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при загрузке спроса и кликов",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("demandClicks", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Check competition
  const checkCompetition = useCallback(
    async (params: {
      region: string;
      domain: string;
      competitors?: string;
      target?: string;
    }) => {
      try {
        setActionLoading("competition", true);
        setError(null);

        const response = await semantixApi.checkCompetition(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при проверке конкурентности",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("competition", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Check commercialization
  const checkCommercialization = useCallback(
    async (params: {
      region: string;
      domain: string;
      keywords?: string;
      target?: string;
    }) => {
      try {
        setActionLoading("commercialization", true);
        setError(null);

        const response = await semantixApi.checkCommercialization(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при проверке коммерциализации",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("commercialization", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Cluster keywords
  const clusterKeywords = useCallback(
    async (params: {
      region: string;
      domain: string;
      grouping_method?: string;
      grouping_level?: string;
      check_depth?: string;
      exclude_main?: string;
      search_engine?: string;
    }) => {
      try {
        setActionLoading("clustering", true);
        setError(null);

        const response = await semantixApi.clusterKeywords(params);
        handleApiResponse(response);

        // Task polling is already running continuously
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ошибка при кластеризации",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("clustering", false);
        }
      }
    },
    [handleApiResponse, setActionLoading],
  );

  // Update keyword group
  const updateKeywordGroup = useCallback(
    async (
      row_id: number,
      new_group: string,
      region: string,
      domain: string,
    ) => {
      try {
        const response = await semantixApi.updateKeywordGroup({
          region,
          domain,
          row_id,
          new_group,
        });

        if (response.success) {
          // Update local state
          setKeywords((prev) =>
            prev.map((keyword) =>
              keyword.id === row_id
                ? { ...keyword, group: new_group }
                : keyword,
            ),
          );
          setMessage(`Группа обновлена на "${new_group}"`);
        } else {
          setError("Ошибка при обновлении группы");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ошибка при обновлении группы",
        );
      }
    },
    [],
  );

  // Bulk update keyword group
  const bulkUpdateKeywordGroup = useCallback(
    async (
      row_ids: number[],
      new_group: string,
      region: string,
      domain: string,
    ) => {
      try {
        const response = await semantixApi.bulkUpdateKeywordGroup({
          region,
          domain,
          row_ids,
          new_group,
        });

        if (response.success) {
          // Update local state
          setKeywords((prev) =>
            prev.map((keyword) =>
              row_ids.includes(keyword.id)
                ? { ...keyword, group: new_group }
                : keyword,
            ),
          );
          setMessage(`Группа обновлена для ${response.updated_count} строк`);
        } else {
          setError("Ошибка при массовом обновлении групп");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при массовом обновлении групп",
        );
      }
    },
    [],
  );

  // Clear keywords
  const clearKeywords = useCallback(async () => {
    try {
      setLoadingWithTimeout(true);
      setError(null);

      const response = await semantixApi.clearKeywords();
      handleApiResponse(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при очистке данных",
      );
    } finally {
      if (mountedRef.current) {
        setLoadingWithTimeout(false);
      }
    }
  }, [handleApiResponse, setLoadingWithTimeout]);

  // Add manual keywords
  const addManualKeywords = useCallback(
    async (params: {
      region: string;
      domain: string;
      keywords_text?: string;
      file_content?: string;
      file_name?: string;
    }) => {
      try {
        setActionLoading("addManual", true);
        setError(null);

        const response = await semantixApi.addManualKeywords(params);
        handleApiResponse(response);

        if (response.success) {
          await refreshKeywords();
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при добавлении ключевых слов",
        );
      } finally {
        if (mountedRef.current) {
          setActionLoading("addManual", false);
        }
      }
    },
    [handleApiResponse, refreshKeywords, setActionLoading],
  );

  // Download short table
  const downloadShortTable = useCallback(
    async (params: {
      region: string;
      domain: string;
      competitors?: string;
      services?: string;
      stop_words?: string;
    }) => {
      try {
        setActionLoading("downloadShort", true);
        setError(null);

        const blob = await semantixApi.downloadShortTable(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${params.domain.replace(/[^a-zA-Z0-9]/g, "_")}_keywords_short.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage("Сокращенная таблица успешно скачана");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при скачивании сокращенной таблицы",
        );
      } finally {
        setActionLoading("downloadShort", false);
      }
    },
    [setActionLoading],
  );

  // Download full table
  const downloadFullTable = useCallback(
    async (params: {
      region: string;
      domain: string;
      competitors?: string;
      services?: string;
      stop_words?: string;
      words_count?: number;
    }) => {
      try {
        setActionLoading("downloadFull", true);
        setError(null);

        const blob = await semantixApi.downloadFullTable(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${params.domain.replace(/[^a-zA-Z0-9]/g, "_")}_keywords.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage("Полная таблица успешно скачана");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка при скачивании полной таблицы",
        );
      } finally {
        setActionLoading("downloadFull", false);
      }
    },
    [setActionLoading],
  );

  // Load data on mount
  useEffect(() => {
    mountedRef.current = true;
    refreshKeywords();
    startTaskPolling(); // Начинаем поллинг сразу при загрузке

    // Проверяем, нужно ли автоматически возобновить парсинг после авторизации
    const autoResume = localStorage.getItem("autoResumeParsing");
    const savedParams = localStorage.getItem("parsingParams");

    if (autoResume === "true" && savedParams) {
      try {
        const params = JSON.parse(savedParams);
        // Небольшая задержка для завершения инициализации
        setTimeout(() => {
          parseKeywords(params);
          // Очищаем флаги после запуска
          localStorage.removeItem("autoResumeParsing");
          localStorage.removeItem("parsingParams");
        }, 1000);
      } catch (error) {
        console.error("Error parsing saved params:", error);
        localStorage.removeItem("autoResumeParsing");
        localStorage.removeItem("parsingParams");
      }
    }

    return () => {
      mountedRef.current = false;
      stopTaskPolling();
    };
  }, [refreshKeywords, stopTaskPolling, startTaskPolling, parseKeywords]);

  return {
    keywords,
    isLoading,
    error,
    message,
    loadingStates,
    activeTasks,
    refreshKeywords,
    parseKeywords,
    cleanKeywords,
    parseSearchSuggestions,
    parseFrequencies,
    loadDemandAndClicks,
    checkCompetition,
    checkCommercialization,
    clusterKeywords,
    updateKeywordGroup,
    bulkUpdateKeywordGroup,
    clearKeywords,
    addManualKeywords,
    downloadShortTable,
    downloadFullTable,
  };
};

import { useState, useEffect, useCallback, useRef } from "react";
import { queryIndexApi, QueryIndexTaskStatus, QueryIndexData  } from "@/lib/query-api.ts";

interface UseQueryIndexReturn {
  // Task state
  isLoading: boolean;
  progress: number;
  hasResults: boolean;
  data: QueryIndexData | null;
  error: string | null;

  // Actions
  startParsing: (params: {
    keywords: string;
    files: string[];
    fileNames: string[];
    stopWords?: string;
    excludeCities?: string;
    filters?: string;
    topSize?: string;
    parsingDepth?: string;
  }) => Promise<void>;
  downloadKeywords: () => Promise<void>;
  downloadCompetitors: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useQueryIndex = (): UseQueryIndexReturn => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [data, setData] = useState<QueryIndexData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Start polling task status
  const startPolling = useCallback(() => {
    if (pollingRef.current) return; // Already polling

    pollingRef.current = setInterval(async () => {
      try {
        const status = await queryIndexApi.getTaskStatus();

        if (!mountedRef.current) return;

        setProgress(status.progress);
        setIsLoading(status.running);

        // If task completed, get results and stop polling
        if (!status.running && status.progress === 100) {
          try {
            const taskData = await queryIndexApi.getTaskData();
            console.log("Fetching task data...");
            console.log(taskData);
            if (mountedRef.current) {
              setData(taskData);
              setHasResults(true);
            }
          } catch (err) {
            console.error("Error fetching task data:", err);
          }
          stopPolling();
        }
      } catch (err) {
        console.error("Error polling task status:", err);
        if (mountedRef.current) {
          setError("Ошибка при получении статуса задачи");
          setIsLoading(false);
        }
        stopPolling();
      }
    }, 2000); // Poll every 2 seconds
  }, [stopPolling]);

  // Check existing task status on mount
  const checkExistingTask = useCallback(async () => {
    try {
      console.log("Checking existing task...");
      const status = await queryIndexApi.getTaskStatus();

      if (!mountedRef.current) return;

      console.log("Task status:", status);
      setProgress(status.progress);
      setIsLoading(status.running);

      if (status.running) {
        // Task is running, start polling
        console.log("Task is running, starting polling...");
        startPolling();
      } else if (status.progress === 100) {
        // Task completed, get results
        console.log("Task completed, fetching results...");
        try {
          const taskData = await queryIndexApi.getTaskData();
          if (mountedRef.current) {
            console.log("Task data received:", taskData);
            setData(taskData);
            setHasResults(true);
          }
        } catch (err) {
          console.error("Error fetching task data:", err);
        }
      }
    } catch (err) {
      // No task found or error - this is ok on first load
      console.log("No existing task found or error:", err);
    }
  }, [startPolling]);

  // Start parsing function
  const startParsing = useCallback(
    async (params: {
      keywords: string;
      files: string[];
      fileNames: string[];
      stopWords?: string;
      excludeCities?: string;
      filters?: string;
      topSize?: string;
      parsingDepth?: string;
    }) => {
      try {
        setError(null);
        setIsLoading(true);
        setProgress(0);
        setHasResults(false);
        setData(null);

        const response = await queryIndexApi.createTask({
          keywords: params.keywords,
          files: params.files,
          fileNames: params.fileNames,
          stop_words: params.stopWords,
          exclude_cities: params.excludeCities,
          filters: params.filters,
          top_size: params.topSize,
          parsing_depth: params.parsingDepth,
        });

        if (response.success) {
          // Task created successfully, start polling
          startPolling();
        } else {
          throw new Error(response.message || "Не удалось создать задачу");
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Ошибка при создании задачи",
          );
          setIsLoading(false);
        }
      }
    },
    [startPolling],
  );

  // Download functions
  const downloadKeywords = useCallback(async () => {
    try {
      const blob = await queryIndexApi.downloadKeywords();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "keywords.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Ошибка при скачивании ключевых слов");
    }
  }, []);

  const downloadCompetitors = useCallback(async () => {
    try {
      const blob = await queryIndexApi.downloadCompetitors();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "competitors.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Ошибка при скачивании конкурентов");
    }
  }, []);

  // Refresh status manually
  const refreshStatus = useCallback(async () => {
    await checkExistingTask();
  }, [checkExistingTask]);

  // Effects
  useEffect(() => {
    mountedRef.current = true;

    // Check existing task on mount
    checkExistingTask();

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []); // Empty dependency array to run only on mount/unmount

  return {
    isLoading,
    progress,
    hasResults,
    data,
    error,
    startParsing,
    downloadKeywords,
    downloadCompetitors,
    refreshStatus,
  };
};

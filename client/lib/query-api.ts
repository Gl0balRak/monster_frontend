// Base API types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Query Index Task Types
export interface QueryIndexTaskStatus {
  running: boolean;
  progress: number;
  name: string;
}

export interface QueryIndexData {
  keywords: [string, number, number, number][]; // [keyword_text, number1, number2, number3]
  competitors: [string, number, number, number][];
}

export interface CreateQueryIndexTaskRequest {
  token: string;
  project_id: string;
  keywords: string;
  files: string[];
  stop_words?: string;
  exclude_cities?: string;
  filters?: string;
  top_size?: string;
  parsing_depth?: string;
}

export interface CreateQueryIndexTaskResponse {
  success: boolean;
  message: string;
}

// Generic demo response (existing)
export interface DemoResponse {
  message: string;
}


// Base API configuration
const API_BASE_URL = "http://localhost:7000";

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper function for building query parameters
function buildQueryParams(params: Record<string, string | number>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });
  return searchParams.toString();
}

// Mock token and project_id - в реал��ном проекте эти данные должны браться из контекста/localStorage
const getMockCredentials = () => ({
  token: "mock-jwt-token",
  project_id: "mock-project-id",
});

// Query Index API functions
export const queryIndexApi = {
  // Get task status
  async getTaskStatus(): Promise<QueryIndexTaskStatus> {
    const { token, project_id } = getMockCredentials();
    const params = buildQueryParams({ token, project_id });
    return apiCall<QueryIndexTaskStatus>(`/fetchQueryIndexTask?${params}`);
  },

  // Get task data
  async getTaskData(): Promise<QueryIndexData> {
    const { token, project_id } = getMockCredentials();
    const params = buildQueryParams({ token, project_id });
    return apiCall<QueryIndexData>(`/fetchQueryIndexData?${params}`);
  },

  // Create new task
  async createTask(
    request: Omit<CreateQueryIndexTaskRequest, "token" | "project_id">,
  ): Promise<CreateQueryIndexTaskResponse> {
    const { token, project_id } = getMockCredentials();
    const params = buildQueryParams({
      token,
      project_id,
      keywords: request.keywords,
      files: JSON.stringify(request.files),
      filters: request.filters || "",
      stop_words: request.stop_words || "",
      exclude_cities: request.exclude_cities || "",
      top_size: request.top_size || "",
      parsing_depth: request.parsing_depth || "",
    });

    const response = apiCall<CreateQueryIndexTaskResponse>(
      `/createQueryIndexTask?${params}`,
      {
        method: "POST",
      },
    );

    console.log("dich1");
    console.log(response);

    return response;
  },

  // Download keywords
  async downloadKeywords(): Promise<Blob> {
    const { token, project_id } = getMockCredentials();
    const params = buildQueryParams({ token, project_id });

    const response = await fetch(`${API_BASE_URL}/downloadKeywords?${params}`);
    if (!response.ok) {
      throw new Error(
        `Download Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.blob();
  },

  // Download competitors
  async downloadCompetitors(): Promise<Blob> {
    const { token, project_id } = getMockCredentials();
    const params = buildQueryParams({ token, project_id });

    const response = await fetch(
      `${API_BASE_URL}/downloadCompetitors?${params}`,
    );
    if (!response.ok) {
      throw new Error(
        `Download Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.blob();
  },
};

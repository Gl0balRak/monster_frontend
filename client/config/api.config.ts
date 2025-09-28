// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:3002",
  ENDPOINTS: {
    AUTHORIZE: "/semantix/authorize",
    REGIONS: "/semantix/service/regions",
    KEYWORDS: {
      ADD_MANUAL: "/semantix/service/keywords/add-manual-keywords",
      PARSE: "/semantix/service/keywords/parse",
      CLEAN: "/semantix/service/keywords/clean",
      CLEAR: "/semantix/service/keywords/clear",
      EXCEL_SHORT: "/semantix/service/keywords/xlsx-short",
      EXCEL_FULL: "/semantix/service/keywords/xlsx",
      MOVE_TO_TRASH: "/semantix/service/keywords/move-to-trash",
      ASSIGN_GROUP: "/semantix/service/keywords/assign-group",
      PARSE_FREQUENCIES: "/semantix/service/keywords/frequencies",
      LOAD_DEMAND_CLICKS: "/semantix/service/keywords/demand-clicks",
      CHECK_COMPETITION: "/semantix/service/keywords/competition",
      CHECK_COMMERCE: "/semantix/service/keywords/commercialization",
      CLUSTER: "/semantix/service/keywords/clustering",
      SEARCH_SUGGESTIONS: "/semantix/service/keywords/search-suggestions",
      UPDATE_GROUP: "/semantix/service/keywords/update-group",
      BULK_UPDATE_GROUP: "/semantix/service/keywords/bulk-update-group-v2",
      REFRESH: "/semantix/service/keywords/refresh",
    },
    TASKS: {
      STATUS: "/semantix/service/tasks/status",
    },
    GROUPS: "/semantix/service/groups",
    YANDEX_SET_TOKEN: "/auth/yandex/set_token",
    GOOGLE_SET_TOKEN: "/auth/google/set_token",
    ADMIN: {
      WEBMASTER_LIST_ACCOUNT: "/semantix/admin/webmaster/list_account",
      WEBMASTER_ADD_ACCOUNT: "/semantix/admin/webmaster/create_account",
      WEBMASTER_DELETE_ACCOUNT: "/semantix/admin/webmaster/delete_account",
    }
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

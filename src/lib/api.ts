import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type CalloutStatus = "accepted" | "declined" | "no_answer" | "pending";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

export type Substitute = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  cellPhone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Location = {
  id: number;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type Community = {
  id: number;
  name: string;
  locationId: number;
  createdAt: string;
  updatedAt: string;
  location?: Location;
};

export type Absence = {
  id: number;
  personAwayName: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Assignment = {
  id: number;
  absenceId: number | null;
  substituteId: number | null;
  communityId: number;
  substituteName: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentException = {
  id: number;
  substituteAssignmentId: number;
  date: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CanceledAssignment = Assignment & {
  exception: AssignmentException;
};

export type Callout = {
  id: number;
  date: string;
  substituteId: number;
  status: CalloutStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DayCallout = Callout & {
  substituteName: string;
};

export type CalloutRow = {
  substitute: Substitute;
  status: CalloutStatus;
  notes: string | null;
  calloutId: number | null;
};

export type DayDetail = {
  date: string;
  notes: string;
  absences: Absence[];
  assignments: Assignment[];
  canceledAssignments: CanceledAssignment[];
  callouts: DayCallout[];
};

export type CalendarSummary = {
  date: string;
  hasAbsence: boolean;
  hasAssignment: boolean;
  hasCanceledAssignment: boolean;
  hasCallout: boolean;
  awayPeople: string[];
};

let accessToken: string | null = null;
let authLostHandler: (() => void) | null = null;

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await api.refresh();
        return http(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        authLostHandler?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export function setUnauthorizedHandler(handler: () => void) {
  authLostHandler = handler;
}

export function clearAccessToken() {
  accessToken = null;
}

export const api = {
  login: async (body: { username: string; password: string }) => {
    const result = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body,
    });
    accessToken = result.accessToken;
    return result.user;
  },
  refresh: async () => {
    const result = await request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      skipInterceptor: true,
    });
    accessToken = result.accessToken;
    return result.user;
  },
  logout: async () => {
    await request<{ authenticated: false }>("/api/auth/logout", { method: "POST" });
    clearAccessToken();
  },
  me: async () => {
    const result = await request<{ user: User }>("/api/auth/me");
    return result.user;
  },
  calendarSummary: (startDate: string, endDate: string) =>
    request<CalendarSummary[]>(
      `/api/calendar/summary?startDate=${startDate}&endDate=${endDate}`,
    ),
  day: (date: string) => request<DayDetail>(`/api/days/${date}`),
  updateDayNotes: (date: string, notes: string) =>
    request(`/api/days/${date}/notes`, { method: "PUT", body: { notes } }),
  locations: () => request<Location[]>("/api/locations"),
  createLocation: (body: Pick<Location, "name" | "timezone">) =>
    request<Location>("/api/locations", { method: "POST", body }),
  updateLocation: (id: number, body: Partial<Pick<Location, "name" | "timezone">>) =>
    request<Location>(`/api/locations/${id}`, { method: "PATCH", body }),
  deleteLocation: (id: number) =>
    request<Location>(`/api/locations/${id}`, { method: "DELETE" }),
  communities: () => request<Community[]>("/api/communities"),
  createCommunity: (body: Pick<Community, "name" | "locationId">) =>
    request<Community>("/api/communities", { method: "POST", body }),
  updateCommunity: (
    id: number,
    body: Partial<Pick<Community, "name" | "locationId">>,
  ) => request<Community>(`/api/communities/${id}`, { method: "PATCH", body }),
  deleteCommunity: (id: number) =>
    request<Community>(`/api/communities/${id}`, { method: "DELETE" }),
  substitutes: () => request<Substitute[]>("/api/substitutes"),
  createSubstitute: (
    body: Pick<
      Substitute,
      "name" | "email" | "phoneNumber" | "cellPhone" | "active"
    >,
  ) => request<Substitute>("/api/substitutes", { method: "POST", body }),
  updateSubstitute: (
    id: number,
    body: Partial<
      Pick<Substitute, "name" | "email" | "phoneNumber" | "cellPhone" | "active">
    >,
  ) => request<Substitute>(`/api/substitutes/${id}`, { method: "PATCH", body }),
  deleteSubstitute: (id: number) =>
    request<Substitute>(`/api/substitutes/${id}`, { method: "DELETE" }),
  createAbsence: (body: {
    personAwayName: string;
    startDate: string;
    endDate: string;
    notes?: string | null;
  }) => request<Absence>("/api/absences", { method: "POST", body }),
  updateAbsence: (id: number, body: Partial<Absence>) =>
    request<Absence>(`/api/absences/${id}`, { method: "PATCH", body }),
  deleteAbsence: (id: number) =>
    request<Absence>(`/api/absences/${id}`, { method: "DELETE" }),
  createAssignment: (body: {
    absenceId?: number | null;
    substituteId?: number | null;
    communityId: number;
    substituteName?: string;
    startDate: string;
    endDate: string;
    notes?: string | null;
  }) => request<Assignment>("/api/substitute-assignments", { method: "POST", body }),
  updateAssignment: (id: number, body: Partial<Assignment>) =>
    request<Assignment>(`/api/substitute-assignments/${id}`, {
      method: "PATCH",
      body,
    }),
  deleteAssignment: (id: number) =>
    request<Assignment>(`/api/substitute-assignments/${id}`, { method: "DELETE" }),
  createAssignmentException: (
    id: number,
    body: { date: string; reason?: string | null },
  ) =>
    request<AssignmentException>(`/api/substitute-assignments/${id}/exceptions`, {
      method: "POST",
      body,
    }),
  deleteAssignmentException: (id: number, date: string) =>
    request<AssignmentException>(
      `/api/substitute-assignments/${id}/exceptions/${date}`,
      { method: "DELETE" },
    ),
  callouts: (date: string) => request<CalloutRow[]>(`/api/callouts?date=${date}`),
  updateCallout: (
    date: string,
    substituteId: number,
    body: { status: CalloutStatus; notes?: string | null },
  ) =>
    request<Callout>(`/api/callouts/${date}/${substituteId}`, {
      method: "PATCH",
      body,
    }),
};

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; skipInterceptor?: boolean } = {},
) {
  try {
    const client = init.skipInterceptor ? axios : http;
    const response = await client.request<ApiSuccess<T> | ApiFailure>({
      baseURL: API_URL,
      url: path,
      method: init.method ?? "GET",
      withCredentials: true,
      data: init.body,
    });
    const payload = response.data;

    if (!payload.success) {
      throw new ApiError(payload.error.code, payload.error.message, payload.error.details);
    }

    return payload.data;
  } catch (error) {
    throw toApiError(error);
  }
}

function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiFailure>(error)) {
    const payload = error.response?.data;
    if (payload?.success === false) {
      return new ApiError(
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }
  }

  return new ApiError("NETWORK_ERROR", "Could not reach the API.");
}

import {
  AttendEventRequest,
  AttendEventResponse,
  CreateEventRequest,
  CreateEventResponse,
  CreateOrUpdateGoalRequest,
  CreateOrUpdateGoalResponse,
  CreateOrUpdateReviewRequest,
  CreateOrUpdateReviewResponse,
  GetAttendanceHistoryResponse,
  GetAttendanceTimeForecastsResponse,
  GetFollowingEventsResponse,
  GetGoalResponse,
  GetGuestAttendanceStatusResponse,
  GetMyEventsResponse,
  GetReviewResponse,
  UpdateAttendancesRequest,
  UpdateAttendancesResponse,
  UpdateEventRequest,
  UpdateEventResponse,
} from "@/lib/api/dtos/event";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

export const createEvent = async (data: CreateEventRequest): Promise<CreateEventResponse> => {
  return fetchWithSHA256Header<CreateEventResponse>("/events/create", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const updateEvent = async (eventId: string, data: UpdateEventRequest): Promise<UpdateEventResponse> => {
  return fetchWithSHA256Header<UpdateEventResponse>(`/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const attendEvent = async (
  data: AttendEventRequest,
  eventId: string,
  start: string,
): Promise<AttendEventResponse> => {
  return fetchWithSHA256Header<AttendEventResponse>(`/events/attend/${eventId}/${start}`, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const updateAttendances = async (
  data: UpdateAttendancesRequest,
  eventId: string,
  start: string,
): Promise<UpdateAttendancesResponse> => {
  return fetchWithSHA256Header<UpdateAttendancesResponse>(`/events/attend/${eventId}/${start}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const getAttendanceHistory = async (eventId: string, start: string): Promise<GetAttendanceHistoryResponse> => {
  return fetchWithSHA256Header<GetAttendanceHistoryResponse>(`/events/attend/${eventId}/${start}`, {
    method: "GET",
    credentials: "include",
  });
};

export const getMyEvents = async (): Promise<GetMyEventsResponse> => {
  return fetchWithSHA256Header<GetMyEventsResponse>("/events/mine", {
    method: "GET",
    credentials: "include",
  });
};

export const getFollowingEvents = async (): Promise<GetFollowingEventsResponse> => {
  return fetchWithSHA256Header<GetFollowingEventsResponse>("/events/following", {
    method: "GET",
    credentials: "include",
  });
};

export const getGuestAttendanceStatus = async (
  eventId: string,
  start: string,
): Promise<GetGuestAttendanceStatusResponse> => {
  return fetchWithSHA256Header<GetGuestAttendanceStatusResponse>(`/events/attend/status/${eventId}/${start}`, {
    method: "GET",
    credentials: "include",
  });
};

export const getAttendanceTimeForecasts = async (): Promise<GetAttendanceTimeForecastsResponse> => {
  return fetchWithSHA256Header<GetAttendanceTimeForecastsResponse>(`/events/attend/forecast`, {
    method: "GET",
    credentials: "include",
  });
};

export const createOrUpdateGoal = async (
  data: CreateOrUpdateGoalRequest,
  eventId: string,
  start: string,
): Promise<CreateOrUpdateGoalResponse> => {
  return fetchWithSHA256Header<CreateOrUpdateGoalResponse>(`/events/goals/${eventId}/${start}`, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const getGoal = async (eventId: string, start: string): Promise<GetGoalResponse> => {
  return fetchWithSHA256Header<GetGoalResponse>(`/events/goals/${eventId}/${start}`, {
    method: "GET",
    credentials: "include",
  });
};

export const createOrUpdateReview = async (
  data: CreateOrUpdateReviewRequest,
  eventId: string,
  start: string,
): Promise<CreateOrUpdateReviewResponse> => {
  return fetchWithSHA256Header<CreateOrUpdateReviewResponse>(`/events/reviews/${eventId}/${start}`, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const getReview = async (eventId: string, start: string): Promise<GetReviewResponse> => {
  return fetchWithSHA256Header<GetReviewResponse>(`/events/reviews/${eventId}/${start}`, {
    method: "GET",
    credentials: "include",
  });
};

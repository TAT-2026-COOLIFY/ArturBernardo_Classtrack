import api from "../../services/api";

export interface Lesson {
  id: number;
  learner_id: number;
  date: string;
  start_at: string;
  end_at: string;
  learner?: { id: number; name: string };
}

export interface LessonFormData {
  learner_id: number | string;
  date: string;
  start_at: string;
  end_at: string;
  occurrences?: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getLessons = async (): Promise<Lesson[]> => {
  const response = await api.get<ApiResponse<Lesson[]>>("/lesson");
  return response.data.data;
};

export const addLesson = async (data: LessonFormData): Promise<Lesson> => {
  const response = await api.post<ApiResponse<Lesson>>("/lesson", data);
  return response.data.data;
};

export const updateLesson = async (id: number, data: LessonFormData): Promise<Lesson> => {
  const response = await api.put<ApiResponse<Lesson>>(`/lesson/${id}`, data);
  return response.data.data;
};

export const deleteLesson = async (id: number): Promise<void> => {
  await api.delete(`/lesson/${id}`);
};
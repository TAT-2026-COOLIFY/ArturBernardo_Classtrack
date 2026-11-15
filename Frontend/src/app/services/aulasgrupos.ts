import api from "../../services/api";

export interface GroupLesson {
  id: number;
  group_id: number;
  date: string;
  start_at: string;
  end_at: string;
  group?: { id: number; title: string };
}

export interface GroupLessonFormData {
  group_id: number | string;
  date: string;
  start_at: string;
  end_at: string;
  occurrences?: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getGroupLessons = async (): Promise<GroupLesson[]> => {
  const response = await api.get<ApiResponse<GroupLesson[]>>("/group-lesson");
  return response.data.data;
};

export const addGroupLesson = async (data: GroupLessonFormData): Promise<GroupLesson> => {
  const response = await api.post<ApiResponse<GroupLesson>>("/group-lesson", data);
  return response.data.data;
};

export const updateGroupLesson = async (id: number, data: GroupLessonFormData): Promise<GroupLesson> => {
  const response = await api.put<ApiResponse<GroupLesson>>(`/group-lesson/${id}`, data);
  return response.data.data;
};

export const deleteGroupLesson = async (id: number): Promise<void> => {
  await api.delete(`/group-lesson/${id}`);
};
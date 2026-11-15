import api from "../../services/api";

export interface Plano {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  value: number;
}

export interface PlanoFormData {
  title: string;
  description: string;
  value: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getPlanos = async (): Promise<Plano[]> => {
  const response = await api.get<ApiResponse<Plano[]>>("/plan");
  return response.data.data;
};

export const addPlano = async (data: PlanoFormData): Promise<Plano> => {
  const response = await api.post<ApiResponse<Plano>>("/plan", data);
  return response.data.data;
};

export const updatePlano = async (id: number, data: PlanoFormData): Promise<Plano> => {
  const response = await api.put<ApiResponse<Plano>>(`/plan/${id}`, data);
  return response.data.data;
};

export const deletePlano = async (id: number): Promise<void> => {
  await api.delete(`/plan/${id}`);
};
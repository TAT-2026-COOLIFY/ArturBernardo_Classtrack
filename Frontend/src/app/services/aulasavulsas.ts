import api from "../../services/api";

export interface AulaAvulsa {
  id: number;
  user_id: number;
  name: string;
  date: string;
  observation: string | null;
  value: number;
}

export interface AulaAvulsaFormData {
  name: string;
  date: string;
  observation: string;
  value: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getAulasAvulsas = async (): Promise<AulaAvulsa[]> => {
  const response = await api.get<ApiResponse<AulaAvulsa[]>>("/isolated-classes");
  return response.data.data;
};

export const addAulaAvulsa = async (data: AulaAvulsaFormData): Promise<AulaAvulsa> => {
  const response = await api.post<ApiResponse<AulaAvulsa>>("/isolated-classes", data);
  return response.data.data;
};

export const updateAulaAvulsa = async (
  id: number,
  data: Partial<AulaAvulsaFormData>
): Promise<AulaAvulsa> => {
  const response = await api.put<ApiResponse<AulaAvulsa>>(`/isolated-classes/${id}`, data);
  return response.data.data;
};

export const deleteAulaAvulsa = async (id: number): Promise<void> => {
  await api.delete(`/isolated-classes/${id}`);
};
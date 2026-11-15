import api from "../../services/api";

export interface Aluno {
  id: number;
  user_id: number;
  plan_id: number | null;
  name: string;
  email: string | null;
  contact: string | null;
  observation: string | null;
}

export interface AlunoFormData {
  plan_id: string;
  name: string;
  email: string;
  contact: string;
  observation: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getAlunos = async (): Promise<Aluno[]> => {
  const response = await api.get<ApiResponse<Aluno[]>>("/learner");
  return response.data.data;
};

export const addAluno = async (data: AlunoFormData): Promise<Aluno> => {
  const response = await api.post<ApiResponse<Aluno>>("/learner", data);
  return response.data.data;
};

export const updateAluno = async (id: number, data: AlunoFormData): Promise<Aluno> => {
  const response = await api.put<ApiResponse<Aluno>>(`/learner/${id}`, data);
  return response.data.data;
};

export const deleteAluno = async (id: number): Promise<void> => {
  await api.delete(`/learner/${id}`);
};
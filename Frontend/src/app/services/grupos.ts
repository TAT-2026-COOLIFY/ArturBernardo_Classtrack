import api from "../../services/api";
import type { Aluno } from "./alunos";

export interface Grupo {
  id: number;
  title: string;
  description: string;
  learners: Aluno[];
}

export interface GrupoFormData {
  title: string;
  description: string;
  learner_ids: number[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getGrupos = async (): Promise<Grupo[]> => {
  const response = await api.get<ApiResponse<Grupo[]>>("/group");
  return response.data.data;
};

export const addGrupo = async (data: GrupoFormData): Promise<Grupo> => {
  const response = await api.post<ApiResponse<Grupo>>("/group", data);
  return response.data.data;
};

export const updateGrupo = async (id: number, data: GrupoFormData): Promise<Grupo> => {
  const response = await api.put<ApiResponse<Grupo>>(`/group/${id}`, data);
  return response.data.data;
};

export const deleteGrupo = async (id: number): Promise<void> => {
  await api.delete(`/group/${id}`);
};
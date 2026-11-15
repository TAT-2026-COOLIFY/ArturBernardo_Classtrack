import api from "../../services/api";

export type PaymentStatus = "pending" | "concluded";

export interface Pagamento {
  id: number;
  learner_id: number;
  learner_name?: string;
  value: number;
  method: string;
  date: string;
  status: PaymentStatus;
}

export interface PagamentoFormData {
  learner_id: number | string;
  value: number;
  payment_method: string;
  date: string;
  status: PaymentStatus;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getPagamentos = async (month?: string): Promise<Pagamento[]> => {
  const response = await api.get<ApiResponse<Pagamento[]>>("/payment", {
    params: month ? { month } : {},
  });
  return response.data.data;
};
export const addPagamento = async (data: PagamentoFormData): Promise<Pagamento> => {
  const response = await api.post<ApiResponse<Pagamento>>("/payment", data);
  return response.data.data;
};

export const downloadPaymentsReport = async (month?: string): Promise<void> => {
  const response = await api.get("/payments/report", {
    params: month ? { month } : {},
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-pagamentos${month ? `-${month}` : ""}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const updatePagamento = async (
  id: number,
  data: Partial<PagamentoFormData>
): Promise<Pagamento> => {
  const response = await api.put<ApiResponse<Pagamento>>(`/payment/${id}`, data);
  return response.data.data;
};

export const deletePagamento = async (id: number): Promise<void> => {
  await api.delete(`/payment/${id}`);
};
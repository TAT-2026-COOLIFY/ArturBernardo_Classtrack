import api from "../../services/api";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const registerUser = async (data: RegisterFormData) => {
  const response = await api.post<ApiResponse<{ email: string }>>("/register", data);
  return response.data;
};

export const verifyPin = async (email: string, pinCode: string) => {
  const response = await api.post<{ message: string; token: string; data: any }>("/verify-pin", {
    email,
    pin_code: pinCode,
  });
  return response.data;
};

export const resendPin = async (email: string) => {
  const response = await api.post<{ message: string }>("/resend-pin", { email });
  return response.data;
};
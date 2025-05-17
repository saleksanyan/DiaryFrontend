export type ApiResponse<T> = {
  data?: T;
  error?: string;
  token?: string;
};

export type UserRegistration = {
  username: string;
  password: string;
  email: string;
};

export type VerificationRequest = {
  code: string;
};

export interface NotificationResponse {
  id: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  userId: string;
}

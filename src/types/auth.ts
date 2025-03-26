export interface User {
  id?: string;
  email: string;
  username: string;
  role: string;
  verified?: boolean;
  [key: string]: any; // Allow additional fields from server
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier?: string;
  email?: string; // Keep for backwards compatibility
  password: string;
  rememberMe: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  success?: boolean;
  message?: string;
  userData?: User; // Some backends return user data in this field
  [key: string]: any; // Allow additional fields from server
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  // Use identifier instead of email for more flexibility (can be email or username)
  identifier?: string;
  email?: string; // Keep for backwards compatibility
  password: string;
  rememberMe: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  token: string;
  password: string;
  passwordConfirmation: string;
} 
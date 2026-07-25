export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  requestId: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors: ValidationError[];
  path: string;
  requestId: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

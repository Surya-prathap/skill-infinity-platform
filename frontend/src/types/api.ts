/**
 * Generic API envelope returned by all Skill Infinity microservices.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  requestId: string;
  timestamp: string;
}

/**
 * Spring-style paginated response.
 */
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

/**
 * A single field-level validation error.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Standard error envelope returned by the global exception handler.
 */
export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  path?: string;
  requestId?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

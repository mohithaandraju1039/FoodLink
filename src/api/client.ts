export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const request = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('foodlink_jwt_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'An unexpected server communication error occurred.',
  }));

  if (!response.ok || !json.success) {
    throw new ApiError(json.message || 'API Request failed', response.status);
  }

  return json.data as T;
};

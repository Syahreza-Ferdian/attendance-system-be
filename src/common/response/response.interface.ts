export interface Response<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string | object;
}

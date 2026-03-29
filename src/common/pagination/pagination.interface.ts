import { PaginationQuery } from './pagination.query';

export interface PaginationResponse<T> {
  data: T[];
  pagination: PaginationData;
}

export interface PaginationData {
  total: number;
  limit: number;
  currentPage: number;
  lastPage: number;
}

export interface PaginateOptions<T> {
  modelDelegate: {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
  };
  query: PaginationQuery;
  where?: object;
  include?: object;
  orderBy?: object;
  transform: (item: any) => T;
}

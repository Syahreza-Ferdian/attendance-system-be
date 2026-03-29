import { Injectable } from '@nestjs/common';
import { PaginateOptions, PaginationResponse } from './pagination.interface';

@Injectable()
export class PaginationService {
  //   paginate<T>(options: PaginateOptions<T>): Promise<PaginationResponse<T>>;

  async paginate<T>({
    modelDelegate,
    query,
    where,
    include,
    orderBy,
    transform,
  }: PaginateOptions<T>): Promise<PaginationResponse<T>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      modelDelegate.findMany({
        where,
        skip,
        take: limit,
        ...(include ? { include } : {}),
        ...(orderBy ? { orderBy } : {}),
      }),
      modelDelegate.count({ where }),
    ]);

    return {
      data: items.map(transform),
      pagination: {
        total,
        currentPage: page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}

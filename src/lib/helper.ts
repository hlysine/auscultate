import type { Request, Response, NextFunction } from 'express';
import { AnyZodObject, z } from 'zod';
import { badRequest } from '@hapi/boom';

export async function validate<T extends AnyZodObject>(
  req: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(req);
  } catch (error: any) {
    if ('message' in error) {
      throw badRequest(error.message);
    }
    throw badRequest(JSON.stringify(error));
  }
}

export function wrap(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      return await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

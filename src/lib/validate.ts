import type { Request } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { badRequest } from '@hapi/boom';

export async function validate<T extends AnyZodObject>(
  req: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    return schema.parseAsync(req);
  } catch (error) {
    if (error instanceof ZodError) {
      throw badRequest(error.message);
    }
    throw badRequest(JSON.stringify(error));
  }
}

import { Request, Response } from "express";
import { ZodSchema } from "zod";

export const parseBody = <T>(schema: ZodSchema<T>, req: Request, res: Response): T | null => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.flatten(),
    });
    return null;
  }
  return parsed.data;
};

import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("E-mail inválido");
export const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres");
export const symbolSchema = z.string().regex(/^[A-Z]{1,5}$/, "Símbolo inválido (ex: AAPL)");
export const positiveNumberSchema = z.number().positive("Número deve ser positivo");
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)");

// API request validation schemas
export const fredRequestSchema = z.object({
  series_id: z.string().min(1, "series_id é obrigatório"),
  limit: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export const sgsRequestSchema = z.object({
  serie: z.string().min(1, "serie é obrigatório"),
  dataInicial: z.string().optional(),
  dataFinal: z.string().optional(),
});

export const alphaRequestSchema = z.object({
  function: z.enum(["GLOBAL_QUOTE", "RSI", "SMA", "MACD", "TIME_SERIES_DAILY"]),
  symbol: z.string().min(1, "symbol é obrigatório"),
  interval: z.string().optional(),
  time_period: z.string().optional(),
});

export const newsRequestSchema = z.object({
  limit: z.string().optional(),
  symbol: z.string().optional(),
});

// User input validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const priceAlertSchema = z.object({
  symbol: symbolSchema,
  condition: z.enum(["above", "below"]),
  targetPrice: positiveNumberSchema,
});

export const watchlistItemSchema = z.object({
  symbol: symbolSchema,
});

// Utility functions
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return { success: false, error: "Erro de validação" };
  }
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .substring(0, 1000); // Limit length
}

export function sanitizeNumber(input: string | number): number | null {
  const num = typeof input === "string" ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

export function sanitizeSymbol(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, "") // Keep only letters
    .substring(0, 5); // Limit to 5 characters
}

// Input sanitization for API requests
export function sanitizeApiRequest(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeNumber(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

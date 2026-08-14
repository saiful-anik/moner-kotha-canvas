export const successResponse = <T>(data: T) => ({ status: true as const, data, error: {} });

export const errorResponse = (message: string, code: string) => ({
  status: false as const,
  data: {},
  error: { message, code },
});

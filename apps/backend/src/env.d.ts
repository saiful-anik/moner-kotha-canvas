interface Env {
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_TIME_ZONE: string;
  READ_RATE_LIMIT_PER_DAY?: string;
  WRITE_RATE_LIMIT_PER_DAY?: string;
}

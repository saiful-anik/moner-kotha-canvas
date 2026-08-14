const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
type ApiSuccess<T> = { status: true; data: T; error: Record<string, never> };
type ApiFailure = { status: false; data: Record<string, never>; error: { message: string; code: string } };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !payload.status) throw new Error(payload.status ? "Request failed." : payload.error.message);
  return payload.data;
}

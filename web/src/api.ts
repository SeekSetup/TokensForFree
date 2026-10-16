export type UsageResponse = {
  total_requests?: number;
  totalRequests?: number;
  [key: string]: unknown;
};

export type ConfigResponse = Record<string, unknown>;

const baseUrl = import.meta.env.VITE_MANAGEMENT_BASE_URL?.trim() ?? "";

export class APIError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildHeaders(managementKey: string, init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (managementKey.trim() !== "") {
    headers.set("Authorization", `Bearer ${managementKey.trim()}`);
  }
  return headers;
}

async function request(path: string, managementKey: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: buildHeaders(managementKey, init?.headers)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new APIError(`Request failed: ${response.status}`, response.status, body);
  }

  return response;
}

export async function getJSON<T>(path: string, managementKey: string): Promise<T> {
  const response = await request(path, managementKey);
  return response.json() as Promise<T>;
}

export async function getText(path: string, managementKey: string): Promise<string> {
  const response = await request(path, managementKey);
  return response.text();
}

export async function putJSON(path: string, managementKey: string, payload: unknown): Promise<void> {
  await request(path, managementKey, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function putText(path: string, managementKey: string, payload: string, contentType: string): Promise<void> {
  await request(path, managementKey, {
    method: "PUT",
    headers: {
      "Content-Type": contentType
    },
    body: payload
  });
}

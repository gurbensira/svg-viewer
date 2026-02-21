import type { Design } from '../types/design.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const uploadDesign = async (file: File): Promise<Design> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/designs/upload`, {
    method: 'POST',
    body: formData
  });

  return handleResponse<Design>(response);
};

export const fetchDesigns = async (): Promise<Design[]> => {
  const response = await fetch(`${BASE_URL}/designs`);
  return handleResponse<Design[]>(response);
};

export const fetchDesignById = async (id: string): Promise<Design> => {
  const response = await fetch(`${BASE_URL}/designs/${id}`);
  return handleResponse<Design>(response);
};

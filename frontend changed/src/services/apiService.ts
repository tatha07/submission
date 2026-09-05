import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  code?: string;
  retryable?: boolean;
  field?: string;
  constructor(message: string, code?: string, retryable?: boolean, field?: string) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.field = field;
  }
}

async function apiCall<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError('Not signed in', 'NOT_AUTHENTICATED', false);
  }
  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(
      err?.message || `Request failed with status ${res.status}`,
      err?.code,
      err?.retryable,
      err?.field
    );
  }

  return body as T;
}

export const apiService = {
  // --- Users & Animals ---
  createUserProfile: (fullName: string, role: 'farmer' | 'fieldworker') =>
    apiCall('/users/profile', {
      method: 'POST',
      body: JSON.stringify({ fullName, role }),
    }),

  registerAnimal: (payload: {
    tagNumber: string;
    species: 'cattle' | 'buffalo';
    district: string;
    state: string;
    photoUrls: string[];
  }) =>
    apiCall<{ status: string; animalId: string }>('/animals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  confirmBreed: (animalId: string, breedId: string) =>
    apiCall(`/animals/${animalId}/confirm-breed?breed_id=${encodeURIComponent(breedId)}`, {
      method: 'PATCH',
    }),

  // --- Prediction (placeholder endpoint until the real ML model is wired in) ---
  predictBreed: (animalId: string, photoUrls: string[]) =>
    apiCall<{
      status: string;
      prediction: {
        predictionId: string;
        topPredictions: { breed: string; confidence: number }[];
        modelVersion: string;
      };
    }>('/predict', {
      method: 'POST',
      body: JSON.stringify({ animalId, photoUrls }),
    }),

  correctPrediction: (predictionId: string, correctedBreed: string, allowTrainingReuse: boolean) =>
    apiCall('/predictions/correct', {
      method: 'POST',
      body: JSON.stringify({ predictionId, correctedBreed, allowTrainingReuse }),
    }),

  // --- Community ---
  createPost: (breedId: string, content: string) =>
    apiCall<{ status: string; postId: string }>('/community/posts', {
      method: 'POST',
      body: JSON.stringify({ breedId, content }),
    }),

  createComment: (breedId: string, postId: string, content: string) =>
    apiCall<{ status: string; commentId: string }>('/community/comments', {
      method: 'POST',
      body: JSON.stringify({ breedId, postId, content }),
    }),

  flagPost: (breedId: string, postId: string) =>
    apiCall(`/community/posts/${breedId}/${postId}/flag`, { method: 'POST' }),
};

export { ApiError };

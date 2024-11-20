import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse(response: Response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new APIError(response.status, data.message || 'An error occurred');
  }
  
  return data;
}

export interface DonorRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  role: string;
}

export async function registerDonor(data: DonorRegistrationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/donors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Failed to connect to the server');
  }
}

// Add authentication helper
export async function getAuthToken(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Failed to connect to the server');
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { registerDonor } from '@/lib/api-client';

interface ErrorResponse {
  message: string;
  status?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const donor = await registerDonor(req.body);
    res.status(200).json(donor);
  } catch (error) {
    const err = error as ErrorResponse;
    res.status(err.status || 500).json({ 
      message: err.message || 'Internal server error' 
    });
  }
}

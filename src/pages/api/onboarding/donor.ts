import { NextApiRequest, NextApiResponse } from 'next';
import { registerDonor } from '@/lib/api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await registerDonor(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Donor registration error:', error);
    return res.status(error.status || 500).json({ 
      success: false,
      message: error.message || 'Failed to register donor' 
    });
  }
}

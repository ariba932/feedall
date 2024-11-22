import { NextRequest, NextResponse } from 'next/server';
import { registerDonor } from '@/lib/api-client';

interface ErrorResponse {
  message: string;
  status?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donor = await registerDonor(body);
    return NextResponse.json(donor);
  } catch (error) {
    const err = error as ErrorResponse;
    return NextResponse.json(
      { message: err.message || 'Internal server error' },
      { status: err.status || 500 }
    );
  }
}

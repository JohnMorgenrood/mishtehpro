import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'missing',
  });
}

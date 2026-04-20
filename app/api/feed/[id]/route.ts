import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data-feeds');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('ID required', { status: 400 });
  }

  const filePath = path.join(DATA_DIR, `${id}.xml`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Feed not found', { status: 404 });
  }

  try {
    const xml = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local storage for feeds in the container's persistent storage if available, 
// otherwise ephemeral but survives turn refreshes in this environment.
const DATA_DIR = path.join(process.cwd(), 'data-feeds');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const { id, xmlData } = await request.json();

    if (!id || !xmlData) {
      return NextResponse.json({ error: 'ID and xmlData are required' }, { status: 400 });
    }

    const filePath = path.join(DATA_DIR, `${id}.xml`);
    fs.writeFileSync(filePath, xmlData);

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const feedUrl = `${baseUrl}/api/feed/${id}`;

    return NextResponse.json({ success: true, feedUrl });
  } catch (error: any) {
    console.error('Store error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return list of stored feeds if needed
  try {
    const files = fs.readdirSync(DATA_DIR);
    const feeds = files.map(file => ({
      id: path.parse(file).name,
      url: `${process.env.APP_URL || 'http://localhost:3000'}/api/feed/${path.parse(file).name}`
    }));
    return NextResponse.json({ feeds });
  } catch (error) {
    return NextResponse.json({ feeds: [] });
  }
}

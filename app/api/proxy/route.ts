import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 }
    });

    // Instead of throwing, we return the status from the target site
    // This allows the client to handle 404s or 403s gracefully
    const text = await response.text();
    
    return new NextResponse(text, {
      status: response.status,
      headers: { 
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Cache-Control': 'public, s-maxage=3600'
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Connection failed: ${error.message}` }, { status: 502 });
  }
}

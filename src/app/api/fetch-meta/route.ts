import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Normalize URL
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        // Pretend to be a browser so sites don't block us
        'User-Agent': 'Mozilla/5.0 (compatible; BidUpBot/1.0; +https://bidup.lol)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not fetch URL' }, { status: 400 });
    }

    const html = await res.text();

    // Parse meta tags with simple regex (no DOM parser needed in Node edge)
    const getOg = (property: string) => {
      const match = html.match(
        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')
      ) || html.match(
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i')
      );
      return match ? match[1].trim() : null;
    };

    const getTitle = () => {
      const ogTitle = getOg('og:title');
      if (ogTitle) return ogTitle;
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1].trim() : null;
    };

    const getDescription = () => {
      return getOg('og:description') || getOg('description') || null;
    };

    const getImage = () => {
      return getOg('og:image') || null;
    };

    const getFavicon = () => {
      // Try to get a favicon URL from the HTML
      const match = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
        || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
      if (match) {
        const href = match[1];
        // If it's relative, make it absolute
        try {
          return new URL(href, normalizedUrl).href;
        } catch {
          return href;
        }
      }
      // Fallback to /favicon.ico
      try {
        const origin = new URL(normalizedUrl).origin;
        return `${origin}/favicon.ico`;
      } catch {
        return null;
      }
    };

    const title = getTitle();
    const description = getDescription();
    const image = getImage();
    const favicon = getFavicon();

    return NextResponse.json({
      title,
      description: description ? description.slice(0, 200) : null,
      image,
      favicon,
      url: normalizedUrl,
    });
  } catch (error: any) {
    console.error('fetch-meta error:', error);
    return NextResponse.json({ error: 'Failed to fetch page metadata' }, { status: 500 });
  }
}

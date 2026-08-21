import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DATAFAST_API_KEY;
  const websiteId = process.env.DATAFAST_WEBSITE_ID;

  if (!apiKey || !websiteId) {
    return NextResponse.json({ error: 'Missing DataFast credentials' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://datafa.st/api/v1/analytics/realtime?websiteId=${websiteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      next: { revalidate: 10 }
    });

    if (!res.ok) {
      console.error('Failed to fetch from DataFast');
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const json = await res.json();
    const liveUsers = json.data?.[0]?.visitors ?? 0;

    return NextResponse.json({ 
      activeUsers: liveUsers
    });
  } catch (error) {
    console.error('Error fetching live visitors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.VEMETRIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing VEMETRIC_API_KEY' }, { status: 500 });
  }

  try {
    const fetchAnalytics = (dateRange: string) => fetch('https://api.vemetric.com/v1/analytics/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRange,
        metrics: ['users']
      }),
      next: { revalidate: 10 }
    });

    const [liveRes, last24Res] = await Promise.all([
      fetchAnalytics('live'),
      fetchAnalytics('24hrs')
    ]);

    if (!liveRes.ok || !last24Res.ok) {
      console.error('Failed to fetch from Vemetric');
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const [liveJson, last24Json] = await Promise.all([
      liveRes.json(),
      last24Res.json()
    ]);

    const liveUsers = liveJson.data?.[0]?.metrics?.users ?? 0;
    const last24Users = last24Json.data?.[0]?.metrics?.users ?? 0;

    return NextResponse.json({ 
      activeUsers: liveUsers,
      last24Hours: last24Users
    });
  } catch (error) {
    console.error('Error fetching live visitors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

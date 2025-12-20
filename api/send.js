export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    console.error('Environment Variable DISCORD_WEBHOOK_URL is missing');
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    // Vercelでファイルを扱うための設定
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: req.body, // ブラウザから送られたデータをそのまま流す
      headers: {
        'Content-Type': req.headers['content-type'],
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      return res.status(response.status).send(errorText);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

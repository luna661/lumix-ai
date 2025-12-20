export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercelに設定した環境変数を読み込む
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    // フロントエンドから来たリクエストをDiscordへそのまま流す
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: req,
      headers: {
        'Content-Type': req.headers['content-type'],
      },
    });

    return res.status(response.status).send(await response.text());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
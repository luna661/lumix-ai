import { formidable } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // データを壊さないために必須
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    
    // Node.js標準のFormDataを使用
    const discordForm = new FormData();

    // テキスト内容を追加
    if (fields.content) {
      discordForm.append('content', fields.content[0]);
    }

    // 画像ファイルを追加
    if (files.file) {
      const file = files.file[0];
      const fileBuffer = fs.readFileSync(file.filepath);
      // Blobに変換して追加
      const blob = new Blob([fileBuffer], { type: 'image/png' });
      discordForm.append('file', blob, 'p.png');
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: discordForm,
      // 注意: 標準のFormDataを使う場合、headersにContent-Typeを手動で入れてはいけない
    });

    const result = await response.text();
    return res.status(response.status).send(result);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(error.message);
  }
}

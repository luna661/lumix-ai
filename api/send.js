import { formidable } from 'formidable';
import fs from 'fs';
import { FormData, Blob } from 'form-data';

export const config = {
  api: {
    bodyParser: false, // データを壊さないためにパースを無効化
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    const discordForm = new FormData();

    // テキスト内容（名前、IP、Discord IDなど）を追加
    if (fields.content) {
      discordForm.append('content', fields.content[0]);
    }

    // 画像ファイルがある場合は追加
    if (files.file) {
      const file = files.file[0];
      const fileBuffer = fs.readFileSync(file.filepath);
      discordForm.append('file', fileBuffer, {
        filename: 'p.png',
        contentType: 'image/png',
      });
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: discordForm,
      headers: discordForm.getHeaders(),
    });

    const result = await response.text();
    return res.status(response.status).send(result);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(error.message);
  }
}

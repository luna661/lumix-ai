import { formidable } from 'formidable';
import fs from 'fs';
import pkg from 'form-data';
const { FormData } = pkg; // エラーメッセージの指示通りに変更

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    const discordForm = new FormData();

    // テキスト内容を追加
    if (fields.content) {
      discordForm.append('content', fields.content[0]);
    }

    // 画像ファイルを追加
    if (files.file) {
      const file = files.file[0];
      const fileBuffer = fs.readFileSync(file.filepath);
      // form-dataライブラリの仕様に合わせて追加
      discordForm.append('file', fileBuffer, {
        filename: 'p.png',
        contentType: 'image/png',
      });
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: discordForm,
      // getHeaders()を使って正しい boundary をセットする
      headers: discordForm.getHeaders(),
    });

    const result = await response.text();
    return res.status(response.status).send(result);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(error.message);
  }
}

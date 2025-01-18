const express = require('express');
const fetch = require('node-fetch'); // Fetch APIを利用

const app = express();
const PORT = 3000; // プロキシサーバーを動かすポート

// プロキシエンドポイント
app.get('/proxy', async (req, res) => {
  const { url } = req.query; // クエリパラメータ "url" を取得
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    // Googleドライブの画像を取得
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch the image' });
    }

    // ヘッダーをコピーして画像をレスポンスとして返す
    res.set('Content-Type', response.headers.get('Content-Type'));
    response.body.pipe(res); // ストリームとして返送
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});

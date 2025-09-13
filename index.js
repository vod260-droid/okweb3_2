import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// 所有 /api/okxweb3/* 请求都转发
app.all('/api/okxweb3/*', async (req, res) => {
  try {
    // 去掉 /api/okxweb3 前缀
    let targetPath = req.path.replace(/^\/api\/okxweb3/, '');

    // 保留原始 query 顺序
    const query = req.originalUrl.split('?')[1] || '';
    if (query.includes('...path=')) {
      targetPath += '?' + query.split('&...path=')[0];
    } else if (query) {
      targetPath += '?' + query;
    }

    const targetUrl = `https://web3.okx.com${targetPath}`;

    // 构造请求
    const options = {
      method: req.method,
      headers: { ...req.headers },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
    };

    delete options.headers.host; // 防止被目标拒绝

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    // 返回原始响应
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Zeabur OKX Proxy running at http://localhost:${port}`);
});

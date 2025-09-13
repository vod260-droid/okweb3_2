import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 8080;

// 支持 JSON 请求体
app.use(express.json());

app.all('/api/okxweb3/*', async (req, res) => {
  try {
    // 去掉 /api/okxweb3 前缀
    let targetPath = req.url.replace(/^\/api\/okxweb3/, '');

    // 避免 ?...path=xxx 这种额外参数
    if (targetPath.includes('&...path=')) {
      targetPath = targetPath.split('&...path=')[0];
    }

    const targetUrl = `https://web3.okx.com${targetPath}`;

    // 构造请求选项
    const options = {
      method: req.method,
      headers: { ...req.headers },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
    };

    // 删除 Host，防止被目标服务器拒绝
    delete options.headers.host;

    const response = await fetch(targetUrl, options);

    const text = await response.text();

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

const express = require('express')
const app = express()
const port = 8080

app.all('*', async (req, res) => {
  try {
    // 构建目标URL
    let TARGET_BASE_URL="https://web3.okx.com";
    const targetUrl = `${TARGET_BASE_URL}${req.originalUrl}`;
    
    // 转发请求头（过滤掉一些不必要的头信息）
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['x-forwarded-for'];
    
    // 发起远程请求

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: 'manual' // 不自动跟随重定向，由我们自己处理
    });
    // 转发状态码
    res.status(response.status);
    
    // 转发响应头
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // 转发响应内容
    const content = await response.text();
    res.send(content);
    
  } catch (error) {
    // 处理错误
    console.error('转发错误:', error.message);
    res.status(500).send(`转发失败: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

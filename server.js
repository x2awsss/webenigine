const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// 1. واجهة بسيطة فيها شريط بحث
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>متصفحي الخاص</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
                .box { text-align: center; background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                input[type="text"] { width: 320px; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; font-size: 15px; outline: none; }
                button { padding: 12px 20px; border-radius: 8px; border: none; background: #6366f1; color: white; font-size: 15px; cursor: pointer; font-weight: bold; margin-top: 10px; }
                button:hover { background: #4f46e5; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>🌐 متصفح السيرفر الخاص</h2>
                <form action="/search" method="get">
                    <input type="text" name="q" placeholder="اكتب بحث قوقل أو أدخل رابطاً..." required><br>
                    <button type="submit">تصفح الآن</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// 2. توجيه البحث إلى قوقل عبر البروكسي
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.send('يرجى تزويد رابط صحيح');

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        followRedirects: true,
        pathRewrite: (path, req) => '',
    })(req, res, next);
});

// 3. معالجة طلب البحث
app.get('/search', (req, res) => {
    const query = req.query.q;
    let destination;

    if (query.startsWith('http://') || query.startsWith('https://')) {
        destination = query;
    } else {
        destination = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    res.redirect(`/proxy?url=${encodeURIComponent(destination)}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

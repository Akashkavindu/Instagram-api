const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// --- 📸 Instagram API ---
app.get('/api/insta', async (req, res) => {
    let { url } = req.query;
    if (!url) return res.status(400).json({ status: false, message: "URL එකක් ලබා දෙන්න." });

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.instasave.website/media',
            data: new URLSearchParams({ url: url }).toString(),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://instasave.website',
                'referer': 'https://instasave.website/',
                'user-agent': USER_AGENT,
            }
        });

        const tokenRegex = /https:\/\/cdn\.instasave\.website\/\?token=[a-zA-Z0-9._-]+/g;
        const matches = response.data.match(tokenRegex);

        if (matches && matches.length >= 2) {
            const uniqueLinks = [...new Set(matches)];
            return res.json({
                status: true,
                thumbnail: uniqueLinks[0],
                downloadUrl: uniqueLinks[uniqueLinks.length - 1]
            });
        }
        res.status(404).json({ status: false, message: "Media not found." });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// --- 🤖 DeepAI Chat API (Scraped Logic) ---
app.get('/api/deepchat', async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, message: "Prompt එකක් ලබා දෙන්න." });

    try {
        // Form data එකක් විදිහට payload එක හදනවා
        const params = new URLSearchParams();
        params.append('chat_style', 'chat');
        params.append('chatHistory', JSON.stringify([{ role: 'user', content: text }]));
        params.append('model', 'standard');
        params.append('session_uuid', '5857c2d1-e5b9-4165-beb6-a242e354788c');
        params.append('hacker_is_stinky', 'very_stinky');

        const response = await axios({
            method: 'POST',
            url: 'https://api.deepai.org/hacking_is_a_serious_crime',
            headers: {
                'api-key': 'tryit-77318428809-3d7b57af319cc19387a77a13885d6851',
                'User-Agent': USER_AGENT,
                'Referer': 'https://deepai.org/chat',
                'Origin': 'https://deepai.org',
                'Content-Type': 'application/x-www-form-urlencoded', // JSON නෙවෙයි Form data ඕනේ
                'x-requested-with': 'XMLHttpRequest'
            },
            data: params.toString()
        });

        // Response එකේ එන්නේ කෙලින්ම text එක නම් ඒක දෙනවා
        return res.json({
            status: true,
            prompt: text,
            result: response.data
        });
    } catch (e) {
        const errorData = e.response ? e.response.data : e.message;
        res.status(500).json({ 
            status: false, 
            error: "AI Chat failed", 
            details: errorData 
        });
    }
});
// --- 🚀 Server Setup ---
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;

const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/insta', async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: false, message: "URL එකක් ලබා දෙන්න." });
    }

    try {
        const params = new URLSearchParams();
        params.append('url', url);

        const response = await axios({
            method: 'post',
            url: 'https://api.instasave.website/media',
            data: params.toString(),
            headers: {
                'authority': 'api.instasave.website',
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://instasave.website',
                'referer': 'https://instasave.website/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
            }
        });

        const rawData = response.data; // මෙතන තියෙන්නේ ඔයා එවපු දිග string එක

        // 1. Regex එකක් පාවිච්චි කරලා Token ලින්ක්ස් ඔක්කොම හොයාගන්නවා
        // අපි මුලින්ම Thumbnail එකයි Download Link එකයි වෙන් කරගමු
        const tokenRegex = /https:\/\/cdn\.instasave\.website\/\?token=[a-zA-Z0-9._-]+/g;
        const matches = rawData.match(tokenRegex);

        if (matches && matches.length >= 2) {
            // සාමාන්‍යයෙන් පළවෙනි එක Thumbnail, දෙවෙනි එක Video/Download link
            // ඒත් අපි ඔක්කොම ටික පිළිවෙළට යවමු
            const uniqueLinks = [...new Set(matches)]; // Duplicate අයින් කරන්න

            return res.json({
                status: true,
                thumbnail: uniqueLinks[0], // පළවෙනි ලින්ක් එක Thumbnail එක විදිහට ගමු
                downloadUrl: uniqueLinks[uniqueLinks.length - 1], // අන්තිම ලින්ක් එක Download ලින්ක් එක විදිහට ගමු
                allLinks: uniqueLinks
            });
        } else {
            return res.status(404).json({ 
                status: false, 
                message: "ලින්ක් එක සොයාගත නොහැකි විය.",
                debug: rawData.substring(0, 100) // Error එක බලාගන්න පොඩි කෑල්ලක්
            });
        }

    } catch (e) {
        return res.status(500).json({ 
            status: false, 
            message: "Server Error",
            error: e.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API is Live!`));

module.exports = app;
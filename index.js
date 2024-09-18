const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const { URL } = require('url');

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.post('/api', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const response = await axios.get(url);
        const htmlContent = response.data;

        const $ = cheerio.load(htmlContent);

        if (!$('base').length) {
            $('head').prepend(`<base href="${url}">`);
        }

        $('a, img, link, script').each((i, element) => {
            const attribute = $(element).attr('href') || $(element).attr('src');

            if (attribute) {
                const resolvedUrl = new URL(attribute, url).href;
                if ($(element).attr('href')) {
                    $(element).attr('href', resolvedUrl);
                } else if ($(element).attr('src')) {
                    $(element).attr('src', resolvedUrl);
                }
            }
        });

        res.send($.html());
    } catch (error) {
        console.error('Error fetching URL content:', error.message);
        res.status(500).json({ error: 'Error fetching or parsing URL content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running!`);
});

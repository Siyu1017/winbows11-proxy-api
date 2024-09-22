const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const { URL } = require('url');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json())

app.post('/api/view', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            status: 'error',
            code: '500',
            message: 'Missing URL parameter'
        });
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
        res.status(500).json({
            status: 'error',
            code: '500',
            message: 'Error fetching or parsing URL content'
        });
    }
});

app.use(express.static(__dirname), (req, res, next) => {
    res.status(404).json({
        status: 'error',
        code: '404',
        message: 'Page not found'
    })
})

app.listen(PORT, () => {
    console.log(`Server running!`);
});

import * as express from 'express';
import * as marked from 'marked';

import { Words } from '../components/words';

export const router = express.Router();

const renderer = new marked.Renderer();

renderer.link = (href, title, text): string => {
    if (href == 'w') {
        href = '#' + Words.generateSimple(text);
    } else if (href.slice(0, 2) == 'w:') {
        href = '#' + Words.generateSimple(href.slice(2));
    }
    return (new marked.Renderer()).link(href, title, text);
};

router.get('/', async (req, res) => {
    res.render('dictionary', {
        dictionary: await Words.getAll(),
        getSimple: Words.getSimple,
        marked: (s) => marked(s, { renderer })
    });
});

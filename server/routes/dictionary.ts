import * as express from 'express';
import * as marked from 'marked';

import { Word } from '../components/word';

export const router = express.Router();

const renderer = new marked.Renderer();

renderer.link = (href, title, text): string => {
    if (href == 'w') {
        href = '#' + Word.generateSimple(text);
    } else if (href.slice(0, 2) == 'w:') {
        href = '#' + Word.generateSimple(href.slice(2));
    }
    return (new marked.Renderer()).link(href, title, text);
};

const getSimple = Word.getSimple;

router.get('/', async (req, res) => {
    res.render('dictionary', { dictionary: await Word.getAll(), getSimple, marked: (s) => marked(s, { renderer }) });
});

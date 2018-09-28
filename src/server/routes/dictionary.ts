import * as express from 'express';
import * as marked from 'marked';

import { Words } from '../components/words';
import { MediaFiles } from '../components/mediaFiles';

export const router = express.Router();

const renderer = new marked.Renderer();

const generateSimple = (word: string): string =>
    word
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^0-9a-z]+/gi, '-');

renderer.link = (href, title, text): string => {
    if (href == 'w') {
        href = `#${generateSimple(text)}`;
    } else if (href.slice(0, 2) == 'w:') {
        href = `#${generateSimple(href.slice(2))}`;
    }
    return (new marked.Renderer()).link(href, title, text);
};

router.get('/', async (req, res) => {
    res.render('dictionary', {
        dictionary: await Words.getAll(),
        getFileUrl: MediaFiles.getUrl,
        generateSimple,
        marked: (s: string) => marked(s, { renderer })
    });
});

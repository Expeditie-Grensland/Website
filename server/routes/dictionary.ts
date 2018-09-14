import * as express from 'express';

import { Word } from '../components/word';
import { WordDocument } from '../components/word/model';

export const router = express.Router();

const getSimple = Word.getSimple;

const getDefinitions = (word: WordDocument): string[] => {
    for (let i in word.definitions) {
        if (!isNaN(<any>i)) {
            word.definitions[i] = word.definitions[i].replace(/\[\[[^\]]*]]/g, str => {
                str = str.slice(2, -2);
                let strSimple = Word.generateSimple(str);
                return '<a class="pageLink" href="#" onClick="return gotoWord(\'' + strSimple + '\')">' + str + '</a>';
            });
        }
    }
    return word.definitions;
};

router.get('/', async (req, res) => {
    res.render('dictionary', { dictionary: await Word.getAll(), getSimple, getDefinitions });
});

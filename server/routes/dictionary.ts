import * as express from 'express';
import { Word } from '../components/word';
import { WordDocument } from '../components/word/model';

export const router = express.Router();

function addLinksToWord(word: WordDocument): WordDocument {

    for (let i in word.definitions) {
        if (!isNaN(<any>i)) {
            word.definitions[i] = word.definitions[i].replace(/\[\[[^\]]*]]/g, str => {
                str = str.slice(2, -2);
                let strSimple = Word.generateSimple(str);
                return '<a class="pageLink" href="#" onClick="return gotoWord(\'' + strSimple + '\')">' + str + '</a>';
            });
        }
    }
    return word;
}

function addLinksToWords(words: WordDocument[]): WordDocument[] {
    for (let i in words) {
        if (!isNaN(<any>i)) {
            words[i] = addLinksToWord(words[i]);
        }
    }
    return words;
}

router.get('/', async (req, res) => {
    res.render('dictionary', { dictionary: addLinksToWords(await Word.getWords()) });
});

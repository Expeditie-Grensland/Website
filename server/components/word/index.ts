import { IWord, WordDocument, WordSchema } from "./model";

export namespace Word {
    export function createWord(word: IWord): Promise<WordDocument> {
        return WordSchema.create(word);
    }

    export function getWord(word: string): Promise<WordDocument> {
        return WordSchema.findOne({ word: word })
            .collation({ locale: 'nl', strength: 1 })
            .exec();
    }

    export function getWords(): Promise<WordDocument[]> {
        return WordSchema.find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ word: 1 })
            .exec();
    }

    export function getWordById(id: string): Promise<WordDocument> {
        return WordSchema.findById(id).exec();
    }

    export function getWordsByIds(ids: string[]): Promise<WordDocument[]> {
        return WordSchema.find({ _id: { $in: ids } }).exec();
    }

    // TODO: find a better place for these three functions
    // TODO: caching the processed variants
    export function generateSimple(word: string): string {
        return word
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^0-9a-z]+/gi, '-');
    }

    export function addLinksToWord(word: WordDocument): WordDocument {
        for (let i in word.definitions) {
            if (!isNaN(<any>i)) {
                word.definitions[i] = word.definitions[i].replace(/\[\[[^\]]*]]/g, str => {
                    str = str.slice(2, -2);
                    let strSimple = generateSimple(str);
                    return '<a class="pageLink" href="#" onClick="return gotoWord(\'' + strSimple + '\')">' + str + '</a>';
                });
            }
        }
        return word;
    }

    export function addLinksToWords(words: WordDocument[]): WordDocument[] {
        for (let i in words) {
            if (!isNaN(<any>i)) {
                words[i] = addLinksToWord(words[i]);
            }
        }
        return words;
    }
}

import { WordModel } from '../components/words/model';

export default async () => {
    await WordModel.collection.updateMany({}, { $rename: { 'audioFile': 'mediaFile' } });
}

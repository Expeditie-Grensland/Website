import { mediaFileModel } from '../components/mediaFiles/model';

export default async () => {
    await mediaFileModel.collection.updateMany({}, { $unset: { uses: true } });
}

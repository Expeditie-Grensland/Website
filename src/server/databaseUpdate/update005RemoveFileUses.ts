import { mediaFileModel } from '../components/mediaFiles';

export default async () => {
    await mediaFileModel.collection.updateMany({}, { $unset: { uses: true } });
}

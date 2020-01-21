import { ExpeditieModel } from '../components/expedities/model';

export default async () => {
    await ExpeditieModel.collection.updateMany({}, { $unset: { color: true } });
}

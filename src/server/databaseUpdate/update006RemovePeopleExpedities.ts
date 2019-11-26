import { PersonModel } from '../components/people/model';

export default async () => {
    await PersonModel.collection.updateMany({}, { $unset: { expedities: true } });
}

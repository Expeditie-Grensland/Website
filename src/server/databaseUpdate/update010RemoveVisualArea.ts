import { geoLocationModel } from '../components/geoLocations/model';

export default async () => {
    await geoLocationModel.collection.updateMany({}, { $unset: { visualArea: true } });
}

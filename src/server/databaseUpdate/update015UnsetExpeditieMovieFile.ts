import { ExpeditieModel } from '../components/expedities/model';

export default async () => {
    await ExpeditieModel.collection.updateMany({ movieFile: { $exists: true }, "movieFile.restricted": true }, { $set: { showMovie: true, movieRestricted: true } });
    await ExpeditieModel.collection.updateMany({ movieFile: { $exists: true }, "movieFile.restricted": false }, { $set: { showMovie: true, movieRestricted: false } });
    await ExpeditieModel.collection.updateMany({ movieFile: { $exists: false }}, { $set: { showMovie: false, movieRestricted: false } });
    await ExpeditieModel.collection.updateMany({}, { $unset: { movieCoverFile: true, movieFile: true } });
}

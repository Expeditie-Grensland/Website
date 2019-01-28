import { mediaFileModel, MediaFiles } from '../components/mediaFiles';
import * as mongoose from 'mongoose';

export default async () => {
    const promises = [
        mediaFileModel.updateMany({ restricted: { $exists: false } }, { restricted: false }).exec()
    ];

    const mediaFiles = await MediaFiles.getAll();

    for (const file of mediaFiles) {
        if (file != null && file.uses != null)
            for (const use of file.uses) {
                const user = await mongoose.model(use.model).findById(use.id);

                if (user != null) {
                    if ((user as any)[use.field] == null) {
                        console.error(`Erroneous field reference for MediaFile (${file._id}). It has a use in '${use.model}.${use.field}, ${use.id}' but the field doesn't exist.`);
                        continue;
                    }

                    const restricted = (user as any)[use.field].restricted;

                    if (restricted == null) {
                        (user as any)[use.field].restricted = false;
                        promises.push(user.save());
                    }
                }
            }
    }

    await Promise.all(promises);
}

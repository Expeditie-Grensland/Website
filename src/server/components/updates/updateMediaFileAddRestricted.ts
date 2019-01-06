import {mediaFileModel} from "../mediaFiles"
import {MediaFiles} from "../mediaFiles"
import * as mongoose from 'mongoose'

export default async function update() {
    const promises = [
        mediaFileModel.updateMany({restricted: {$exists: false}}, {restricted: false}).exec()
    ];

    const mediaFiles = await MediaFiles.getAll();

    for (const file of mediaFiles) {
        if (file != null && file.uses != null)
            for (const use of file.uses) {
                console.log(use);

                const user = await mongoose.model(use.model).findById(use.id);

                if (user != null) {
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

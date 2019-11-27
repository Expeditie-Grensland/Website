import * as mongoose from 'mongoose';

import { ExpeditieDocument } from '../components/expedities/model';
import { Expedities } from '../components/expedities';
import { MediaFile } from '../components/mediaFiles/model';
import { MediaFiles } from '../components/mediaFiles';

export default async () => {
    let newMediaFiles: MediaFile[] = [
        "5dde87a2159ad25140974351",
        "5dde87a2159ad25140974352",
        "5dde87a2159ad25140974353",
        "5dde87a2159ad25140974354",
        "5dde87a2159ad25140974355",
        "5dde87a2159ad25140974356",
        "5dde87a2159ad25140974357",
        "5dde87a2159ad25140974358",
        "5dde87a2159ad25140974359",
        "5dde87a2159ad2514097435a",
        "5dde87a2159ad2514097435b",
        "5dde87a2159ad2514097435c"
    ].map(id => {
        return {
            _id: mongoose.Types.ObjectId(id),
            ext: "jpg",
            mime: "image/jpeg",
            restricted: false
        }
    });

    let newMediaFileDocuments = await MediaFiles.createMany(newMediaFiles);

    let expedities: ExpeditieDocument[] = await Expedities.getAll();

    for (let i = 0; i < expedities.length; i++) {
        await Expedities.setBackgroundFile(expedities[i], newMediaFileDocuments[i])
    }

    let oldMediaFileIds: mongoose.Types.ObjectId[] = [
        "5ba64fe6815782581d5b61a5",
        "5ba64fe4815782581d5b61a4",
        "5ba64fe6815782581d5b61a6",
        "5ba64fe7815782581d5b61a9",
        "5ba64fe7815782581d5b61a7",
        "5ba64fe7815782581d5b61a8",
        "5bcf6157d4e5675cfc50bc26",
        "5c580557e9077863e465e362",
        "5d211abae9077863e4904e82",
        "5db9f8f66f79dfd268aa9fd3",
        "5dc58f4e6f79dfd268ad2382",
        "5dda74196f79dfd268b1861e"
    ].map(id => mongoose.Types.ObjectId(id));

    oldMediaFileIds.forEach(async id => {
        await MediaFiles.remove(id);
    })
}

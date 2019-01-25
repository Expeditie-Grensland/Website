import {WordModel} from "../words/model"

export default async function update() {
    await WordModel.collection.updateMany({}, {$rename: {'audioFile': 'mediaFile'}});
}

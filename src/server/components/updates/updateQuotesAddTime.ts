import {QuoteModel} from "../quotes/model"

export default async function update() {
    await QuoteModel.updateMany({time: {$exists: false}}, {time: 0}).exec();
}

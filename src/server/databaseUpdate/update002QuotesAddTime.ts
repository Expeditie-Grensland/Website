import { QuoteModel } from '../components/quotes/model';

export default async () => {
    await QuoteModel.updateMany({ time: { $exists: false } }, { time: 0 }).exec();
}

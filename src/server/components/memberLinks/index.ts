import { MemberLinkDocument, memberLinkModel } from './model';

export const getAll = (): Promise<MemberLinkDocument[]> =>
    memberLinkModel.find().sort({ index: 1 }).exec();

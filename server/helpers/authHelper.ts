import * as jwt from 'jsonwebtoken';

import { config } from './configHelper';
import { PersonOrID } from '../components/person/model';
import { Util } from '../components/document/util';

export namespace AuthHelper {
    export const generateJwt = (person: PersonOrID, callback: jwt.SignCallback): void => {
        jwt.sign(
            {
                id: Util.getObjectID(person)
            },
            config.session.secret,
            {
                algorithm: 'HS256'
            },
            callback);
    };

    export const parseJwt = (token: string, callback: jwt.VerifyCallback): void => {
        jwt.verify(
            token,
            config.session.secret,
            callback
        )
    };
}

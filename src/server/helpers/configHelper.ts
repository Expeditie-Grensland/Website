import * as express from 'express';
import * as ldapauth from 'ldapauth-fork';

export const config: Config = require('../../config/config.json');
if (config.ldap.searchAttributes == undefined) {
    config.ldap.searchAttributes = [config.ldap.idField];
} else {
    config.ldap.searchAttributes.push(config.ldap.idField);
}

export type Config = {
    port: number;
    filesFolder: string;
    mongo: {
        url: string;
        user: string;
        pass: string;
    };
    ldap: ldapauth.Options & {
        idField: string;
    };
    session: {
        secret: string;
        cookie: express.CookieOptions;
        useRedis: boolean;
    };
    redis: {
        url: string;
        ttl?: number;
        prefix?: string;
    };
};

// TODO: config validation

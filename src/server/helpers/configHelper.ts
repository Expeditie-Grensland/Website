import * as express from 'express';

export const config: Config = require('../../config/config.json');

export type Config = {
    port: number;

    filesFolder: string;

    mongo: {
        url: string;
        user: string;
        pass: string;
    };

    ldap: {
        url: string;
        bindDN: string;
        bindCredentials: string;
        searchBase: string;
        searchScope: 'base' | 'one' | 'sub';
        searchFilter: string;
        idField: string;
    };

    session: {
        secret: string;
        cookie: express.CookieOptions;
    };

    redis?: {
        url: string;
        ttl?: number;
        prefix?: string;
    };
};

// TODO: config validation

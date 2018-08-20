import * as ldapauth from 'ldapauth-fork';

export const config = require('../../config/config.json');
config.ldap.searchAttributes = ['ipaUniqueID'];

export type Config = {
    port: number;
    mongo: {
        url: string;
        user: string;
        pass: string;
    };
    ldap: ldapauth.Options;
};

export type MongoConfig = Config['mongo'];
export type LDAPConfig = Config['ldap'];

// TODO: config validation

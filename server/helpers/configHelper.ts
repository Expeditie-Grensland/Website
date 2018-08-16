const configJson = require('../../config/config.json');

export const config: ConfigHelper.Config = configJson;

export namespace ConfigHelper {
    export type Config = {
        port: number;
        mongo: {
            host: string;
            port: number;
            db: string;
            user: string;
            pass: string;
        };
    }

    export type MongoConfig = Config["mongo"]
    // TODO: config validation
}

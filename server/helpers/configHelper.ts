const configJson = require('../../config.json')

export const config: any = configJson

export namespace ConfigHelper {
    export interface Structure {
        port: number,
        mongo: {
            host: string,
            port: number,
            db: string,
            user: string,
            pass: string,
        },
    }
    // TODO: config validation
}

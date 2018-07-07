export namespace Config {
    export const port = 3000

    export const session = {
        redis: false,
        secret: "session secret"
    }

    export const database = {
        host: "localhost",
        port: 27017,
        db: "expeditie-grensland",
        user: "",
        pass: ""
    }
}

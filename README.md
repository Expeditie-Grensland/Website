# Expediti.es

Basic Node setup

Config File:
```typescript
export namespace Users {
    export const User = {
        name: "username",
        password: "pass"
    }
}

export namespace Config {
    export const debug = true
    export const port = 3000

    export const session = {
        redis: false,
        secret: "session secret"
    }

    //needed if session.redis
    export const redis = {
        port: 6379,
        ttl: 7 * 24 * 3600
    }

    export const auth = {
        callback: "http://localhost:3000",
        id: "google API ID",
        secret: "google API secret"
    }

    export const db = {
        address: "localhost",
        db: "db",
        user: Users.User,
        port: 23410
    }
}
```

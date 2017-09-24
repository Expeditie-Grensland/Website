# Expediti.es

Basic Node setup

Config File:
```typescript
export namespace Users {
    export const User = {
        name: "user",
        password: "pass"
    }
}

export namespace Config {
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
        address: "localhost:3000",
        db: "db",
        user: Users.User,
        port: 27017
    }
}
```

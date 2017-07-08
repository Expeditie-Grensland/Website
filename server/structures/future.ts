export class Future<A> extends Promise<A> {
    flatMap<B>(f: (a: A) => Promise<B>): Future<B> {
        return new Future<B>((resolve, reject) => {
            this.then(r => f(r).then(r2 => resolve(r2), err => reject(err)), (err: string) => reject(err))
        })
    }

    map<B>(f: (a: A) => B): Future<B> {
        return this.flatMap(a => Future.unit(f(a)))
    }
}

export namespace Future {
    export function unit<A>(a: A): Future<A> {
        return new Future((res, rej) => res(a))
    }

    export function reject<A>(reason: any): Future<A> {
        return new Future((res, rej) => rej(reason))
    }

    export function lift<A>(future: Promise<A>): Future<A> {
        return new Future((res, rej) => future.then(res, rej))
    }
}
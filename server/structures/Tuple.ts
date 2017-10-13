export class Tuple<A, B> {
    _1: A
    _2: B

    constructor(a: A, b: B) {
        this._1 = a
        this._2 = b
    }

    map<C>(f: (a: A, b: B) => C): C {
        return f(this._1, this._2)
    }

    map_1(a: (a: A) => A): Tuple<A, B> {
        return new Tuple(a(this._1), this._2)
    }

    map_2(b: (b: B) => B): Tuple<A, B> {
        return new Tuple(this._1, b(this._2))
    }
}

export class Tuple3<A, B, C> extends Tuple<A, B> {
    _3: C

    constructor(a: A, b: B, c: C) {
        super(a, b)

        this._3 = c
    }
}

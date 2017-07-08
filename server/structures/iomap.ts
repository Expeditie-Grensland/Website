import {Future} from "./future"
import {Tuple} from "./tuple"
import {List} from "./list"

export class IOMap<In, Out, A> {
    run: (r: IOMap.IO<In, Out>) => Future<A>

    constructor(run: (r: IOMap.IO<In, Out>) => Future<A>) {
        this.run = run
    }

    flatMap<B>(f: (a: A) => IOMap<In, Out, B>): IOMap<In, Out, B> {
        return new IOMap(r => this.run(r).flatMap(a => f(a).run(r)))
    }

    map<B>(f: (a: A) => B): IOMap<In, Out, B> {
        return this.flatMap(a => IOMap.unit(f(a)))
    }

    map2<B, C>(b: IOMap<In, Out, B>, f: (a: A, b: B) => C): IOMap<In, Out, C> {
        return this.flatMap(a => b.map(b => f(a, b)))
    }
}

export namespace IOMap {
    export type IO<In, Out> = (i: In) => Future<Out>

    export function unit<In, Out, A>(a: A): IOMap<In, Out, A> {
        return new IOMap(r => Future.unit(a))
    }

    export function apply<In, Out>(data: In): IOMap<In, Out, Out> {
        return new IOMap(r => r(data))
    }

    export function applyWithInput<In, Out>(data: In): IOMap<In, Out, Tuple<In, Out>> {
        return new IOMap(r => r(data).map(p => new Tuple(data, p)))
    }

    export function traverse<In, Out, A>(li: List<In>, f: (i: In) => IOMap<In, Out, A> = apply): IOMap<In, Out, List<A>> {
        return li.foldRight(unit(List.apply([])), (i, mla) =>
            mla.map2(f(i), (la, a) => la.add(a)))
    }

    export function sequence<In, Out, A>(lca: List<IOMap<In, Out, A>>): IOMap<In, Out, List<A>> {
        return lca.foldRight(unit(List.apply([])), (ma, mla) =>
            mla.map2(ma, (la, a) => la.add(a)))
    }

    export namespace ListHelper {
        export function foldMap<In, Out, A, B, C>(checker: IOMap<In, Out, List<A>>, g: (a: List<A>) => List<B>, f: (c: C, b: B) => C, z: C): IOMap<In, Out, C> {
            return checker.map(a => g(a).foldLeft(z, f))
        }

        export function foldZip<In, Out, A, B, C>(checker: IOMap<In, Out, List<A>>, data: List<B>, f: (c: C, ab: Tuple<A, B>) => C, z: C): IOMap<In, Out, C> {
            return foldMap(checker, a => a.zip(data), (c, ab) => f(c, ab), z)
        }

        export function foldLeft<In, Out, A, B>(checker: IOMap<In, Out, List<A>>, f: (c: B, b: A) => B, z: B): IOMap<In, Out, B> {
            return foldMap(checker, a => a, f, z)
        }
    }
}
import { Tuple } from "./tuple"

export abstract class List<A> {
    protected h: A
    protected t: List<A>

    protected match<B>(ifn: (e: Empty) => B, ifl: (x: A, xs: List<A>) => B): B {
        const ref = this
        return this instanceof Empty ? ifn(ref) : ifl(ref.h, ref.t)
    }

    tail(): List<A> {
        return this.match(e => e, (x, xs) => xs)
    }

    head(z: A): A {
        return this.match(e => z, (x, xs) => x)
    }

    add(a: A): List<A> {
        return new Cons(a, this)
    }

    addAll(...a: A[]): List<A> {
        return List.apply(a).append(this)
    }

    foldLeft<B>(z: B, f: (acc: B, next: A) => B): B {
        const go = (rest: List<A>, acc: B): B => {
            return rest.match(e => acc, (x, xs) => go(xs, f(acc, x)))
        }

        return go(this, z)
    }

    foldRight<B>(z: B, f: (next: A, acc: B) => B): B {
        return this.reverse().foldLeft(z, (acc, x) => f(x, acc))
    }

    length(): number {
        return this.foldLeft(0, (acc, a) => acc + 1)
    }

    isEmpty(): boolean {
        return this.match(e => true, (x, xs) => false)
    }

    reverse(): List<A> {
        return this.foldLeft(List.apply([]), (la, a) => la.add(a))
    }

    append(la: List<A>): List<A> {
        return this.foldRight(la, (a, la) => la.add(a))
    }

    prepend(la: List<A>): List<A> {
        return la.append(this)
    }

    get(n: number): A {
        return this.match(() => null, (x, xs) => (n == 0)? x : xs.get(n - 1))
    }

    map<B>(f: (a: A) => B): List<B> {
        return this.foldRight(List.apply([]), (a, lb) => lb.add(f(a)))
    }

    map2<B, C>(lb: List<B>, f: (A, B) => C): List<C> {
        return this.flatMap(a => lb.map(b => f(a, b)))
    }

    filter(f: (a: A) => boolean): List<A> {
        return this.foldRight(List.apply([]), (a, la) => f(a) ? la.add(a) : la)
    }

    filter2(f: (a: A) => boolean): Tuple<List<A>, List<A>> {
        return this.foldRight(new Tuple(List.apply([]), List.apply([])), (a, tup) => f(a) ? tup.map_1(la => la.add(a)) : tup.map_2(la => la.add(a)))
    }

    flatMap<B>(f: (a: A) => List<B>): List<B> {
        return List.concat(this.map(f))
    }

    zipWith<B, C>(lb: List<B>, f: (a: A, b: B) => C): List<C> {
        const go = (la: List<A>, lb: List<B>, lc: List<C> = List.apply([])): List<C> => {
            if (la.isEmpty() || lb.isEmpty()) return lc
            else return go(la.tail(), lb.tail(), lc.add(f(la.head(null), lb.head(null))))
        }

        return go(this, lb)
    }

    zip<B>(lb: List<B>): List<Tuple<A, B>> {
        return this.zipWith(lb, (a, b) => new Tuple(a, b))
    }

    toArray(): A[] {
        return this.foldRight<A[]>([], (a, aa) => aa.concat(a)).reverse()
    }

    sort(ordering?:(a:A, b:A) => number): List<A> {
        const array = this.toArray()
        array.sort(ordering)
        return List.apply(array)
    }
}

export class Empty extends List<any> { }

export class Cons<A> extends List<A> {
    constructor(head: A, tail: List<A>) {
        super()

        this.h = head
        this.t = tail
    }
}

export namespace List {
    export function apply<A>(la: A[]): List<A> {
        const go = (array, n) => {
            if (n < array.length) return new Cons<A>(array[n], go(array, n + 1))
            else return new Empty()
        }

        return go(la, 0)
    }

    export function mk<A>(...la: A[]): List<A> {
        const go = (array, n) => {
            if (n < array.length) return new Cons<A>(array[n], go(array, n + 1))
            else return new Empty()
        }

        return go(la, 0)
    }

    export function unit<A>(a: A): List<A> {
        return new Cons<A>(a, new Empty())
    }

    export function sum(l:List<number>): number {
        return l.foldLeft(0, (acc, a) => acc + a)
    }

    export function concat<A>(lla: List<List<A>>): List<A> {
        return lla.foldRight(apply([]), (la, acc_la) => acc_la.append(la))
    }

    export function forall<A>(la: List<A>, f: (a: A) => void): void {
        la.foldLeft(null, (none, a) => f(a))
    }
}
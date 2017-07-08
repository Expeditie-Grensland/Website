"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Future extends Promise {
    flatMap(f) {
        return new Future((resolve, reject) => {
            this.then(r => f(r).then(r2 => resolve(r2), err => reject(err)), (err) => reject(err));
        });
    }
    map(f) {
        return this.flatMap(a => Future.unit(f(a)));
    }
}
exports.Future = Future;
(function (Future) {
    function unit(a) {
        return new Future((res, rej) => res(a));
    }
    Future.unit = unit;
    function reject(reason) {
        return new Future((res, rej) => rej(reason));
    }
    Future.reject = reject;
    function lift(future) {
        return new Future((res, rej) => future.then(res, rej));
    }
    Future.lift = lift;
})(Future = exports.Future || (exports.Future = {}));

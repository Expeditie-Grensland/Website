"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const future_1 = require("./future");
const tuple_1 = require("./tuple");
const list_1 = require("./list");
class IOMap {
    constructor(run) {
        this.run = run;
    }
    flatMap(f) {
        return new IOMap(r => this.run(r).flatMap(a => f(a).run(r)));
    }
    map(f) {
        return this.flatMap(a => IOMap.unit(f(a)));
    }
    map2(b, f) {
        return this.flatMap(a => b.map(b => f(a, b)));
    }
}
exports.IOMap = IOMap;
(function (IOMap) {
    function unit(a) {
        return new IOMap(r => future_1.Future.unit(a));
    }
    IOMap.unit = unit;
    function apply(data) {
        return new IOMap(r => r(data));
    }
    IOMap.apply = apply;
    function applyWithInput(data) {
        return new IOMap(r => r(data).map(p => new tuple_1.Tuple(data, p)));
    }
    IOMap.applyWithInput = applyWithInput;
    function traverse(li, f = apply) {
        return li.foldRight(unit(list_1.List.apply([])), (i, mla) => mla.map2(f(i), (la, a) => la.add(a)));
    }
    IOMap.traverse = traverse;
    function sequence(lca) {
        return lca.foldRight(unit(list_1.List.apply([])), (ma, mla) => mla.map2(ma, (la, a) => la.add(a)));
    }
    IOMap.sequence = sequence;
    var ListHelper;
    (function (ListHelper) {
        function foldMap(checker, g, f, z) {
            return checker.map(a => g(a).foldLeft(z, f));
        }
        ListHelper.foldMap = foldMap;
        function foldZip(checker, data, f, z) {
            return foldMap(checker, a => a.zip(data), (c, ab) => f(c, ab), z);
        }
        ListHelper.foldZip = foldZip;
        function foldLeft(checker, f, z) {
            return foldMap(checker, a => a, f, z);
        }
        ListHelper.foldLeft = foldLeft;
    })(ListHelper = IOMap.ListHelper || (IOMap.ListHelper = {}));
})(IOMap = exports.IOMap || (exports.IOMap = {}));

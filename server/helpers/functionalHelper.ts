export const pipe = (...fns) =>
    input =>
        fns.reduce((chain, fn) => (...args) => fn(chain(...args)), input);

export const compose = (...fns) =>
    input =>
        fns.reduceRight((chain, fn) => (...args) => fn(chain(...args)), input);

export const aPipe = (...fns) =>
    input =>
        fns.reduce((chain, fn) => chain.then(fn), Promise.resolve(input));

export const aCompose = (...fns) =>
    input =>
        fns.reduceRight((chain, fn) => chain.then(fn), Promise.resolve(input));

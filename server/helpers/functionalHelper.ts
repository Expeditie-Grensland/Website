export const pipe = (...fns: ((value: any) => any)[]): any =>
    (input: any): any =>
        fns.reduce((chain, fn) => (...args) => fn(chain(...args)), input);

export const compose = (...fns: ((value: any) => any)[]) =>
    (input: any): any =>
        fns.reduceRight((chain, fn) => (...args) => fn(chain(...args)), input);

export const aPipe = (...fns: ((value: any) => any)[]) =>
    (input: any): Promise<any> =>
        fns.reduce((chain, fn) => chain.then(fn), Promise.resolve(input));

export const aCompose = (...fns: ((value: any) => any)[]) =>
    (input: any): Promise<any> =>
        fns.reduceRight((chain, fn) => chain.then(fn), Promise.resolve(input));

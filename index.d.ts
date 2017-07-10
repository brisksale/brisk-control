declare module 'brisksale-algebraic-types' {
  import { CurriedFunction2 } from 'ramda';

  interface Action<E, A>  {
    exec(reject: (v: E) => void, resolve: (v: A) => void): void;
    ap(f: any): any;
    map<A2>(fb: (e: A) => A2): Action<E, A2>;
    bimap<E2, A2>(errFn: (value: E) => E2, successFn: (value: A) => A2): Action<E2, A2>;
    chain<A2>(fn: (v: A) => Action<E, A2>): Action<E, A2>;
    chainReject<A2>(fn: (value: E) => Action<E, A2>): Action<E, A2>;
  }

  interface ActionStatic {
    <E, A>(fn: (reject: (v: E) => void, resolve: (v: A) => void) => void): Action<E, A>
    new <E, A>(fn: (reject: (v: E) => void, resolve: (v: A) => void) => void): Action<E, A>;
    cache<E, A>(f: Action<E, A>): Action<E, A>;
    of<E, A>(x: A): Action<E, A>;
    reject<E, A>(val: E): Action<E, A>;
    exec(reject: (v: E) => void, resolve: (v: A) => void, Action:Action<E,A>): void;
  }

  export const Action: ActionStatic;

  interface IO<T> {
    ap<T2, T3>(thatIo: IO<T2>): IO<T3>;
    chain<T2>(fn: (value: T) => IO<T2>): IO<T2>;
    map<T2>(fn: (value: T) => T2): IO<T2>;
    runIO(): T;
  }

  interface IOStatic {
    <T>(fn: () => T): IO<T>;
    new <T>(fn: () => T): IO<T>;
    of<T>(x: T): IO<T>;
    runIO<T>(io: IO<T>): T;
  }

  export const IO: IOStatic;

  interface Identity<T> {
    ap<T2, T3>(app: Identity<T2>): Identity<T3>;
    chain<T2>(fn: (value: T) => Identity<T2>): Identity<T2>;
    map<T2>(fn: (value: T) => T2): Identity<T2>;
  }

  interface IdentityStatic {
    <T>(value: T): Identity<T>;
    new <T>(value: T): Identity<T>;
    of<T>(x: T): Identity<T>;
  }

  export const Identity: IdentityStatic;


  interface Either<L, R> {
    chain<L2, R2, T>(f: (e: Either<L2, R2>) => T): Either<L2, T>;
    ap<R2>(f: (e: R) => Either<L, R2>): Either<L, R2>;
    extend<L2, R2, T>(f: (e: Either<L2, R2>) => T): Either<L2, T>;
    equals<L2, R2>(that: Either<L2, R2>): boolean;
    bimap<L2, R2>(lf: (value: L) => L2, rf: (value: R) => R2): Either<L2, R2>;
    map<T>(fn: (e: R) => T): Either<L, T>;
  }

  interface EitherStatic {
    Left<L, R>(value: L): Either<L, R>;
    Right<L, R>(value: R): Either<L, R>;
    either<L, R, T>(left: (value: L) => T, right: (value: R) => T, e: Either<L, R>): T;
    either<L, R, T>(left: (value: L) => T, right: (value: R) => T):  (e: Either<L, R>) => T;
    either<L, R, T>(left: (value: L) => T): CurriedFunction2<(value: R) => T, Either<L, R>, T>;
    isLeft<L, R>(x: Either<L, R>): boolean;
    isRight<L, R>(x: Either<L, R>): boolean;
    of<L, R>(value: R): Either<L, R>;
  }

  export const Either: EitherStatic;

  interface Maybe<T> {
    getOrElse(value: T): T;
    map<T2>(fn: (vlaue: T) => T2): Maybe<T2>;
    ap<T2>(m: Maybe<T>): Maybe<T2>;
    chain<T2>(fn: (value: T) => Maybe<T2>): Maybe<T2>;
    // reduce(fn: ());
    equals<T2>(m: Maybe<T2>): boolean;
  }

  interface MaybeStatic {
    Just<T>(value: T): Maybe<T>;
    Nothing<T>(): Maybe<T>;
    isJust<T>(x: Maybe<T>): boolean;
    isNothing<T>(x: Maybe<T>): boolean;
    maybe<T, T2>(seed: T2, fn: (value: T) => T2, m: Maybe<T>): T2;
    maybe<T, T2>(seed: T2, fn: (value: T) => T2): (m: Maybe<T>) => T2;
    maybe<T, T2>(seed: T2): CurriedFunction2<(value: T) => T2, Maybe<T>, T2>;
    of<T>(x: T): Maybe<T>;
  }

  export const Maybe: MaybeStatic;


  export const State: any;

  export const Tuple:any;
}
# ActionIO

The `Action` type is used to represent some Action, often asynchronous,
operation (I/O) that may potentially fail. It is similar to the native JS `Promise` type,
however the computation of a `Promise` is executed immediately, while the
execution of an `Action` instance is delayed until explicitly requested.
Actions are *lazy* and adhere to [the *monadic* interface](#interoperability).

ActionIO include:

* [Cancellation](#exec).
* [Resource management](#resource-management).
* [Logging System](#logging-system).
* High performance

```js
const fs = require('fs');
const {Action} = require("brisksale-algebraic-types");

const getPackageName = file =>
  Action.node(done => fs.readFile(file, 'utf8', done))
  .chain(Action.wrap(JSON.parse))
  .map(x => x.name);

getPackageName('package.json')
.exec(console.error, console.log);

```



## Table of contents

- [Usage](#usage)
- [Interoperability](#interoperability)
- [Documentation](#documentation)
    1. [Type signatures](#type-signatures)
    1. [Creating Actions](#creating-Actions)
        * [Action](#Action)
        * [of](#of)
        * [never](#never)
        * [reject](#reject)
        * [after](#after)
        * [rejectAfter](#rejectafter)
        * [try](#try)
        * [wrap](#wrap)
        * [fromPromise](#frompromise)
        * [node](#node)
        * [chainRec](#chainrec)
    1. [Transforming Actions](#transforming-Actions)
        * [map](#map)
        * [bimap](#bimap)
        * [chain](#chain)
        * [ap](#ap)
        * [swap](#swap)
    1. [Error handling](#error-handling)
        * [mapRej](#maprej)
        * [chainRej](#chainrej)
        * [fold](#fold)
    1. [Resource management](#resource-management)
        * [hook](#hook)
        * [finally](#finally)
    1. [Consuming Actions](#consuming-Actions)
        * [exec](#exec)
        * [value](#value)
        * [promise](#promise)
    1. [Parallelism](#parallelism)
        * [race](#race)
        * [and](#and)
        * [or](#or)
        * [both](#both)
        * [parallel](#parallel)
        * [ConcurrentAction](#concurrentAction)
    1. [Utility](#utility-functions)
        * [cache](#cache)
        * [do](#do)
        * [log](#log)

## Interoperability

[<img src="https://raw.github.com/fantasyland/fantasy-land/master/logo.png" align="right" width="82" height="82" alt="Fantasy Land" />][FL]
[<img src="https://raw.githubusercontent.com/rpominov/static-land/master/logo/logo.png" align="right" height="82" alt="Static Land" />][6]

* `ActionIO` implements [Fantasy Land 1][FL1], [Fantasy Land 2][FL2],
  [Fantasy Land 3][FL3], and [Static Land][6] -compatible `Bifunctor`, `Monad`
  and `ChainRec` (`of`, `ap`, `map`, `bimap`, `chain`, `chainRec`). Fantasy Land
  0.x is *mostly* supported. 
* `Action.Par` implements [Fantasy Land 3][FL3] `Alternative` (`of`, `zero`, `map`, `ap`, `alt`).
.

## Documentation

### Type signatures

[Hindley-Milner][2] type signatures are used to document functions. Signatures
starting with a `.` refer to "static" functions, whereas signatures starting
with a `#` refer to functions on the prototype.

A list of all types used within the signatures follows:

- **Action** - Instances of Action 
- **Promise** - Values which conform to the [Promises/A+ specification][7].
- **Functor** - Values which conform to the [Fantasy Land Functor specification][FL:functor]
- **Bifunctor** - Values which conform to the [Fantasy Land Bifunctor specification][FL:bifunctor].
- **Chain** - Values which conform to the [Fantasy Land Chain specification][FL:chain].
- **Apply** - Values which conform to the [Fantasy Land Apply specification][FL:apply].
- **Iterator** - Objects with `next`-methods which conform to the [Iterator protocol][3].
- **Iteration** - `{done, value}`-Objects as defined by the [Iterator protocol][3].
- **Next** - An incomplete (`{done: false}`) Iteration.
- **Done** - A complete (`{done: true}`) Iteration.
- **Cancel** - The nullary cancellation functions returned from computations.

### Creating Actions

#### Action
##### `Action :: ((a -> (), b -> ()) -> Cancel) -> Action a b`

Creates a Action with the given computation. A computation is a function which
takes two callbacks. Both are continuations for the computation. The first is
`reject`, commonly abbreviated to `rej`. The second `resolve`, which abbreviates
to `res`. When the computation is finished (possibly asynchronously) it may call
the appropriate continuation with a failure or success value.

```js
Action(function computation(reject, resolve){
  //Asynchronous work:
  const x = setTimeout(resolve, 3000, 'world');
  //Cancellation:
  return () => clearTimeout(x);
});
```

Additionally, the computation may return a nullary function containing
cancellation logic. This function is executed when the Action is cancelled
after it's [executed](#exec).

#### of
##### `.of :: a -> Action _ a`

Creates a Action which immediately resolves with the given value. This function
is compliant with the [Fantasy Land Applicative specification][FL:applicative].

```js
const eventualThing = Action.of('world');
eventualThing.exec(
  console.error,
  thing => console.log(`Hello ${thing}!`)
);
//> "Hello world!"
```

#### never
##### `.never :: Action a a`

A Action that never settles. Can be useful as an initial value when reducing
with [`race`](#race), for example.

#### reject
##### `.reject :: a -> Action a _`

Creates a Action which immediately rejects with the given value. Just like `of`
but for the rejection branch.

#### after
##### `.after :: Number -> b -> Action a b`

Creates a Action which resolves with the given value after n milliseconds.

```js
const eventualThing = Action.after(500, 'world');
eventualThing.exec(console.error, thing => console.log(`Hello ${thing}!`));
//> "Hello world!"
```

#### rejectAfter
##### `.rejectAfter :: Number -> a -> Action a b`

Creates a Action which rejects with the given reason after n milliseconds.

```js
const eventualError = Action.rejectAfter(500, new Error('Kaputt!'));
eventualError.exec(err => console.log('Oh no - ' + err.message), console.log);
//! Oh no - Kaputt!
```

#### try
##### `.try :: (() -> !a | b) -> Action a b`

Creates a Action which resolves with the result of calling the given function,
or rejects with the error thrown by the given function.

Sugar for `Action.wrap(f, undefined)`.

```js
const data = {foo: 'bar'}
Action.try(() => data.foo.bar.baz)
.exec(console.error, console.log)
//> [TypeError: Cannot read property 'baz' of undefined]
```

#### wrap
##### `.wrap :: (a -> !e | r) -> a -> Action e r`
##### `.wrap2 :: (a, b -> !e | r) -> a -> b -> Action e r`
##### `.wrap3 :: (a, b, c -> !e | r) -> a -> b -> c -> Action e r`

Takes a function and a value, and returns a Action which when execed calls the
function with the value and resolves with the result. If the function throws
an exception, it is caught and the Action will reject with the exception:

```js
const data = '{"foo" = "bar"}'
Action.wrap(JSON.parse, data)
.exec(console.error, console.log)
//! [SyntaxError: Unexpected token =]
```

Partially applying `wrap` with a function `f` allows us to create a "safe"
version of `f`. Instead of throwing exceptions, the wrapd version always
returns a Action when given the remaining argument(s):

```js
const data = '{"foo" = "bar"}'
const safeJsonParse = Action.wrap(JSON.parse)
safeJsonParse(data).exec(console.error, console.log)
//! [SyntaxError: Unexpected token =]
```

Furthermore; `wrap2` and `wrap3` are binary and ternary versions of
`wrap`, applying two or three arguments to the given function respectively.

#### fromPromise
##### `.fromPromise :: (a -> Promise e r) -> a -> Action e r`
##### `.fromPromise2 :: (a, b -> Promise e r) -> a -> b -> Action e r`
##### `.fromPromise3 :: (a, b, c -> Promise e r) -> a -> b -> c -> Action e r`

Allows Promise-returning functions to be turned into Action-returning functions.

Takes a function which returns a Promise, and a value, and returns a Action.
When execed, the Action calls the function with the value to produce the Promise,
and resolves with its resolution value, or rejects with its rejection reason.

```js
const fetchf = Action.fromPromise(fetch);

fetchf('https://api.github.com/users/Avaq')
.chain(res => Action.fromPromise(_ => res.json(), 0))
.map(user => user.name)
.exec(console.error, console.log);
//> "Aldwin Vlasblom"
```

Furthermore; `fromPromise2` and `fromPromise3` are binary and ternary versions
of `fromPromise`, applying two or three arguments to the given function respectively.

#### node
##### `.node :: (((a, b) -> ()) -> ()) -> Action a b`

Creates a Action which rejects with the first argument given to the function,
or resolves with the second if the first is not present.

This is a convenience for NodeJS users who wish to easily obtain a Action from
a node style callback API. To permanently turn a function into one that returns
a Action, check out [futurization](#futurization).

```js
Action.node(done => fs.readFile('package.json', 'utf8', done))
.exec(console.error, console.log)
//> "{...}"
```

#### chainRec
##### `.chainRec :: ((b -> Next, c -> Done, b) -> Action a Iteration) -> b -> Action a c`

Stack- and memory-safe asynchronous "recursion" based on [Fantasy Land ChainRec][FL:chainrec].

Calls the given function with the initial value (as third argument), and expects
a Action of an [Iteration](#type-signatures). If the Iteration is incomplete
(`{done: false}`), then the function is called again with the Iteration value
until it returns a Action of a complete (`{done: true}`) Iteration.

For convenience and interoperability, the first two arguments passed to the
function are functions for creating an incomplete Iteration, and for creating a
complete Iteration, respectively.

```js
Action.chainRec((next, done, x) => Action.of(x < 1000000 ? next(x + 1) : done(x)), 0)
.exec(console.error, console.log);
//> 1000000
```

### Transforming Actions

#### map
##### `#map :: Action a b ~> (b -> c) -> Action a c`
##### `.map :: Functor m => (a -> b) -> m a -> m b`

Transforms the resolution value inside the Action, and returns a new Action with
the transformed value. This is like doing `promise.then(x => x + 1)`, except
that it's lazy, so the transformation will not be applied before the Action is
execed. The transformation is only applied to the resolution branch: If the
Action is rejected, the transformation is ignored. To learn more about the exact
behaviour of `map`, check out its [spec][FL:functor].

```js
Action.of(1)
.map(x => x + 1)
.exec(console.error, console.log);
//> 2
```

#### bimap
##### `#bimap :: Action a b ~> (a -> c) -> (b -> d) -> Action c d`
##### `.bimap :: Bifunctor m => (a -> b) -> (c -> d) -> m a c -> m b d`

Maps the left function over the rejection value, or the right function over the
resolution value, depending on which is present.

```js
Action.of(1)
.bimap(x => x + '!', x => x + 1)
.exec(console.error, console.log);
//> 2

Action.reject('error')
.bimap(x => x + '!', x => x + 1)
.exec(console.error, console.log);
//> "error!"
```

#### chain
##### `#chain :: Action a b ~> (b -> Action a c) -> Action a c`
##### `.chain :: Chain m => (a -> m b) -> m a -> m b`

Allows the creation of a new Action based on the resolution value. This is like
doing `promise.then(x => Promise.resolve(x + 1))`, except that it's lazy, so the
new Action will not be created until the other one is execed. The function is
only ever applied to the resolution value; it's ignored when the Action was
rejected. To learn more about the exact behaviour of `chain`, check out its [spec][FL:chain].

```js
Action.of(1)
.chain(x => Action.of(x + 1))
.exec(console.error, console.log);
//> 2
```

Note that, due to its lazy nature, the stack and/or heap will slowly fill up as
you chain more over the same structure. It's therefore recommended that you use
[`chainRec`](#chainrec) in cases where you wish to `chain` recursively or
traverse a large list (10000+ items).

#### ap
##### `#ap :: Action a b ~> Action a (b -> c) -> Action a c`
##### `.ap :: Apply m => m (a -> b) -> m a -> m b`

Applies the function contained in the right-hand Action or Apply to the value
contained in the left-hand Action or Apply. If one of the Actions rejects the
resulting Action will also be rejected. To learn more about the exact behaviour
of `ap`, check out its [spec][FL:apply].

```js
Action.of(1)
.ap(Action.of(x => x + 1))
.exec(console.error, console.log);
//> 2
```

#### swap
##### `#swap :: Action a b ~> Action b a`
##### `.swap :: Action a b -> Action b a`

Resolve with the rejection reason, or reject with the resolution value.

```js
Action.of(new Error('It broke')).swap().exec(console.error, console.log);
//! [It broke]

Action.reject('Nothing broke').swap().exec(console.error, console.log);
//> "Nothing broke"
```

### Error handling

Functions listed under this category allow you to get at or transform the
rejection reason in Actions, or even coerce Actions back into the resolution
branch in several different ways.

#### mapRej
##### `#mapRej :: Action a b ~> (a -> c) -> Action c b`
##### `.mapRej :: (a -> b) -> Action a c -> Action b c`

Map over the **rejection** reason of the Action. This is like `map`, but for the
rejection branch.

```js
Action.reject(new Error('It broke!')).mapRej(err => {
  return new Error('Some extra info: ' + err.message);
})
.exec(console.error, console.log)
//! [Some extra info: It broke!]
```

#### chainRej
##### `#chainRej :: Action a b ~> (a -> Action a c) -> Action a c`
##### `.chainRej :: (a -> Action a c) -> Action a b -> Action a c`

Chain over the **rejection** reason of the Action. This is like `chain`, but for
the rejection branch.

```js
Action.reject(new Error('It broke!')).chainRej(err => {
  console.error(err);
  return Action.of('All is good')
})
.exec(console.error, console.log)
//> "All is good"
```

#### fold
##### `#fold :: Action a b ~> (a -> c, b -> c) -> Action _ c`
##### `.fold :: (a -> c) -> (b -> c) -> Action a b -> Action _ c`

Applies the left function to the rejection value, or the right function to the
resolution value, depending on which is present, and resolves with the result.

This provides a convenient means to ensure a Action is always resolved. It can
be used with other type constructors, like `Either`, to maintain a
representation of failures:

```js
Action.of('hello')
.fold(Left,Right)
.value(console.log);
//> Right('hello')

Action.reject('it broke')
.fold(Left, Right)
.value(console.log);
//> Left('it broke')
```

### Resource management

Functions listed under this category allow for more fine-grained control over
the flow of acquired values.

#### hook
##### `#hook :: Action a b ~> (b -> Action a c) -> (b -> Action a d) -> Action a d`
##### `.hook :: Action a b -> (b -> Action a c) -> (b -> Action a d) -> Action a d`

Much like [`chain`](#chain), but takes a "dispose" operation first, which runs
*after* the second settles (successfully or unsuccessfully). So the signature is
like `hook(acquire, dispose, consume)`, where `acquire` is a Action which might
create connections, open file handlers, etc. `dispose` is a function that takes
the result from `acquire` and should be used to clean up (close connections etc)
and `consume` also takes the result from `acquire`, and may be used to perform
any arbitrary computations using the resource. The resolution value of `dispose`
is ignored.

```js
const withConnection = Action.hook(
  openConnection('localhost'),
  closeConnection
);

withConnection(
  conn => query(conn, 'EAT * cakes FROM bakery')
)
.exec(console.error, console.log)
```

In the case that a hooked Action is *cancelled* after the resource was acquired,
`dispose` will be executed and immediately cancelled. This means that rejections
which may happen during this disposal are **silently ignored**. To ensure that
resources are disposed during cancellation, you might synchronously dispose
resources in the `cancel` function of the disposal Action:

```js
const closeConnection = conn => Action((rej, res) => {

  //We try to dispose gracefully.
  conn.flushGracefully(err => {
    if(err === null){
      conn.close();
      res();
    }else{
      rej(err);
    }
  });

  //On cancel, we force dispose.
  return () => conn.close();

});
```

#### finally
##### `#finally :: Action a b ~> Action a c -> Action a b`
##### `.finally :: Action a c -> Action a b -> Action a b`

Run a second Action after the first settles (successfully or unsuccessfully).
Rejects with the rejection reason from the first or second Action, or resolves
with the resolution value from the first Action.

```js
Action.of('Hello')
.finally(Action.of('All done!').map(console.log))
.exec(console.error, console.log)
//> "All done!"
//> "Hello"
```

Note that the *first* Action is given as the *last* argument to `Action.finally()`:

```js
const program = compose(
  Action.exec(console.error, console.log),
  Action.finally(Action.of('All done!').map(console.log)),
  Action.of
)

program('Hello')
//> "All done!"
//> "Hello"
```

As with [`hook`](#hook); when the Action is cancelled before the *finally
computation* is running, the *finally computation* is executed and immediately
cancelled.

### Consuming Actions

#### exec
##### `#exec :: Action a b ~> (a -> (), b -> ()) -> Cancel`
##### `.exec :: (a -> ()) -> (b -> ()) -> Action a b -> Cancel`

Execute the computation that was passed to the Action at [construction](#Action)
using the given `reject` and `resolve` callbacks.

```js
Action.of('world').exec(
  err => console.log(`Oh no! ${err.message}`),
  thing => console.log(`Hello ${thing}!`)
);
//> "Hello world!"

Action.reject(new Error('It broke!')).exec(
  err => console.log(`Oh no! ${err.message}`),
  thing => console.log(`Hello ${thing}!`)
);
//> "Oh no! It broke!"

const consoleexec = Action.exec(console.error, console.log);
consoleexec(Action.of('Hello'));
//> "Hello"
```

After you `exec` a Action, the computation will start running. If you wish to
cancel the computation, you may use the function returned by `exec`:

```js
const fut = Action.after(300, 'hello');
const cancel = fut.exec(console.error, console.log);
cancel();
//Nothing will happen. The Action was cancelled before it could settle.
```

#### value
##### `#value :: Action a b ~> (b -> ()) -> Cancel`
##### `.value :: (b -> ()) -> Action a b -> Cancel`

Extracts the value from a resolved Action by execing it. Only use this function
if you are sure the Action is going to be resolved, for example; after using
`.fold()`. If the Action rejects and `value` was used, an (likely uncatchable)
`Error` will be thrown.

```js
Action.reject(new Error('It broke'))
.fold(S.Left, S.Right)
.value(console.log)
//> Left([Error: It broke])
```

Just like [exec](#exec), `value` returns the `Cancel` function:

```js
Action.after(300, 'hello').value(console.log)();
//Nothing will happen. The Action was cancelled before it could settle.
```

#### promise
##### `#promise :: Action a b ~> Promise b a`
##### `.promise :: Action a b -> Promise b a`

An alternative way to `exec` the Action. This eagerly execs the Action and
returns a Promise of the result. This is useful if some API wants you to give it
a Promise. It's the only method which execs the Action without a forced way to
handle the rejection branch, so I recommend against using it for anything else.

```js
Action.of('Hello').promise().then(console.log);
//> "Hello"
```

### Parallelism

#### race
##### `#race :: Action a b ~> Action a b -> Action a b`
##### `.race :: Action a b -> Action a b -> Action a b`

Race two Actions against each other. Creates a new Action which resolves or
rejects with the resolution or rejection value of the first Action to settle.

```js
Action.after(100, 'hello')
.race(Action.after(50, 'bye'))
.exec(console.error, console.log)
//> "bye"

const first = Actions => Actions.reduce(Action.race, Action.never);
first([
  Action.after(100, 'hello'),
  Action.after(50, 'bye'),
  Action.rejectAfter(25, 'nope')
])
.exec(console.error, console.log)
//! "nope"
```

#### and
##### `#and :: Action a b ~> Action a b -> Action a b`
##### `.and :: Action a b -> Action a b -> Action a b`

Logical and for Actions.

Returns a new Action which either rejects with the first rejection reason, or
resolves with the last resolution value once and if both Actions resolve.

This behaves analogues to how JavaScript's and operator does, except both
Actions run simultaneously, so it is *not* short-circuited. That means that
if the second has side-effects, they will run (and possibly be cancelled) even
if the first rejects.

```js
//An asynchronous version of:
//const result = isResolved() && getValue();
const result = isResolved().and(getValue());

//Asynchronous "all", where the resulting Action will be the leftmost to reject:
const all = ms => ms.reduce(Action.and, Action.of(true));
all([Action.after(20, 1), Action.of(2)]).value(console.log);
//> 2
```

#### or
##### `#or :: Action a b ~> Action a b -> Action a b`
##### `.or :: Action a b -> Action a b -> Action a b`

Logical or for Actions.

Returns a new Action which either resolves with the first resolution value, or
rejects with the last rejection value once and if both Actions reject.

This behaves analogues to how JavaScript's or operator does, except both
Actions run simultaneously, so it is *not* short-circuited. That means that
if the second has side-effects, they will run even if the first resolves.

```js
//An asynchronous version of:
//const result = planA() || planB();
const result = planA().or(planB());

//Asynchronous "any", where the resulting Action will be the leftmost to resolve:
const any = ms => ms.reduce(Action.or, Action.reject('empty list'));
any([Action.reject(1), Action.after(20, 2), Action.of(3)]).value(console.log);
//> 2
```

In the example, assume both plans return Actions. Both plans are executed in
parallel. If `planA` resolves, the returned Action will resolve with its value.
If `planA` fails there is always `planB`. If both plans fail then the returned
Action will also reject using the rejection reason of `planB`.

#### both
##### `#both :: Action a b ~> Action a b -> Action a b`
##### `.both :: Action a b -> Action a b -> Action a b`

Run two Actions in parallel. Basically like calling
[`Action.parallel`](#parallel) with exactly two Actions:

```js
Action.parallel(2, [a, b])
===
Action.both(a, b)
===
a.both(b)
```

#### parallel
##### `.parallel :: PositiveInteger -> Array (Action a b) -> Action a (Array b)`

Creates a Action which when execed runs all Actions in the given `array` in
parallel, ensuring no more than `limit` Actions are running at once.

```js
const tenActions = Array.from(Array(10).keys()).map(Action.after(20));

//Runs all Actions in sequence:
Action.parallel(1, tenActions).exec(console.error, console.log);
//after about 200ms:
//> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

//Runs upto five Actions in parallel:
Action.parallel(5, tenActions).exec(console.error, console.log);
//after about 40ms:
//> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

//Runs all Actions in parallel:
Action.parallel(Infinity, tenActions).exec(console.error, console.log);
//after about 20ms:
//> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

If you want to settle all Actions, even if some may fail, you can use this in
combination with [fold](#fold):

```js
const instableActions = Array.from({length: 4}, (_, i) =>
  Action.node(done => done(Math.random() > 0.75 ? 'failed' : null, i))
);

const stabalizedActions = instableActions.map(Action.fold(S.Left, S.Right))

Action.parallel(Infinity, stabalizedActions).exec(console.error, console.log);
//> [ Right(0), Left("failed"), Right(2), Right(3) ]
```

#### ConcurrentAction
##### `.Par :: Action a b -> ConcurrentAction a b`
##### `.seq :: ConcurrentAction a b -> Action a b`

ConcurrentAction (or `Par` for short) provides a mechanism for constructing
a [Fantasy Land `Alternative`][FL:alternative] from a member of `Action`. This
allows Actions to benefit from the Alternative Interface, which includes
parallel `ap`, `zero` and `alt`.

The idea is that you can switch back and forth between `Action` and
`ConcurrentAction`, using `Par` and `seq`, to get sequential or concurrent
behaviour respectively. It's useful if you want a purely algebraic alternative
to [`parallel`](#parallel) and [`race`](#race).

```js
const {Action, Par, seq} = require("brisksale-algebraic-types").Action;

//Some dummy values
const x = 1;
const f = a => a + 1;

//The following two are equal ways to construct a ConcurrentAction
const parx = of(Par, x);
const parf = Par(of(Action, f));

//We can make use of parallel apply
seq(ap(parx, parf)).value(console.log) //> 2

//Or concurrent sequencing
seq(sequence(Par, [parx, parf])).value(console.log) //> [x, f]

//Or racing with alternative
seq(alt(zero(Par), parx)).value(console.log) //> 1
```

### Utility functions

#### cache
##### `.cache :: Action a b -> Action a b`

Returns a Action which caches the resolution value of the given Action so that
whenever it's execed, it can load the value from cache rather than reexecuting
the chain.

```js
const eventualPackage = Action.cache(
  Action.node(done => {
    console.log('Reading some big data');
    fs.readFile('package.json', 'utf8', done)
  })
);

eventualPackage.exec(console.error, console.log);
//> "Reading some big data"
//> "{...}"

eventualPackage.exec(console.error, console.log);
//> "{...}"
```

#### do
##### `.do :: (() -> Iterator) -> Action a b`

A specialized version of [fantasy-do][4] which works only for Actions, but has
the advantage of type-checking and not having to pass `Action.of`. Another
advantage is that the returned Action can be execed multiple times, as opposed
to with a general `fantasy-do` solution, where execing the Action a second time
behaves erroneously.

Takes a function which returns an [Iterator](#type-signatures), commonly a
generator-function, and chains every produced Action over the previous.

This allows for writing sequential asynchronous code without the pyramid of
doom. It's known as "coroutines" in Promise land, and "do-notation" in Haskell
land.

```js
Action.do(function*(){
  const thing = yield Action.after(300, 'world');
  const message = yield Action.after(300, 'Hello ' + thing);
  return message + '!';
})
.exec(console.error, console.log)
//After 600ms:
//> "Hello world!"
```

Error handling is slightly different in do-notation, you need to [`fold`](#fold)
the error into your control domain, I recommend folding into an Either type

```js
const attempt = Action.fold(Left, Right);
const ajaxGet = url => Action.reject('Failed to load ' + url);
Action.do(function*(){
  const e = yield attempt(ajaxGet('/message'));
  return either(
    e => `Oh no! ${e}`,
    x => `Yippee! ${x}`,
    e
  );
})
.exec(console.error, console.log);
//> "Oh no! Failed to load /message"
```

#### log 
##### `#log :: Action a b ~> (b -> String | void) -> Action a b`

This method provides an easy way to log the res value of any Action in your pipeline 
without having force a console.log statement inside map or the stored computations.
The method can be called with no arguments and will default to logging the result of the preivous Action with a stringified version of 
of the Action. You can also provide a unary function that returns a string. The logger will log the result of calling the function with the responce as
the parameter. The logger will still output the stringified version of of the Action;
```js
const noop = () => {};
Action.of("logging")
.log()
.exec(noop, noop)
//> Action Logger called
//> Action.of("logging").log(x => x) "x => x will show up as a default function when a function is not provided"
//> 'logging'

Action.of("logging")
.log(x => `Appended the original output: "${x}"`)
.exec(noop, noop)
//> Action Logger called
//> Action.of("logging").log(x => `Appended the original output: "${x}"`)
//> 'Appended the original output: "logging"'
```




----

[MIT licensed](LICENSE)

<!-- References -->



[FL]:                   https://github.com/fantasyland/fantasy-land
[FL1]:                  https://github.com/fantasyland/fantasy-land/tree/v1.0.1
[FL2]:                  https://github.com/fantasyland/fantasy-land/tree/v2.2.0
[FL3]:                  https://github.com/fantasyland/fantasy-land
[FL:alternative]:       https://github.com/fantasyland/fantasy-land#alternative
[FL:functor]:           https://github.com/fantasyland/fantasy-land#functor
[FL:chain]:             https://github.com/fantasyland/fantasy-land#chain
[FL:apply]:             https://github.com/fantasyland/fantasy-land#apply
[FL:applicative]:       https://github.com/fantasyland/fantasy-land#applicative
[FL:bifunctor]:         https://github.com/fantasyland/fantasy-land#bifunctor
[FL:chainrec]:          https://github.com/fantasyland/fantasy-land#chainrec

[2]:                    https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch7.html
[3]:                    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator
[4]:                    https://github.com/russellmcc/fantasydo
[5]:                    https://vimeo.com/106008027
[6]:                    https://github.com/rpominov/static-land
[7]:                    https://promisesaplus.com/
[8]:                    http://erikfuente.com/
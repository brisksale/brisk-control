# Future

The `Future` type is used to represent some future, often asynchronous,
action that may potentially fail. It is similar to the native JS `Promise` type,
however the computation of a `Promise` is executed immediately, while the
execution of a `Future` instance is delayed until explicitly requested.
This uses The Fluture library to implemeant the future https://github.com/fluture-js/Fluture 
This also includes futurize for convienience https://github.com/futurize/futurize

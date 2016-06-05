title: How to avoid Stack overflow error on recursion
date: 2016-06-06 0:05:00
tags:
  - Javascript
  - Functional Programming
  - Loop
  - Recursion
  - Tail Call Optimization
  - Trampoline
  - Thunk
categories:
  - Sword
---

[Last time]: http://www.thinkingincrowd.me/2016/06/05/How-to-make-long-running-loop-breakable/

## The reason behind

Recursion is a powerful form of loop which repeats itself in similar form, but it should have terminal condition to prevent endless loop.  [Last time][], we even use it with the combination of `setTimeout` to prevent "Not responsive script" warning of long running loop.  

However, normal recursion can possibly generate "Stack overflow" error if it repeats itself too many times.  Let's see a famous recursion example in math, `factorial`.

```javascript
function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1);
}

// factorial(10)
//  => 3628800
// factorial(32768)
//  => Uncaught RangeError: Maximum call stack size exceeded
```

How does the stack looks like?  Why is its size exceeded?  

<img alt="Firefox script not responsive warning" src="http://thinkingincrowd.u.qiniudn.com/factorial_stack_change_flow.png"/>

[Execution Context]: http://dmitrysoshnikov.com/ecmascript/chapter-1-execution-contexts/

Here introduces a term called [Execution Context][] and you can read more following the link.  Simply say, every times a function is called, an execution context is created.  Hence, they are stacked together and increase as the recursion goes deeper.  You can imagine the stack size of `factorial(32768)` given this from `factorial(3)`.


## Tail call elimination comes to rescure

[Tail call elimination]: https://en.wikipedia.org/wiki/Tail_call
[ready in Node.js V8]: https://github.com/v8/v8/commit/6131ab1edd6e78be01ac90b8f0b0f4f27f308071


>**Tail calls can be implemented without adding a new stack frame to the call stack.** Most of the frame of the current procedure is not needed any more, and it can be replaced by the frame of the tail call, modified as appropriate (similar to overlay for processes, but for function calls). The program can then jump to the called subroutine. Producing such code instead of a standard call sequence is called tail call elimination.

[Tail call elimination][] can be applied if we rewritten `factorial` in **tail recursion** style as below.  

```javascript
function factorial(n) {
  function cal(n, result) {
    return n === 0 ? result : cal(n - 1, n * result);
  }

  return cal(n, 1);
}
```

However, the tail call optimization can only be supported until ECMAScript 6, which is not yet available in many JS engines.  _(Notes: Looks like Firefox already supports and it's gonna be [ready in Node.js V8][] soon.)_


## Trampoline

[Trampoline]: https://en.wikipedia.org/wiki/Trampoline_(computing)
[Wiki]: https://en.wikipedia.org/wiki/Thunk

What is [Trampoline][]?

> a trampoline is a **loop** that iteratively invokes **thunk**-returning functions (continuation-passing style).
  ...
  Programmers can use trampolined functions to implement tail-recursive function calls in stack-oriented programming languages.

The simpliest form of trampoline is like below.  

```javascript
function trampoline(fn) {
  var op = fn;
  while (op != null && typeof op === 'function') {
    op = op();
  }
}
```

The `op` is a thunk-returning function.  If the execution result it returns is NOT a function anymore, then the loop stops.  It's not so easy to understand the meaning of thunk from the definition in [Wiki][].  But the explanation in _Functional programming_ section is more clear.

> Functional programming languages have also allowed programmers to **explicitly generate thunks**. This is done in source code **by wrapping an argument expression in an anonymous function that has no parameters of its own.** This prevents the expression from being evaluated until a receiving function calls the anonymous function

Hence, when we rewrite our `factorial` in below style, we can use the `trampoline` to replace the recursive call to even calculate factorial for 1000000.  _(Notes: As the simple version of trampoline detects function return for terminal condition, we have to rewrite the factorial to accept callback instead.)_

```javascript
function thunkedFactorial(n, cb) {
  function cal(n, result, cb) {
    if (n === 0) {
      cb(result);
      return null;
    }

    return function() {
      return cal.bind(this, n - 1, n * result, cb);
    };
  }

  return cal.bind(this, n, 1, cb);
}

trampoline(thunkedFactorial.bind(this, 1000000, console.log.bind(console)));
// => Infinity
```

## Other thoughts?

You may question that, since `trampoline` is actually a loop, it might cause the "Not responsive script" warning as well.  Yes, you are right.  That is why we can use the `setTimeout` trick again as well. :)

```javascript
function factorial(n, cb) {
  function cal(n, result) {
    if (n === 0) {
      cb(result);
    } else {
      setTimeout(function() {cal(n - 1, n * result)});
    }
  }

  return cal(n, 1);
}
```

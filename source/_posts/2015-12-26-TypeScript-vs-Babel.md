title: TypeScript vs Babel
tags:
  - Javascript
  - TypeScript
  - Babel
  - ES6
categories:
  - Sword
date: 2015-12-26 18:38:00
---

## Transpiler or not?

Before discussing TypeScript and Babel, what we need to decide is **whether to use a transpiler or not**.

I was once opponent on using transpiler language when I first saw CoffeeScript, ClojureScript.  I think that is purely the programmer's ingrained habit and that is why it goes popular mostly in particular communities (e.g. Python, Ruby, Lisp).  

There are also other languages (e.g. GWT, Dart) that can be used for web frontend development but they don't feel right either, not to mention other transpiler that compiles some tranditional backend language like JAVA, Ruby or Python to JavaScript.  I don't know why such scenario exists.  Just because they don't want to learn JavaScript?

However, now I am a proponent of using "advanced" language and then transpiling to raw Javascript.  The main reasons are as below:

### Catch up the great features in ES6 standard

ES6 standard includes a lot of great features while not every JS environment (Browsers, Node.js, etc.) supports them well and consistently.  It's a huge benefit if the code can be written in latest standard once and reusabled in every JS environment especially working in full stack JS project.

Transpiler can address this issue pretty well.

### Unevitable build stage

Another reason I oppose transpiler before is the worry on the quality & readability of the code transpiled and the hassle of adding unnecessary build stages.

But now, modulization, code sharing between browser and backend, bundling require a build stage anyway.  What is more, there are plenty of solutions to realize code hot-reload to greatly streamline development process already.  Hence, adding transpilation step is not a problem anymore.

### Code written in TypeScript and Babel IS standard Javascript

With Babel, you just use any new feature it supports in JavaScript way.

TypeScript is so called a typed superset of JavaScript.  In theory, any existing JavaScript can be processed by TypeScript after renaming `.js` to `.ts` directly.  Although actually some edge cases disobey this rule, it's easy to identify and fix.

Using TypeScript and Babel for transpilation differs from CoffeeScript and other alternatives.  We are actually writing the future JavaScript for the moment.  Enjoy it.


## TypeScript vs Babel

### ES6 new feature support

[table]: https://kangax.github.io/compat-table/es6/

Please go check ECMAScript 6 compatibility [table][].  In general, TypeScript support on new ES6 feature cannot catch up Babel.  If you have big concern on this, the only option is Babel.

### Transpiled code readability

Refering to a simple class defined as below.

```
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
      return this.greeting;
  }
}
```

**TypeScript** transpiled code is more clean, recognizable and familiar to the approach we used to define class before.

```
var Greeter = (function () {
      function Greeter(message) {
          this.greeting = message;
      }
      Greeter.prototype.greet = function () {
          return this.greeting;
      };
      return Greeter;
  })();
```

**Babel** transpiled result code takes advantage on using the new Object method but makes the code a little complex.

```
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Greeter = exports.Greeter = (function () {
    // transform-class-properties

    function Greeter(message) {
      _classCallCheck(this, Greeter);

      this.greeting = message;
    }

    _createClass(Greeter, [{
      key: 'greet',
      value: function greet() {
        return this.greeting;
      }
    }]);

    return Greeter;
  })();
```

### Module

In ES6, it is exactly one module per file and one file per module.  `import` and `export` keyword are used to reference other modules or publish its own API.

Babel exactly supports same syntax and can transpile to CommonJS, AMD and other style.

In TypeScript, there are two different concepts:

1. Internal Module (Namespaces)
2. External Module

[handbook]: http://www.typescriptlang.org/Handbook#modules

I don't want to go to the extent of explaining the difference of them.  If you really want to know about it, you can check it out in the TypeScript [handbook][].  The external one is just like the ES6 standard.

What you must know is that, **DON'T mix them together**.  And you should have **NO CHOICE but to use the external module**.  However, if you are telling me you don't have to use any 3rd-party library, then you can go with the internal one.

https://www.stevefenton.co.uk/2015/05/Stop-Mixing-TypeScript-Internal-And-External-Modules/


Some usage syntax of external module used in TypeScript are as below for backwards compatibility with CommonJS and AMD style modules:

```
// xxx.js
export = xxx;

// yyy.js
import xxx = require('./xxx');
```

However, above usage should be legacy soon.  In order to take advantage of ES6 and write uniform code, I think it's better to use the exact ES6 syntax instead.

```
// xxx.js
export default xxx;

// yyy.js
import xxx from './xxx';
```

### Type and IDE support

**TypeScript**

As JSer, I once believed that type and compiler support are not so much important.  I might also be one of the main reason that people thinks it's flexible and love it.  However, quality control is really not that easy if the codebase is large and many people involved, especially when it's used heavily in system with complex business logic like ERP while no Unit Test exists.  If we can have type support and compilation checking with little cost, it should be worthy.

[DefinitelyTyped]: http://definitelytyped.org/

Type support is the first principle in TypeScript and you can tell from its definition of position (typed supperset of JavaScript).  What is more, the [DefinitelyTyped][] project provides type support on many existing 3rd-party JavaScript libraries.  It seems the whole JavaScript world supports type suddently and you don't need to start from scratch.

Let's use Sublime Text 3 with TypeScript plugin as an example to see how it's working.  

**Install TypeScript & Definition manager**

```
npm install -g typescript tsd
tsd install angular angular-route
```

After the installation completes, there is a `typings` folder generated under the location you execute `tsd` command.  The definition files are located there and refering these definition files in your JavaScript is very simple.

```
// <reference path="typings/angularjs/angular.d.ts" />
// <reference path="typings/angularjs/angular-route.d.ts" />

import 'angular';
import 'angular-route';
```

**Code Tips and auto-complete**

<img alt="Code Tips" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Code-Tips.png"/>

**Jump to definition and many support shortcuts**

<img alt="Plugin-Features" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Plugin-Features.png"/>

**Warning about missing properties**

`Show Error List` shows all error in your project.  

<img alt="Miss-Properties-1" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Warn-Miss-Properties1.png"/>

<img alt="Miss-Properties-2" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Warn-Miss-Properties2.png"/>

**Warning about incorrect function signature**

Status bar shows the error focusing on.

<img alt="Unmatch-Interface" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Warn-Interface.png"/>

**Warn but not block**

When you compiles the TypeScript to normal JavaScript, it warns but not blocks on code generation by default.  This is great because it allows for gradual evolvement after you mass renaming `.js` file to `.ts` format for the transition.

<img alt="Warn-Not-Block" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript-Warn-Not-Block.png"/>

So far, you have a glimpse on how fascinating the IDE support is for TypeScript.  I haven't tried the famous Webstorm and Visual Studio, but they should have great support as well.

**Babel**

[Flow]: http://flowtype.org/
[plan]: http://flowtype.org/docs/coming-soon.html#_

There is a project called [Flow][] for type support in Babel.  However, it doesn't support Windows environment yet.  It also have no support for [DefinitelyTyped][] project yet although it [plans][] to.

[Nuclide]: http://nuclide.io/
For IDE, Sublime's Flow plugin doesn't seem to have much feature.  Facebook has built an IDE called [Nuclide][] as suite of packages on top of Atom.  From my experience, installing [Nuclide][] packages is very slow and causes the Atom to halt with high CPU.  I have to give it up in Mac.  You may have a try though.

## Conclusion

<img alt="TypeScript_Babel_Decision" src="http://77g8zm.com1.z0.glb.clouddn.com/TypeScript_Babel_Decision.png"/>

Above sudo code is just for funny purpose.  It's really a choice of taste and there is no aboslute right or wrong for the selection.  Actually, there are other things to consider as well.  Which works better with Webpack and Node.js?  How to fit into the build process?  I will illustrate these areas' consideration in another article later.  

For me, I decided to take the shot for TypeScript because I evaluated that type support is more important than purely pursuing edge feature support and it has great IDE support.  What is more, AngularJS 2 are written with it.  They are my best bet for future.

---
layout: post
title: "Share code between Node.js and browser"
date: 2013-04-13 12:59
comments: true
categories: 
- Sword
tags:
- Javascript
- Node.js
- Modularization
---

## Background

When you are writing a Node.js based web application, it comes to a demand to share code between Node.js and browser because both the frontend and backend are written in JavaScript.  Some utility APIs, such as validation, data processing, are the common cases.  

The philosophy of organizing code in Node.js, current trend also, is modularization.  Each module file has its own execution context, requires its dependent APIs from other modules and publishes its own APIs out for other modules.  

Hence, the code sharing between Node.js and browser requires the code to be used as the same way in browser.

## Situations and Solutions

Things work differently regarding the JS and modules loading mechanism.  Because in browser, it works asynchronously while in Node.js it is synchronous.  In browser, we cannot directly do inline require like Node.js:  

```javascript
var a = xxx;
a.foo();

var b = require('b');
b.bar();
```

There are two kinds of situations:  

### Modularization already realized for browser code
If you have already modularized your JS code for browser and used some AMD / CMD script loader, such as [RequireJS][], or [SeaJS][], you might expect your life would be easier.  However, this is not the case.  

The require must be like below in order to make sure all dependent modules to be loaded successfully and then execute the code which uses them.  

```javascript
define(['./b'], function (b) {
    var a = xxx;
    a.foo();
    b.bar();
    
    return {
        bla: function(){
            console.log('bla');
        }
    };
});
```

We can see that there is quite some syntax different between Node.js style and the AMD / CMD one in browser.  

To overcome this incompatibility, there are two main approaches.  

* Directly add boilerplate code in one side to fit the other  
    1. Some sample manual boilerplate code and also more explanation can be found [here][].  
    2. [node-amd-loader][]: Add one extra line in Node.js module to load AMD style module.  
    3. The [amdefine][] for RequireJS: Special boilerplate code in Node.js module and then can be stripped out by [RequireJS Optimizer][].  

* Build process to handle the boilerplate  
    1. [browserify][]: Recursively analyze all the `require()` calls in your app in order to build a bundle you can serve up to the browser in a single `<script>` tag.  
    2. [modules-webmake][]: Bundle CommonJS/Node.js modules for web browsers.  
    3. [webassemble][]: Based on modules-webmake.  Auto bundle CommonJS/Node.js packages for web browsers.  

Personally, I prefer introducing extra build process to handle the boilerplate for me.  

The advantages of build process boilerplate are:  

1. Boilerplate code is brittle and subject to change.  Adding it to every file makes future change harder.  If some build process can automatically remove them, why not use the build process to automatically add them?  
2. Modularization is good but for production environment in browser, it is always better to minimize network request to load JS file.  Most of the time, module files are bundled into single package for one call.  If build process need to be introduced to handle it, it would be great to integrate sharing logic into it also.  
3. If the boilerplate is introduced in build process, it is better to discover potential error during development cycle instead of last minute preproduction testing.  

You may have concern on effectiveness during development cycle.  However, if you can make good use of a good IDE, say [Sublime Text][] and some task runner, say [Grunt][], it's just a couple of seconds' waiting after a hotkey command after saving your JS file in IDE.  It might just be the time you switch from IDE to browser and press F5.  

### Legacy or namespace browser code style  
Although it's seldom the case that when you are using such hot tech of Node.js but still need to stick to the old style in browser, it's actually easier to share your Node.js code under this circumstance.  

The webmake and webassemble mentioned above is easy to bundle your modules under global or a particular namespace.  

So, what is my favorite choice?  Write the Node.js style code and share them to browser by webassemble.  Why not webmake?  Because the webassemble is made by me. :P  

So tell me what is yours.  
 
[RequireJS]: http://requirejs.org/
[SeaJS]: http://seajs.org/
[here]: http://www.2ality.com/2011/11/module-gap.html
[amdefine]: https://github.com/jrburke/amdefine
[RequireJS Optimizer]: https://github.com/jrburke/amdefine#optimizer
[node-amd-loader]: https://github.com/ajaxorg/node-amd-loader
[browserify]: https://github.com/substack/node-browserify
[modules-webmake]: https://github.com/medikoo/modules-webmake
[webassemble]: https://github.com/kenspirit/webassemble
[Sublime Text]: http://www.sublimetext.com/
[Grunt]: http://gruntjs.com/

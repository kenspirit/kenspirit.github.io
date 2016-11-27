---
layout: post
title: "How to use Ext Ajax in Promise style and test it"
date: 2013-11-25 08:50
comments: true
categories: 
- Sword
tags:
- Javascript
- Promise
- ExtJS
- Functional Programming
- Ajax
- Jasmine
- Mocha
- Sinon.js
---


[blog]: http://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/
[ExtPromise]: https://github.com/kenspirit/ExtPromise
[bluebird]: https://github.com/petkaantonov/bluebird
[Sinon.js]: http://github.com/cjohansen/Sinon.JS
[jasmine-ajax]: http://www.thinkingincrowd.me/blog/2012/08/30/extjs-jasmine-unit-test-part-2-ajax-behavior-2/
[Jasmine]: http://pivotal.github.com/jasmine/
[Mocha]: http://github.com/visionmedia/mocha/

After translated a [blog][] about how Promise works in a more functional programming way, I tried to build something to make Ext Ajax call to work in Promise style as a practice.  

[ExtPromise][] is a simple wrapper to Ext.Ajax and Ext.data.Connection to help you do an Ajax call in Promise style instead of passing success/failure callback to it.  The Promise library I used is the [bluebird][].  I chose it not only because its speed is faster than most of the Promise library, but also its error handling philosophy looks cleaner and more attractive.  

It didn't took long to implement the ExtPromise wrapper but it took me some time to test it.  

Originally, I thought I could use the [jasmine-ajax][] I enhanced and shared before about how to test Ajax call in ExtJs.  However, it doesn't work as expected.  Testing Async method in [Jasmine][] seems very awkward because the API in version 1.4 and 2.0 are dramaticlly different.  Even worst, many strange issues messed around all the way.  

I finally gave up and search other alternative approaches.  [Sinon.js][] and [Mocha][] come to rescure.  It is pretty easy to test the Ajax call using the `useFakeXMLHttpRequest` provided by Sinon and the Async testing in Mocha looks more intuitive (Jasmine 2.0 use the same way).  Let's see how the testing (BDD style) is setup.  

```javascript
describe("Ajax should be now working in promise style", function() {
    var xhr, ajax;

    before(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function(xhr) {
            ajax = xhr;
        }
    })

    after(function() {
        xhr.restore();
    });

    describe('ExtPromise.Ajax', function() {
        it("#success case", function(done) {
            ExtPromise.Ajax().request({url: 'foo'})
            .then(function(result) {
                expect(result.responseText).to.equal('Bar');
                done();
            })
            .catch(done);

            ajax.respond(200, { 'Content-Type': 'application/json' }, 'Bar');
        });
    });
});
```

It's quite straightforward.  Before test spec runs, it's required to stub the XMLHttpRequest using Sinon's `useFakeXMLHttpRequest` API and obtain a reference in the `onCreate` method so that later it can be used to stub a response.  

Passing a `done` parameter in the test spec function tells Mocha that this spec is for Async testing and callinig `done()` will end it.  One thing to notice here is this part.  

```javascript
    .catch(done);
```

If you don't do this, and the assertion in the test spec failed, the error it shows will be a timeout error instead of telling the true assertion error.  

When testing failure case, the style written like below doesn't look good and error-prone because `done()` is called twice although you might think the success resolver doesnot require as it should not be called.  

```javascript
    ExtPromise.Ajax().request({url: 'foo', scope: scopeObj})
        .then(scopeObj.getName)
        .then(function(result) {
            expect(result).to.equal('Bar In scope');
            done();
        }, function(result) {
            expect(result.status).to.equal(500);
            done();
        })
        .catch(done);

    ajax.respond(500, { 'Content-Type': 'application/json' }, 'Error');
```

You may rewrite the call to `done` in a then call.  

```javascript
    ExtPromise.Ajax().request({url: 'foo', scope: scopeObj})
        .then(scopeObj.getName)
        .then(function(result) {
            expect(result).to.equal('Bar In scope');
        }, function(result) {
            expect(result.status).to.equal(500);
        })
        .then(done)
        .catch(done);

    ajax.respond(500, { 'Content-Type': 'application/json' }, 'Error');
```


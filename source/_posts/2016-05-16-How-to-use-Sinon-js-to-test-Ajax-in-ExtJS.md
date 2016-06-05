title: How to use Sinon.js and ExtPromise to test Ajax in ExtJS
date: 2016-05-16 22:09:01
tags:
  - Javascript
  - ExtJS
  - Unit Test
  - Sinon.js
  - Promise
categories:
  - Sword
---

## Ajax Usage Sample in ExtJS

Imagine we have a simple scenario that we have to validate user login ID when `onblur` event occurs in a user registration page.  The `validateLoginID` method below is a simple implementation of the event listener.  

```javascript
validateLoginID: function() {
    var loginIDCmp = Ext.getCmp('loginID')，
        loginID = loginIDCmp.getValue();

    Ext.Ajax.request({
        url : '/loginId/validate',
        method : 'GET',
        params : {
            loginID : loginID
        },
        success : function(data) {
            if (data.responseText != '') {
                loginIDCmp.markInvalid('Login ID is taken already.');
            }
        },
        failure : function(data) {
            alert('Server Error.');
        }
    });
}
```

If we would like to test this piece of code, how should we do that?  This event listener encapsulates the `Ext.Ajax.request` completely with two anonymous functions as the `success` and `failure` callbacks.  

Is that we must change the anonymous callbacks into named functions to test individually?  In real ExtJS application code, many callbacks are short and not-reusable.  They acts as private functions that belongs to implementation detail and we seldom split them out to test individually.  **When we write testing script, we test against the interface, the contracted behavior provided.  It's just that this contract is not a simple return value but UI behaviors.**  I think this is also why UI testing is more unfamiliar and difficult to test for most of the developers.

**Does that mean we can only use Selenium or Robot Framework to simulate user operation in browser and test?  Not Really.  We can manually fire event on ExtJS Component, fake XMLHttpRequest and response by Unit Test.**  This would be more flexible and lightweighted.


## Sinon.js

[Sinon.js]: http://sinonjs.org/

[Sinon.js][] can be used to fake XMLHttpRequest and response.  Below test spec tests from two angles:  

1. `onblur` event can trigger the validation for LoginID  
2. Based on the mock Ajax response，Login ID component can display desired error message.  

```javascript
describe('Login ID Unique Validation - Duplicate', function() {
    var xhr, ajax;

    before(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function(xhr) {
            ajax = xhr;
        };
    });

    after(function() {
        xhr.restore();
    });

    it('Focus leaving name field should trigger unique validation.', function(done) {
        var loginCmp = new com.foo.loginComponent({}),
            loginIDCmp = Ext.getCmp('loginID');

        loginIDCmp.setValue('Ken');
        loginIDCmp.fireEvent('blur');

        ajax.respond(200,
            { 'Content-Type': 'application/json' },
            'Login ID is taken already.');

        setTimeout(function() {
           expect(loginIDCmp.getActiveError())
               .to.equal('Login ID is taken already.');
           done();
        }, 100);
    });
});
```

Not sure if you have spotted any special handling in above test spec.  At the very end, we must use `setTimeout` and `done` to write it in async style.  Why?  

Actually, the Ajax implementation in ExtJS use `setInterval` to keep polling the `readystate` of the XMLHttpRequest.  When it detects that the ready state is changed and indicated that the Ajax call is completed, it calls the callback correspondingly.

Hence, if we don't use our `setTimeout` to postpone the `expect` assertion, it runs immediately without a chance to wait the execution of the callbacks.  This test spec will never pass.

However, this kind of hack is quite ugly if you agree.  And how can I know how much time it needs before Ajax request starts?  How can I know whether the timer to check Ajax ready state in ExtJS will be changed in the future?  If we don't want to write our test code like this, how can we test any ExtJS application code involves Ajax request?  

## ExtPromise

[ExtPromise]: https://github.com/kenspirit/ExtPromise

What we want is that our assertion will be executed only when Ajax request completes.  Hence, it would be a charm if `Ext.Ajax.request` returns a Promise in ExtJS 3/4.  Before, I wrote the [ExtPromise][] when I first learned Promise and intended to use it to replace some flag cross-checking logic in my team.  Now, I can have one more reason to persuade them to use it instead of plain `Ext.Ajax.request`.  As you can see below, it takes little effort to change original application code.  

```javascript
// Source
validateLoginID: function() {
    var loginIDCmp = Ext.getCmp('loginID')，
        loginID = loginIDCmp.getValue();

    return ExtPromise.Ajax().request({
            url : '/loginId/validate',
            method : 'GET',
            params : {
                loginID : loginID
            }
        })
        .then(function(data) {
            var errMsg = '';
            if (data.responseText != '') {
                errMsg = 'Login ID is taken already.'；
                loginIDCmp.markInvalid(errMsg);
            }
            return errMsg;
        },
        function() {
            return 'Server Error.';
        })
        .then(function(errMsg) {
            return errMsg;
        });
}
```

Since the application code is changed to be in Promise style, we can consider how to change our test spec.  It's said that this test contains two parts, one is the Ajax logic and the other one is the `onblur` event triggering.

If now we have to change to use direct function calls to take advantage of the Promise style for testing, how can we test the event triggering then?  Actually, we can still manually trigger the event, and use `sinon.stub` to detect how many times `validateLoginID` are called.  One thing to be careful is that, when registering the event listener, we cannot directly bind the `validateLoginID` to the event, and must encloses it in another function.  

```javascript
loginIDCmp.on('blur', function() {loginCmp.validateName();}, loginCmp);
```

Below I will mainly focus on explaining the Ajax testing part.  This time we have to use the `fakeServer` in Sinon and most importantly to configure the server to respond immediately so that we don't have to manually write `server.respond`.  Actually, you cannot even find a suitable place to write that even if you want.  As you can see now, the code for test assertion follows naturally after changing the application code to Promise style.  

```javascript
// Spec
describe('Login ID Unique Validation - Duplicate', function() {
    var server;

    before(function() {
        server = sinon.fakeServer.create(); 
        server.configure({respondImmediately: true});
    });

    after(function() {
        server.restore();
    });

    it('Focus leaving name field should trigger unique validation.', function(done) {
        server.respondWith('GET', '/foo',
            [200, { 'Content-Type': 'application/json' },
             'Login ID is taken already.']);

        var loginCmp = new com.foo.loginComponent({}),
            loginIDCmp = Ext.getCmp('loginID');

        loginIDCmp.setValue('Ken');

        // If still want to test event trigger
        // 
        // var stubbed = sinon.stub(loginCmp, 'validateLoginID');
        // loginIDCmp.fireEvent('blur');
        // expect(stubbed.calledOnce).to.be.true;
        // stubbed.restore();

        loginCmp.validateLoginID()
            .then(function(errMsg) {
                expect(loginIDCmp.getActiveError()).to.equal(
                  'Login ID is taken already.');
             })
            .then(done)
            .catch(done);
    });
});
```

Please feel free to leave your comment or suggestion on how to test UI behavior and what should be tested.  

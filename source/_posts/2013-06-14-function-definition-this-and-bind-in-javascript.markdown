---
layout: post
title: "Function definition, this and bind in JavaScript"
date: 2013-06-14 20:00
comments: true
categories: 
- Sword
tags:
- Javascript
- Function definition
- this
- bind
- Execution context
---

[ECMA-262]: http://www.ecma-international.org/publications/standards/Ecma-262.htm

I thought I know the Function definition, execution context and the behavior of _this_ in JavaScript.  However, I realized that actually I don't or the knowlege is still not firmly grounded in my mind when I wrote some code similar to below snippet but have no instinct of the error.  

```javascript
var TestObj = {
    a: function() {
        console.log('A');
    },
    b: function() {
        console.log('B');
        this.a();
    }
};

TestObj.b();

var c = TestObj.b;
c();
```

The result will be as below, right?  

```javascript
B
A
B
A
```

You might suspiciously answer No but If your instint doesnot tell you that and why, then you don't know JavasScript well either like me.  The result actually is:  

```javascript
B
A
B
TypeError: Object [object global] has no method 'a'
```

It is a little bit awkward or counterintuitive at first glance but it's JavaScript.  It's the feature and amazing part.  Let's break it down piece by piece and see why.  

## Function definition  
The _TestObj_ includes two methods.  The Function definition there actually creates two anonymous functions and then the references to the functions are assigned to the properties _a_ and _b_.  Those two functions are not owned by _TestObj_ and just referred by the two properties of _TestObj_.  This is the most important part causes the confusion.  Hence, above code has not much difference than below except now we assign a name _B_ for one of the function:  

```javascript
function B() {
    console.log('B');
    this.a();
};

var TestObj = {
    a: function() {
        console.log('A');
    },
    b: B
};
```

## this  
In [ECMA-262][] edition 5.1:  
>**10.4.3 Entering Function Code**  
>The following steps are performed when control enters the execution context for function code contained in
function object F, a caller provided thisArg, and a caller provided argumentsList:  

>1. If the function code is strict code, set the ThisBinding to thisArg.  
2. Else if thisArg is null or undefined, set the ThisBinding to the global object.  
3. Else if Type(thisArg) is not Object, set the ThisBinding to ToObject(thisArg).  
4. Else set the ThisBinding to thisArg.  
...

_this_ is a special keyword refers to the binding object in the current execution context of the Function.  

Once we invoke the Function through Object method, the _this_ inside the Function body actually has been set to the _TestObj_ instance.  Hence, _TestObj.b()_ logs B and A consecutively because _this.a_ exists as a property of _TestObj_.  

However, below statements mean differently.  

```javascript
var c = TestObj.b;
c();
```

Actually, variable _c_  is just another reference pointing to Function B.  Hence _c()_ is same as _B()_.  When directly invoking Function B, the _this_ is bound to global object.  Because there is no _a_ defined in the global object, error occurs.   

## How to set a particular object as _this_ to function  
It's commonly known that _call_ and _apply_ method can be called on the Function object providing a specific object as _this_, say:  

```javascript
var c = TestObj.b;
c.call(TestObj);
```

The result is desirable.  However, this approach invokes the Function immediately.  This is normally not the case that a Function has to be assigned to a Reference and passed around which is meant to be executed dynamically, like:  

```javascript
function dynamic(fn) {
  fn();
}

dynamic(TestObj.b);
```

In this case, we should not use _fn.call(TestObj)_ or _fn.apply(TestObj)_ because it's a generic Function which should have no knowledge on the Function passed in.  Hence, above is not working.  

There is still another lifesaver though.  The _bind_ method of Function.  This method can take the passed in Object like what _call_ or _apply_ does, but it returns a new Function whose _this_ binding is set to the Object passed in.  So, above code can be revised as:  

```javascript
function dynamic(fn) {
  fn();
}

dynamic(TestObj.b.bind(TestObj));
```

It's fun, isn't it?

\[Edited on 2013/06/17\]: Today, I saw another case which maybe confusing too.  

```javascript
var length = 3;

function logLength() {
  console.log(this.length);
}

var TestObj = {
    length: 2,
    b: logLength,
    c: function() {
        (function(fn) {
            arguments[0]();
        })(logLength);
    }
};

TestObj.b();
TestObj.c();
```

What do you think the console should log?  Will it be _2_ and _3_?  Actually, the result is _2_ and _1_.  Because the _TestObj.c()_ actually is calling the function _logLength_ on the arguments Object, and then the _this.length_ is referring to its own length, which is _1_.  

More fun, right?

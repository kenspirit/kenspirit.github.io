title: "Prototype chain, and relationship among prototype, __proto__ and constructor in JavaScript"
date: 2016-06-09 10:16:25
tags:
  - Javascript
  - Functional Programming
categories:
  - Sword
---

As we know, JavaScript differs from other class based inheritance language.  Constructor (function) uses its `prototype` property to implement **prototype-based inheritance** and **shared property**.  

From ECMA Spec:
>In a class-based object-oriented language, in general, state is carried by instances, methods are carried by classes, and inheritance is only of structure and behaviour. In ECMAScript, the state and methods are carried by objects, while structure, behaviour, and state are all inherited.

Let's see below example.  Instances created by `new Mold()` inherits the property from its prototype.  You can see different behaviors if we change different property in different levels.  

```javascript
function Mold() {
}  

Mold.prototype.sizes = [10, 20, 30];
Mold.prototype.brand = 'KC';  

var instance = new Mold();
var instance2 = new Mold();  

console.log(instance.sizes)   // => [10, 20, 30];
console.log(instance2.brand) // => 'KC';  

// Adds property with same name shadows the one in prototype
instance.brand = 'K & W';

console.log(instance.brand); // => 'K & W'
console.log(Mold.prototype.brand); // => 'KC'

// Changed on prototype affects instance that doesn't have property with same name
Mold.prototype.brand = 'K & W & L'

console.log(instance.brand); // => 'K & W'
console.log(instance2.brand); // => 'K & W & L'

// Changed on property which is Array or Object type in prototoype affects all
instance.sizes[0] = 40;
Mold.prototype.sizes[2] = 60;

console.log(Mold.prototype.sizes); // => [40, 20, 60]
console.log(instance2.sizes) // => [40, 20, 60]
```

I think most of the JSer know the concept & behavior above.  However, do you know the relationship between `__proto__`, `prototype` and `constructor`?  


Here is what the ECMAScript Spec said.

**What is prototype chain**:

>Every object created by a constructor has an implicit reference (called the object’s prototype) to the value of its constructor’s "prototype" property. Furthermore, a prototype may have a non-null implicit reference to its prototype, and so on; this is called the prototype chain. When a reference is made to a property in an object, that reference is to the property of that name in the first object in the prototype chain that contains a property of that name. In other words, first the object mentioned directly is examined for such a property; if that object contains the named property, that is the property to which the reference refers; if that object does not contain the named property, the prototype for that object is examined next; and so on.

**Explanation on Object and Function prototype object**:

>The Object prototype object is the intrinsic object %ObjectPrototype%. The Object prototype object is an ordinary object.
>
>The value of the [[Prototype]] internal slot of the Object prototype object is null
>
>...
>
>The Function prototype object is the intrinsic object %FunctionPrototype%. The Function prototype object is itself a built-in function object. When invoked, it accepts any arguments and returns undefined. It does not have a [[Construct]] internal method so it is not a constructor.
>
>NOTE The Function prototype object is specified to be a function object to ensure compatibility with ECMAScript code that was created prior to the ECMAScript 2015 specification.
>
>The value of the [[Prototype]] internal slot of the Function prototype object is the intrinsic object %ObjectPrototype% (19.1.3).
>
>The Function prototype object does not have a prototype property.
>The value of the length property of the Function prototype object is 0.
>The value of the name property of the Function prototype object is the empty String

Honestly, for me, it took me a long long time to try to understand that.  I have extract some important concepts here and try to be brief:  

1. Function instances that can be used as a constructor have a `prototype` property.  When we use `new` with this function to create instances, the object pointed by the `prototype` property will be assigned as the prototype of the instances.  
2. `__proto__` is the actual object that is used in the property lookup chain.  All objects have this property.  
3. `constructor` is a function object that creates and initializes objects.  It's a property in the Prototype Object;

Maybe the wording is still not as expressive as the graph as below.  

<img alt="Firefox script not responsive warning" src="https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/JS_prototype_chain.png"/>

At first glance, this diagram might seems messy.  Let's examine it piece by piece from the easiest part and pay attention to some important points.  

1. `prototype` property doesn't exists in instances created by Mold.  Only function has.  
2. Each function's prototype has a `constructor` property points to itself.  
3. `__proto__` points to the `prototype` of its constructor.  The `Mold` instance points to `Mold` function, the `Mold` function points to `Function` function, the `Function` function points to itself and `Object` function points to `Function` function.  
4. `prototype` property in Object doesn't have `__proto__`.  
5. `__proto__` of the Function prototype object is `Object.prototype`.

Here is some script for you to understand it.

```javascript
// 1
typeof instance instance.prototype // => 'undefined'

// 2
Mold.prototype.constructor === Mold
Function.prototype.constructor === Function
Object.prototype.constructor === Object

// 3
instance.__proto__ === Mold.prototype
Mold.__proto__ === Function.prototype
Object.__proto__ === Function.prototype
Function.__proto__ === Function.prototype

// 4
Object.prototype.__proto__ === null

// 5
Function.prototype.__proto__  === Object.prototype
Mold.prototype.__proto__  === Object.prototype
```

How about take some exams to test see if you understand what I and ECMA spec said above?  :)  

```javascript
typeof Function.prototype === ?
typeof Function.prototype.prototype === ?
Function.prototype.length === ?

instance.constructor === ?
instance.__proto__.constructor === ?

Mold.constructor === ?
Mold.__proto__.constructor === ?
```





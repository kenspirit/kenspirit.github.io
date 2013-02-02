---
layout: post
title: "String interpolation should not be used with Class Directive in AngularJS"
date: 2013-01-30 07:02
comments: true
categories:
- Sword
tags:
- AngularJS
- Javascript
- ngClass
- Directive
- String interpolation
---

[AngularJS]: http://angularjs.org
[Directive]: http://docs.angularjs.org/guide/directive
[Expression]: http://docs.angularjs.org/guide/expression

Do you see any issue in below HTML snippet with [AngularJS][] code?  
{% raw %}
``` html
    <span ng-class="task-{{task.type}}">{{task.type}}</span>
    <input type="text" ng-model="task.type"/>
```
{% endraw %}

Do you see what is the difference between the one below and above?  
{% raw %}
``` html
    <span ng-class="'task-' + task.type">{{task.type}}</span>
    <input type="text" ng-model="task.type"/>
```
{% endraw %}

The first one use String interpolation in Class [Directive][].  The result is that the css class you expect to got based on model value _task.type_ will not be applied to the _span_ element. It took me a long time to figure out why.  

Before furher reading, it's better if you have read the Developer Guide, [Directive][] section which explains the concept of **String interpolation** and **Compilation process, and directive matching**, although honestly, it doesn't quite clearly say how the String interpolation should or can be used.  Before, I just have the rough idea that it can be evaluated and replaced in String and also reflect the change from model.  

If you use the first code snippet to create sample AngularJS page and bind an _task_ model to it, you can see that the String Interpolation "_works_": the ng-class attribute and the content of the span tag can be replaced correctly with model value.  Even if you change the model value through the input field, they can be updated accordingly.  However, the CSS is not applied as expected.

Why?  Let's take a look at AngularJS source:  

In function _collectDirectives_, when it checks the element's attribute, it calls _addAttrInterpolateDirective_ before _addDirective_.  In _addAttrInterpolateDirective_, the [Expression][] in String interpolation will be converted to a new directive with compile function to watch the change and set new value to the attribute which is the class directive in this case.  There are two important things need to be aware of:  

1. A new directive is ad-hoc created before the class directive it's inspecting.  
2. The new directive's linking function is watching the expression change to update the class directive value itself.  

```javascript
    function collectDirectives(node, directives, attrs, maxPriority) {
      var nodeType = node.nodeType,
          attrsMap = attrs.$attr,
          match,
          className;

      switch(nodeType) {
        case 1: /* Element */
          // use the node name: <directive>
          addDirective(directives,
              directiveNormalize(nodeName_(node).toLowerCase()), 'E', maxPriority);

          // iterate over the attributes
          for (var attr, name, nName, value, nAttrs = node.attributes,
                   j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
            attr = nAttrs[j];
            if (attr.specified) {
              name = attr.name;
              nName = directiveNormalize(name.toLowerCase());
              ...
              addAttrInterpolateDirective(node, directives, value, nName);
              addDirective(directives, nName, 'A', maxPriority);
            }
          }
          ...
        }
        ...
    }

    function addAttrInterpolateDirective(node, directives, value, name) {
      var interpolateFn = $interpolate(value, true);

      // no interpolation found -> ignore
      if (!interpolateFn) return;

      directives.push({
        priority: 100,
        compile: valueFn(function(scope, element, attr) {
          var $$observers = (attr.$$observers || (attr.$$observers = {}));
          ...
          attr[name] = undefined;
          ($$observers[name] || ($$observers[name] = [])).$$inter = true;
          (attr.$$observers && attr.$$observers[name].$$scope || scope).
            $watch(interpolateFn, function(value) {
              attr.$set(name, value);
            });
        })
      });
    }
```

Let's see how class directive works now.  It's at function _classDirective_.  If you put an expression in class directive, it will watch that.  Once there is any value change, it adds/removes class from element.  Hence, the second example above works correctly.  

```javascript
    function classDirective(name, selector) {
      name = 'ngClass' + name;
      return ngDirective(function(scope, element, attr) {
        scope.$watch(attr[name], function(newVal, oldVal) {
          if (selector === true || scope.$index % 2 === selector) {
            if (oldVal && (newVal !== oldVal)) {
               if (isObject(oldVal) && !isArray(oldVal))
                 oldVal = map(oldVal, function(v, k) { if (v) return k });
               element.removeClass(isArray(oldVal) ? oldVal.join(' ') : oldVal);
             }
             if (isObject(newVal) && !isArray(newVal))
                newVal = map(newVal, function(v, k) { if (v) return k });
             if (newVal) element.addClass(isArray(newVal) ? newVal.join(' ') : newVal);      }
        }, true);
      });
    }
```

However, if you put String interpolation into it, it will be watching **undefined**.  Why?  Remember what _addAttrInterpolateDirective_ does?  An extra directive is added before this class directive and so its linking function runs before the one for class directive.  And one more thing I omit above: its linking function explicitly sets **attr[name] = undefined;**.  Hence, when the linking functions run sequentially, the class directive's linking function doesn't watch the expression in String interpolation or the value derived although the String interpolation itself works correctly to set the value to class directive.  

Hence, in order to set CSS class on HTML element dynamically, we should either use:  

* ng-class / ng-class-odd / ng-class-even without String interpolation by directly using model value or Expression.

or  

* HTML class attribute directly with String interpolation.



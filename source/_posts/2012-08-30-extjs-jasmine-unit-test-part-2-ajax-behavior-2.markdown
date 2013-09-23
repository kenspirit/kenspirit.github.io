---
comments: true
date: 2012-08-30 15:04:06
layout: post
slug: extjs-jasmine-unit-test-part-2-ajax-behavior-2
title: ExtJS, Jasmine, Unit Test – Part 2 (Ajax & Behavior)
wordpress_id: 340
categories:
- Sword
tags:
- ExtJs
- Jasmine
- Javascript
- UnitTest
- Mock
---

Ajax is a pretty common used feature now for every JS Rich application. How to test it is common headache for many application.

ExtJS has been adopted in the two companies I worked and am working for.  Hence, here I only show you how to test Ajax in ExtJS built application.

In my previous post [ExtJS, Jasmine, Unit Test – Part 1 (Philosophy and Test for Store)](http://www.thinkingincrowd.me/blog/2012/08/13/extjs-jasmine-unit-test-part-1-philosophy-and-test-for-store/), the part on how to test Autoload _Ext.data.Store_ simply override _Ext.lib.Ajax_ so that it does nothing and _Ext.data.Store_ is tested through manual loading data.

That is the simplest way but cannot fulfill the requirement to test real production code which uses Ajax feature.

**How real production code might look like if the application is built entirely by ExtJS?**

```javascript
    xxx.UiImpl = Ext.extend(xxx.Ui, {
        initComponent: function() {
            xxx.UiImpl.superclass.initComponent.call(this);

            this.emptyNameWarningMsg = 'Name is empty!';
            this.duplicateNameWarningMsg = 'Name has been in used!';
            this.nameField = Ext.getCmp('xxx.name');

            this.initEventHandlers();
        },

        initEventHandlers : function() {
            this.nameField.on('blur', this.validateName, this);
        },

        validateName: function(){
            var sName = this.nameField.getValue();
            if (sName == '') {
                this.nameField.markInvalid(this.emptyNameWarningMsg);
                return;
            }

            Ext.Ajax.request({
                url : config.appName() + "/foo/validateName",
                method : 'GET',
                params : {
                    name : sName
                },
                success : function(data){
                    if (data.responseText != '') {
                        this.nameField.markInvalid(this.duplicateNameWarningMsg);
                    }
                },
                failure : function(data){
                    alert("validate failure!");
                },
                scope: this
            });
        }
    });
```

Above is a simple UI implementation class which extends from an UI class.  You can safely guess that this UI class simply has one name field which is bound with a Blur Event.  The Blur Event handler triggers an Ajax calls to validate whether the typed-in name is empty or duplicated within the system.  Pretty straightforward, right?

**Considering the Test Philosophy I mentioned in my last post, what contracts or behaviors we should test against here?**

Here are some examples:




  1. Contract between user and our system (blur event).  I would expect there would some code like this in my Jasmine Spec:

```javascript
    oUI.nameField.fireEvent('blur');
```




  2. Contract between backend data structure and frontend handling on Ajax call.  I am expecting if I set the _responseText_ from Ajax call to be not empty, the _nameField_ in UI should be marked as invalid and show the _oUI.duplicateNameWarningMsg_.  Say, the response can be stub as:

```javascript
    Ext.lib.Ajax.response({
        status: 200,
        responseText: 'Duplicate'
    });
```




  3. Contract between implementation logic and UI behavior experienced by user.  The point mentioned above that _nameField_ in UI should be marked as invalid and show the _oUI.duplicateNameWarningMsg_ or _oUI.emptyNameWarningMsg_ under different situations__.__ Sample Spec code might be:

```javascript
    oUI.nameField.fireEvent('blur');
    expect(oUI.nameField.getActiveError()).toEqual(oUI.emptyNameWarningMsg);

    oUI.nameField.setValue('Ken');
    oUI.nameField.fireEvent('blur');
    expect(oUI.nameField.getActiveError()).toEqual(oUI.duplicateNameWarningMsg);
```




  4. Other Contracts (e.g. Hardcode global variable or Element Id).  Why this is needed?  Because this where most of the change happens but it's very difficult to be aware of.  Sample Spec code might be:

```javascript
    var oUI = Ext.getCmp('kentest');
```




**The Test Spec is already in mind but how can I use it to test against the production code?  **

I googled around and found one useful helper API - [Jasmine-Ajax](http://github.com/pivotal/jasmine-ajax) : a set of helpers for testing AJAX requests under the Jasmine BDD framework for JavaScript.  However, now it only supports Prototype.js and jQuery.

I read the source and found it is not difficult to add support for ExtJS.  Hence, I modified it a bit.  Later I may submit a patch to github for this project and see whether it can be accepted.  Here I just attached the modified source first.   [mock-ajax](https://dl.dropbox.com/u/17182499/blog/2012/08/mock-ajax.js)

How should I include this helper class to use Jasmine to test the Ajax in ExtJS?

Configuration in POM.xml

```xml
    <configuration>
        <preloadSources>
            <source>adapter/ext/ext-base-debug.js</source>
            <source>ext/ext-all-debug-w-comments.js</source>
            <source>${project.basedir}/Resources/test/js/mock-ajax.js</source>
            <source>${project.basedir}/Resources/test/js/global.js</source>
        </preloadSources>
    ...
    <configuration>
```

Code in file globalTestStub.js change to be:

```javascript
    jasmine.Ajax.installMock();
```

How to write the Test Spec?

```javascript
    describe('Test Maintenance UI', function() {
        beforeEach(function() {
            jasmine.Ajax.useMock();
        });

        it('Maintenance UI should be initialized successfully', function() {
            var oUI = new xxx.UI({});
            expect(Ext.getCmp('kentest')).toBeTruthy();
        });

        it('Focus leaving name field should trigger unique validation.', function() {
            Ext.lib.Ajax.response({
                status: 200,
                responseText: 'Duplicate'
            });

            var oUI = Ext.getCmp('kentest');
            oUI.nameField.fireEvent('blur');
            expect(oUI.nameField.getActiveError()).toEqual(oUI.emptyNameWarningMsg);

            oUI.nameField.setValue('Ken');
            oUI.nameField.fireEvent('blur');
            expect(oUI.nameField.getActiveError()).toEqual(oUI.duplicateNameWarningMsg);
        });
    });
```

Can you see how all above works now?  Please take it a trial and share your comment with me.

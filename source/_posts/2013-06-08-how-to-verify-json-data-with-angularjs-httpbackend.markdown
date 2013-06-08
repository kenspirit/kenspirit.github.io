---
layout: post
title: "How to verify JSON data with AngularJS $httpBackend"
date: 2013-06-08 22:17
comments: true
categories:
- Sword
tags:
- Javascript
- UnitTest
- AngularJS
- HttpBackend
- Jasmine
- JSON
---

[$httpBackend]: http://docs.angularjs.org/api/ngMock.$httpBackend

When we are writing Unit Test for AngularJS Controller or Service, it's pretty common to verify the data posted to server using [$httpBackend][] in ngMock module.  

Consider the most common method: _expect(method, url, data, headers)_, from the doc, we find that the data is expected to be either _String_ or _RegExp_.  

>**expect(method, url, data, headers)**  
Creates a new request expectation.

>Parameters  
* method – {string} – HTTP method.  
* url – {string|RegExp} – HTTP url.  
* data(optional) – {(string|RegExp)=} – HTTP request body.

So normally, below simple case is working as expected:  

```javascript
    $httpBackend.expect('POST', 'http://localhost/timeEntry', 'hello').respond(200, 'Done');
    $resource('http://localhost/timeEntry/').save('hello');
    $httpBackend.flush();

    $httpBackend.expect('POST', 'http://localhost/timeEntry', /te/g).respond(200, 'Done');
    $resource('http://localhost/timeEntry/').save('test');
    $httpBackend.flush();
```

However, in real application, the data posted to server is normally in JSON format.  How do we verify JSON data then?  Actually, if we look into the source of the _angular-mocks.js_, it supports JSON data too although it's not documented.  

```javascript
  this.matchData = function(d) {
    if (angular.isUndefined(data)) return true;
    if (data && angular.isFunction(data.test)) return data.test(d);
    if (data && !angular.isString(data)) return angular.toJson(data) == d;
    return data == d;
  };
```

So below sample also works.  

```javascript
    $httpBackend.expect('POST', 'http://localhost/timeEntry', {firstName: 'Ken', lastName: 'Chen'}).respond(200, 'Done');
    $resource('http://localhost/timeEntry/').save({firstName: 'Ken', lastName: 'Chen'});
    $httpBackend.flush();
```

As we see, the JSON data validation requires the JSON data posted to be exactly the same as the expect value provided.  How if the JSON data posted is different on each posting, say guid or timestamp field is contained, and we want to verify whether the JSON data is valid based on our special valiation logic?  

Here is the hack to make AngularJS take our special validation logic.  

```javascript
    var Validator = (function() {
        return {
            hasMinimumFields: function(entry) {
                return StringUtil.isNotBlank(entry.id) && StringUtil.isNotBlank(entry.desc) &&
                    StringUtil.isNotBlank(entry.lastUpdateOn) && StringUtil.isNotBlank(entry.status);
            },
            isNewEntry: function(entry) {
                return this.hasMinimumFields(entry) && entry.status === 'P';
            }
        };
    })();

    $scope.desc = 'Hello there';

    var data = {
        test: function(data) {
            var entry = angular.fromJson(data);
            return (entry.desc === $scope.desc) && Validator.isNewEntry(entry);
        }
    };
    $httpBackend.expect('POST', 'http://localhost/timeEntry', data).respond(200, 'Done');
    $scope.saveEntry(); // Let's assume this method will post the data with model $scope.desc
    $httpBackend.flush();
```

The hacking as you see is to take advantage of the _test_ method which the _RegExp_ has and AngularJS uses for data matching.  But when the data is not posted as expected, the Unit Test fails with below message:  

```javascript
    Chrome 27.0 (Linux) Unit: Controllers Test EntryCtrl should start entry in correct format if only entry desc is filled. FAILED
    Error: Expected POST http://localhost/timeEntry with different data
    EXPECTED: {}
    GOT:      {"status":"P","actualStartOn":"2013/06/08T21:24+0800","desc":"First Unit Test","id":"3849ae1a-4b9c-40be-baa0-60eeaf3af430","lastUpdateOn":"2013/06/08T13:24:44.104+0000"}
```

This error message is not quite developer friendly and it doesn't tell you much about why it failed at first glance.  However, if we make the test data contain the JSON value too, the expect message would be more meaningful.  

```javascript
    var data = {
        desc: $scope.desc,
        status: 'P',
        id: 'NOT BLANK',
        lastUpdateOn: 'NOT BLANK',
        test: function(data) {
            var entry = angular.fromJson(data);
            return (entry.desc !== $scope.desc) && Validator.isNewEntry(entry);
        }
    };
```

```javascript
EXPECTED: {"desc":"First Unit Test","status":"P","id":"NOT BLANK","lastUpdateOn":"NOT BLANK"}
```

Or we write the expect data like this, then the expect message becomes the tips we supply:  
```javascript
    var data = {
        toString: function() {
            return 'id & lastUpdateOn should not be blank; status should be P';
        },
        test: function(data) {
            var entry = angular.fromJson(data);
            return (entry.desc === $scope.desc) && Validator.isNewEntry(entry);
        }
    };
```

```javascript
EXPECTED: id & lastUpdateOn should not be blank; status should be P
```

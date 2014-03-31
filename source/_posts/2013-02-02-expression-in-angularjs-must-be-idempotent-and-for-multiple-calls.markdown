---
layout: post
title: "Expression in AngularJS must be idempotent and for multiple calls"
date: 2013-02-02 14:32
comments: true
categories:
- Sword
tags:
- AngularJS
- Javascript
- ngRepeat
- Directive
---

[AngularJS]: http://angularjs.org
[$watch]: http://docs.angularjs.org/api/ng.$rootScope.Scope#$watch
[$digest()]: http://docs.angularjs.org/api/ng.$rootScope.Scope#$digest

Recently, I encounter two very interesting issues when using ng-repeat in [AngularJS][].  Not completely understanding the [$watch][] and [$digest()][] is the root cause.  

##Requirement
I am making some workout entries as a list and one special requirement is to group the records by the date.  

In order to break the entries to different groups, I use a scope level variable _$scope.lastActionDate_ to keep track of the last actionDate of the entry to decide whether I should add the actionDateGroup DIV.  The source is as below.  The debug messages are used to explain the issues I encountered.  You can safely ignore them now.  Actually, you may already guess what one of the issues is after seeing them.  Yes, only one.  I bet you can never guess the second one and why.  

{% raw %}
``` html

    <style>
        body {font-family: 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;}
        ul li {list-style-type: none;}
        .actionDateGroup {font-weight: bold; color: red}
    </style>
    <div id="content" ng-controller="EntryCtrl">
        <div id="entries">
            <ul>
                <li ng-repeat="entry in entries">
                    <div ng-switch on="isNewDateGroup(entry.actionDate)">
                        <div ng-switch-when="true" class="actionDateGroup">{{entry.actionDate}}</div>
                    </div>
                    <span>{{entry.desc}}</span>
                </li>
            </ul>
        </div>
    </div>
    <script type="text/javascript" src="./js/angular/angular.js"></script>
    <script>
        function EntryCtrl($scope, $location) {
            $scope.entries = [{
                desc: 'Rope jumping count 1000',
                actionDate: '2012-01-31',
            },{
                desc: 'Jogging 3000M',
                actionDate: '2012-01-31'
            },{
                desc: 'Situp 40 * 3',
                actionDate: '2012-01-30'
            }];
            $scope.lastActionDate = null;
            $scope.calledCount = 0;

            $scope.isNewDateGroup = function(actionDate) {
                $scope.calledCount++;
                console.log('Function called count: ' + $scope.calledCount);
                console.log('Entry date vs Scope date: ' + actionDate + ' vs ' + $scope.lastActionDate);
                if ($scope.lastActionDate === null || $scope.lastActionDate !== actionDate) {
                    $scope.lastActionDate = actionDate;
                    return true;
                }
                return false;
            };
        }
    </script>
```
{% endraw %}

##Expectation  

1. _actionDate_ of the first entry will always be shown as it's the first group.  
2. _actionDate_ of the remaining entries will be shown if its value is not the same as the previous one.  

##Phenomenon
When the sample data is as above (case #1), the effect looks like it's behaving correctly as below:  
<ul>
    <li style="list-style-type: none;">
        <div style="font-weight: bold; color: red">2012-01-31</div>
        <span>Rope jumping count 1000</span>
    </li>
    <li style="list-style-type: none;">
        <span>Jogging 3000M</span>
    </li>
    <li style="list-style-type: none;">
        <div style="font-weight: bold; color: red">2012-01-30</div>
        <span>Situp 40 * 3</span>
    </li>
</ul>

However, if you change the _actionDate_ of the last entry to be also **2012-01-31** (case #2), you will find the result is that no date group is shown.  Why?  Isn't it supposed to show only the first one as all entries have the same _actionDate_?  

####Expected result:  
<ul>
    <li style="list-style-type: none;">
        <div style="font-weight: bold; color: red">2012-01-31</div>
        <span>Rope jumping count 1000</span>
    </li>
    <li style="list-style-type: none;">
        <span>Jogging 3000M</span>
    </li>
    <li style="list-style-type: none;">
        <span>Situp 40 * 3</span>
    </li>
</ul>

####Actual result:
<ul>
    <li style="list-style-type: none;">
        <span>Rope jumping count 1000</span>
    </li>
    <li style="list-style-type: none;">
        <span>Jogging 3000M</span>
    </li>
    <li style="list-style-type: none;">
        <span>Situp 40 * 3</span>
    </li>
</ul>

Now if you check the calledCount in the debug message, you will find that it's called 6 times (double the entry count) in case #1 and 9 times in case #2.  There are two issues I never thought they should happen:  

1. The _isNewDateGroup_ function is called more than the entries' count.  (Guess this, right?)  
2. The called count is different when the data is different.  (how about this?)  

##Causes
In AngularJS [$watch][] API:  

>* Since [$digest()][] reruns when it detects changes the watchExpression can execute multiple times per [$digest()][] and should be **idempotent**.  
>* The listener is called only when the value from the current watchExpression and the previous call to watchExpression are not equal **(with the exception of the initial run, see below)** ...
>* The watch listener may change the model, which may trigger other listeners to fire. This is achieved by **rerunning the watchers until no changes are detected**. The rerun iteration limit is 10 to prevent an infinite loop deadlock.
>...
>(Since watchExpression can execute multiple times per $digest cycle when a change is detected, be prepared for multiple calls to your listener.)

### Issue #1
The _isNewDateGroup_ being watched whose calculation relies on value of _lastActionDate_ is not idempotent and so during initial run stage, _lastActionDate_ is set to 2012-01-30 at the end of case #1 which causes the illusion of working, while it is set to 2012-01-31 at the end of case #2 which illustrates the error.

### Issue #2
In below code, if I comment out **$scope.lastActionDate = actionDate;** or change the **return true;** to **return false;**, the called count will be 6, same as case #1.  This implies that the return value of the expression is the cause.

``` javascript
    if ($scope.lastActionDate === null || $scope.lastActionDate !== actionDate) {
        $scope.lastActionDate = actionDate;
        return true;
    }
```

Remember what the API states: **rerunning the watchers until no changes are detected**?  Let's see what the return value is for watch expression _isNewDateGroup_ after each run.  

If the _actionDate_ of the last entry is **2012-01-30**:  
<p>
<table style="font-size: 0.85em;">
    <tr>
        <td style="padding: 5px; border: 1px solid black;"></td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Rope jumping</td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Jogging</td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Situp</td>
    </tr>
    <tr>
        <td style="padding: 5px; border: 1px solid black;">1st <br/>(initial)</td>
        <td style="padding: 5px; border: 1px solid black;">true ($scope.lastActionDate === null)</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">true ('2012-01-31' !== '2012-01-30';<br/>
        $scope.lastActionDate = '2012-01-30')
        </td>
    </tr>
    <tr>
        <td style="padding: 5px; border: 1px solid black;">2nd</td>
        <td style="padding: 5px; border: 1px solid black;">true ($scope.lastActionDate !== '2012-01-31')</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">true</td>
    </tr>
</table>
</p>

If the _actionDate_ of the last entry is **2012-01-31**:  
<p>
<table style="font-size: 0.85em;">
    <tr>
        <td style="padding: 5px; border: 1px solid black;"></td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Rope jumping</td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Jogging</td>
        <td style="padding: 5px; border: 1px solid black; font-weight: bold;">Situp</td>
    </tr>
    <tr>
        <td style="padding: 5px; border: 1px solid black;">1st <br/>(initial)</td>
        <td style="padding: 5px; border: 1px solid black;">true ($scope.lastActionDate === null)</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
    </tr>
    <tr>
        <td style="padding: 5px; border: 1px solid black;">2nd</td>
        <td style="padding: 5px; border: 1px solid black;">false (change compared to last run)</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
    </tr>
    <tr>
        <td style="padding: 5px; border: 1px solid black;">3rd</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
        <td style="padding: 5px; border: 1px solid black;">false</td>
    </tr>
</table>
</p>

So now you see why changing the last entry to 2012-01-31 causes the 3rd time to evaluate the expression again.

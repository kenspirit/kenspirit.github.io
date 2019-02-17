title: How to make long running loop breakable?
date: 2016-06-05 10:40:07
tags:
  - Javascript
  - Functional Programming
  - Asynchronous
categories:
  - Sword
---

## The reason behind

Loop is a very common concept in programming.  Normally we will not do below silly thing to loop a long long time like:  

```javascript
var j = 0;
for (var i = 0; i < 100000000; i++) {
  j++;
}
console.log(j);
```

If it is run in browser, such as Firefox, it may prompt a warning box like below:  

<img alt="Firefox script not responsive warning" src="https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/firefox_script_not_responsive_warning.png"/>

However, **sometimes we might not know how many times the operation will be executed and how long each operation takes**.  The loop count might depend on how many records retrieved by RESTful web serivce from our own or other external applications.  The operation speed might be affected by what browser user's is using, IE or Chrome, current workload of user's machine.  Hence, **if your logic potentially deal with large volume of data or need to be compatible with old-fashion browser, it maybe worthy to think ahead to prevent**.

A real case happened in our company's internal system is that tons of unread notification received when an supervisor logined after he has a long vacation. The browser crashed every time the supervisor logined.  The developer haven't considered this extreme case and so he pull everything out at one shot and looping to show them on screen.

## How to prevent?

Not to mention that we should do some lazy-loading or data paging in above case first, how can we make the potentially long running loop breakable if something unusual happened?

In Firefox, the unresponsive script warning is shown normally when the executing scripts takes longer than `10 second`.  It can be configured if you typed `about:config` in address bar and update `dom.max_script_run_time` parameter.  However, this should not be the way because you cannot ask user to change the config themselves.

Hence, if we want to prevent the warning, we should try to break the long running script from executing once to executing each portion consecutively.  `setTimeout` is a handy tool to step in.

```javascript
var j = 0;

function operation() {
  j++;
}

function repeat(operation, num) {
  if (num <= 0) {
    console.log('end: ' + j);
    return;
  }

  console.log(j);
  operation();

  function async() {
    repeat(operation, --num);
  }

  // The batch size and timeout interval can be adjusted for your case.
  if (num % 10 === 0) {
    setTimeout(async);
  } else {
    async();
  }
}

repeat(operation, 100000000);
```

Here, we combine the usage of recursion and `setTimeout`, the value of `j` can be printed out consecutively and without causing Firefox to complaint again.  Actually, now you can take a step further and inject some logic to check other condition, like total executing time, to decide whether to break out this loop or not.

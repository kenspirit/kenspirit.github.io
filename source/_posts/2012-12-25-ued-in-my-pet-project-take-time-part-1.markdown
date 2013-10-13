---
layout: post
title: "UED in my pet project - Take Time (Part 1)"
date: 2012-12-25 21:41
comments: true
categories:
- Sword
tags:
- Design
- UI
- UED
- GTD
- Time Management
- Productivity
---

[practices]: http://www.thinkingincrowd.me/blog/2012/12/24/my-practices-on-time-management/
[capture]: http://thinkingincrowd.u.qiniudn.com/task_capture.png

##What is it and why I want to work on that
I hope the name is brief and clear on what it should be although I was worrying whether it brings an illusion that it's telling you to _"Take your time.  Slow down."_.  Actually, it's where to take the time seriously and you can keep track of your time.

Why would I want to do such a seemingly boring thing?  There are three reasons:

* For those who really cares about their time, they really want to find some effective way to make their time used effectively.

* I have been working in two software companies which both require staffs to input TIMESHEET!  Yes, we all know it's bullshit, meaningless and most of the figures are made up, but it's just required.

    I can understand that part of the objective is good, just like what this pet project is made for. However, mostly it's just some policy or resource monitoring required by boss.

* Practice my development skills with some of my favorite tools by doing real work.

Hence, I am trying to make an easy-to-use application for those who want an effective time management.  The design is basically following my [practices][] of it and the principle of simplicity.

##What does it look like
It should be simple in general.

* It's a GTD-style task web application.
* It can plan, track and retrospect the tasks.

##How to capture the time
No matter you are planning tasks or actually tracking the tasks done.  You need to capture it.  There are many elements need to write down:

* For planning tasks: Task content, Start/End date and Estimated how long it needs.
* For tracking tasks: Task content, Start/End date, Start/End time and how long it takes.

The elements in tracking tasks covers all we need for planning tasks, hence the capturing UI should be able to unified.  Below is the draft UI designed:
![Capture UI][capture]

* By default, there is a task content textbox.
* After you input something, some additional text and input boxes are shown.

You should probably be able to guess how to use it already (if not, let me know how to make it happen):

* If you input the task name and press "_Enter_", you start your task immediately.
* If you input the task name and the duration it takes and press "_Enter_", you are tracking a task just finished.  It's calculated based on the current time and the duration you input.
* If you also fills a specific date in "_yyyy-MM-dd_", you are planning tasks if it's a future date; you are tracking tasks if it's a historical date.  The last "_hh:mm_" field is optional for the task start time.

##Why design like this
*4* fields with some easy to explain text made it can be read as a sentence.  It should be natural to fill in what is required.  And when you press "Enter" at any field, it will do different things automatically.  It should be simple enough but satisfy all the requirement.

I have been thinking how to capture the duration.

* Two fields separately for hours and mins (This app is not designed for those crazy people who need to capture seconds).
* One field for all.

Approach _#1_ looks natural but needs an extra field and more key-stroke.  By taking _#3_, decimal number need to be used to express minutes.  You may question me that calculating decimal is even harder.  But think it this way:  _.25_ is _15_ mins; _.5_ is _30_ mins; _.75_ is _45_ mins; _.1_ is around _5_ mins.

I think it's not that difficult to use decimal to express it.  What is more, when you are actually tracking your task this way, you are guessing or trying to remember how long it took.  Your mental power is "calculating" somehow to get a number.  If it's one field, you just need to do one calculation and input.  If it's two fields, you might possibly calculating two fields, especially when your task start time is say from _2:35_ to _4:08_.  I think it just doesn't matter if there is minor inaccurate.

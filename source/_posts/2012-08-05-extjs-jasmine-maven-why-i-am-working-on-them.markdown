---
comments: true
date: 2012-08-05 7:52:24
layout: post
slug: extjs-jasmine-maven-why-i-am-working-on-them
title: ExtJS, Jasmine, Maven - Why I am working on them?
wordpress_id: 311
categories:
- Sword
tags:
- ExtJS
- Jasmine
- Javascript
- Maven
- Unit Test
---

Before going into how to setup [Jasmine](http://pivotal.github.com/jasmine/) to do Unit Test for [ExtJS](www.sencha.com/products/extjs), I think I should describe why I am doing this.

I have been using ExtJS for around 4 years.  My first company used HTML + ExtJS to build the UI while the current one use ExtJS completely to do that.  I have encountered lots of cases that well-tested behavior failed after some new features introduced in.

Everyone knows that it's because there lacks Unit Test.  However, there have never been any Unit Test done for Javascript in any project.  There are many of the reasons behind that, such as tight schedule, not enough attention etc.  But the most important reason that outweights or strengthens others is that Unit Test for Javascript is way too difficult than Java, especially when Javascript is used intensively to build the UI and implement business logics.

One of the reason makes Javascript hard to do Unit Test is due to good tools unavailability;  the other one is that most developers tend to not separating business logic from UI code quite clearly.

After the emergence of [Selenium](http://seleniumhq.org/), I have once thought it should be the right tool to address this issue.  However, after reading Selenium Doc and seeing what my previous colleagues did for recording & playing, I think Selenium should be used mainly for Integration Test, not in Unit Test level.  My opinion is further strenghten after watching a video from Google Testing Expert and reading the blog from Martin Fowler:


> [让测试也敏捷起来](http://www.infoq.com/cn/presentations/duannian-agile-test) by 段念

[TestPyramid](http://martinfowler.com/bliki/TestPyramid.html) by Martin Fowler

**The main points in TestPyramid are:**

>
>

>   1. **Low-level unit test should be many more than high level end-to-end testing through GUI.**
>

>   2. **Testing through UI is slow, brittle, expensive to write.**
>

>   3. **A rich javascript UI should have most of its UI behavior tested with javascript unit tests using something like Jasmine.**
>




Above is a long long purpose briefing, I hope it worthes to let you know the background and also agree with me on this.  I heard about Jasmine before reading the post by Martin Fowler, however, I kept thinking that it's quite difficult or even impossible to use Jasmine to test those ExtJS UI components.

Until I did sit down and really tried to use Jasmine to test the ExtJS code, I can say that Unit Test against ExtJS by Jasmine can be achieved at some level once we know what to test for.

In next post, I will show you the steps to bind ExtJS, Jasmine, Maven together to do the Unit Test and what I think we should test against.

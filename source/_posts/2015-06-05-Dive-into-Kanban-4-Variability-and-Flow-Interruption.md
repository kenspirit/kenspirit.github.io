title: "Dive into Kanban (4) - Variability and Flow Interruption"
tags:
  - Retrospect
  - Kanban
  - Flow
comments: true
categories:
  - Think
date: 2015-06-05 22:49:04
---

## External Sources of Variability

Within the software development cycle, we often face various kinds of flow blocker issues that slows our progress.  Let's look into some common areas.  

### Requirement 

Responding to change, one key point in Agile manifesto, is embraced in Agile development.  However, normally there also exists enforcement or agreement that after user story is defined or at least after development is started, requirement should not be changed.  For example, in Scrum, change should be scheduled as new item in next iteration and no new item should be added after sprint backlog is confirmed.  

The reality is that many teams cannot follow the principle well.  From another point of view, do you think it's better to waste time on doing something we don't really want and then do it again?  Or it's better just stop and change it based on new requirement?  

Clearly, there is no absolute right or wrong answer here.  We should understand our business nature and decide ourselves.  Going to either extreme that no any change can be accepted or any change is welcome anytime without constraints can be terrible.  There must be some disciplines to follow no matter which way you choose.  

#### The Kanban solutions

In Kanban, changing requirement is acceptable but we must agree that it affects lead time.  And we should also have metrics to measure the quality of requirement and prioritization later on.  

1. We can either move back the card to "Requirement" stage or mark it as Blocked by REQ under its current stage regarding the change is big enough to impact development or testing.  

  We should have statistics on how many cards ever move back to "Requirement" once started development or how many days are blocked by requirement.  

  For example, below diagram shows the blocked statistics.  Y-Axis shows different stages in one Kanban board and X-Axis show the total time items are blocked under particular stage.  And the time is also grouped by different blocking reason.  Say, in "In Dev" stage, all time is blocked due to "Priority" reason which means priority kept changing after developer starts development and that is unhealthy signal.  

<img alt="Blocked_Statistics" src="http://thinkingincrowd.u.qiniudn.com/Blocked_Statistics.png"/>


2. If the item is discarded once it's picked from Backlog, we can also show in Kanban's Discard area and also we can check how much effort has been wasted on it in the report.  

3. Start as late as possible if we have statistical Lead Time on hand.  Once we have some historical data so that we know on average, 85%, or 98% case that how long it takes to finish one item, then we can start that item as late as possible to avoid requirement change.  

### Environment Availability

This is a very typical flow blocker.  The impact of this factor is normally tremendous especially when this issue is dragged without a permanent solution because environment availability often happens in large scale projects involving many teams.  

Say if environment outage takes at least half day to recover, it's a signal that our recovery and operation capability is weak or the system design need to be reviewed.  And if we don't solve the issue at the beginning stage of the project, time and cost wasted will increase exponentially every time we do environment preparation, load testing, production release and disaster recovery.  The later stage same thing happens, the more expensive the cost is.  

We can either have larger WIP or actively pursue issue resolution as described below.  

### Expediting items

Developers often suffers from expediting items as well, for example, overlooked high priority items in backlog, urgent Report requested from manager, production issue support, etc.  

Defining different classes of services and assigning fixed WIP on each class, or enabling slack in the team has the agility to react.  

## General Solutions in Kanban

Below are some general approaches used in Kanban to workaround the blocked items, ease the flow to ensure predictable lead time.  Different approachs have its own benefits or drawbacks.  It should be chosen accordingly.  

### Larger WIP

The larger WIP, the less tension the team may feel.  Because idle resource can still pull other items in case there are blocked ones.  However, that cause larger and more unprecitable lead time.  Larger WIP also means the people need to multi-tasking and keep switching context.  Empirically, multi-tasking often cause bad quality.  

What is more, less pressure might consequently has less chance of encouraging continuous improvement.  So, this is recommended for immature organization as starting point only.  

### Pursuing resolution

Strict WIP control requires the team to relentlessly pursue issue fixing.  It greatly encourages continuous improvement culture but it also requires a more mature & fully cooperated team.  

### Class of Services

Separating the work items into different classes of services and also assigning suitable WIP on each class is one useful approach to solve the expediting items or flow interruption issue.  

Take below graph as example, we have separated our items into several classes of services:

1. `L1 TT`: Means level 1 Production issue which is intended to be fixed in 4 hours  
2. `L2 TT`: Means level 2 Production issue which is intended to be fixed in 1 day  
3. `Normal`: Normal development item or defect  
4. `Intangible`: Items has no cost of delay  

How to assign WIP depends on the nature of the frequency and volume of different levels of items.  If in initial production launch stage, there might be many production support issues so that you have to put fixed resources in `L1 TT` and `L2 TT` in order to react quickly and avoid interrupting normal items' development.  Then the lead time of normal item can still be predictable and the people responsible for normal item development seldom need multi-tasking, ensuring quality.  However, if the system is already kind of stable, instead of assigning fixed resources to the first two classes, you can arrange some resources in Intagible class who can jump into production issue support when needed.  

<img alt="Class_of_Services" src="http://thinkingincrowd.u.qiniudn.com/Class_of_Services.png"/>

### Slack Capacity

Enabling slack in the team helps to face any unexpected situation, remove regular though not urgent blocker, apply automation to shorten lead time or reduce WIP.  Unless the team has slack, continuous improvement can be luxury because they are all busy chasing after business items.  


## Afterword  

[visualizing process]: http://www.thinkingincrowd.me/2015/05/29/Dive-into-Kanban-2-Visualizing-Process/
[Kanban: Successful Evolutionary Change for Your Technology Business]: http://www.amazon.com/Kanban-Successful-Evolutionary-Technology-Business/dp/0984521402

Variability is the major impact on the flow and so we should examine carefully and address on every source in our own process flow.  To analyze existing flow blocker and work out the strategies in Kanban is not easy.  It should be done as part of [visualizing process][].  

Later on, we will explore how to define WIP and classes of services in-depth.  And if you would like to have more idea on sources of variability, chapter 19 in [Kanban: Successful Evolutionary Change for Your Technology Business][] is a good reference.  


### Series
[Dive into Kanban (1) - What is it]: http://www.thinkingincrowd.me/2015/05/20/Dive-into-Kanban-1-What-is-it/
[Dive into Kanban (2) - Visualizing Process]: http://www.thinkingincrowd.me/2015/05/30/Dive-into-Kanban-2-Visualizing-Process/
[Dive into Kanban (3) - How Kanban address the estimation headache]: http://www.thinkingincrowd.me/2015/05/31/Dive-into-Kanban-3-How-Kanban-address-the-estimation-headache/
[Dive into Kanban (4) - Variability and Flow Interruption]: http://www.thinkingincrowd.me/2015/06/05/Dive-into-Kanban-4-Variability-and-Flow-Interruption/
[Dive into Kanban (5) - Difficulty and Resisted Opinions on Adoption]: http://www.thinkingincrowd.me/2015/07/23/Dive-into-Kanban-5-Difficulty-and-Resisted-Opinions-on-Adoption/
[Dive into Kanban (6) - Scrum vs Kanban]: http://www.thinkingincrowd.me/2015/10/08/Dive-into-Kanban-6-Scrum-vs-Kanban/

* [Dive into Kanban (1) - What is it][]  
* [Dive into Kanban (2) - Visualizing Process][]  
* [Dive into Kanban (3) - How Kanban address the estimation headache][]  
* [Dive into Kanban (4) - Variability and Flow Interruption][]  
* [Dive into Kanban (5) - Difficulty and Resisted Opinions on Adoption][]  
* [Dive into Kanban (6) - Scrum vs Kanban][]

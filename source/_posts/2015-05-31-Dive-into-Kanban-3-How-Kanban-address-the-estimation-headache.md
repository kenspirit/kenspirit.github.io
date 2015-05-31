title: Dive into Kanban (3) - How Kanban address the estimation headache
tags:
  - Retrospect
  - Kanban
comments: true
categories:
  - Think
date: 2015-05-31 13:06:14
---

[The Mythical Man-Month]: http://www.amazon.com/Mythical-Man-Month-Software-Engineering-Anniversary/dp/0201835959
[visualizing the Process]: http://www.thinkingincrowd.me/2015/05/29/Dive-into-Kanban-2-Visualizing-Process/

Beside [visualizing the Process][] to reduce communication overhead and unnecessary process, Kanban addresses the common estimation headache in development process from different perspectives.  

## Reality

1. Requirement arrives late and so cannot catch up the schedule to pass to QA  
2. Developer doesn't finish the item on time and so no time left for testing.  
3. Developer is reluctant to do estimation and capture actual time or timesheet  

Traditional manangement or planning style is that provding how many man-days or man-hours we have in a typical iteration and the estimation on the items we want to do, manager or product owner picks the items that match the man power and item priority.  Typical situation is that the expected time of item arrival is delayed so that original plan is affected.  

The reason is that, estimation is often, if not always, wrong. The influential software project manangement book [The Mythical Man-Month][] by Frederick Brooks spends a whole Chapter 2 to discuss about this many years ago.  What is more, estimation is often misused to measure whether a developer is fully utilized in a iteration.  Even worse, developers are asked to capture the actual completion time or even timesheet afterward.  

Actually, using estimation and actual completion time capturing to utilize & measure the human resource is some kind of trustness issue or treating knowledge worker as cost instead of asset.  Most of the bosses prefer that their resource is highly utilized.  They have the assumption that slack is waste and that resource being free does no benefit to the team or organization.  

However, this should not be the way to manage knowledge worker in the new era anymore.  I highly recommend some great management books by Peter F. Drucker.  In fact, slack is important for continuous improvement and creativity.  Just like Google's 20% freetime, LinkedIn's InCubator, Apple's Blue Sky and Microsoft's The Garage program.  (_Notes: Seems Google took back that already but there are still many companies think it's useful._)  

## Fix from another angle

How can we eliminate the cost (time and mental effort) wasted on effort estimation, tracking and increase the trustness?  First we need to know clearly what problem we want to solve with estimation.  

We have always been doing effort estimation since tranditional waterfall, to current Agile style like XP/Scrum.  Just in Agile style, you are recommended to breakdown item as small as possible without losing its minimum viable characteristic.  Without realizing this, the team doing Agile also has headache of how to breakdown the item.  

The first and most important thing is that the product owner or business analysis can come up the **minimum viable feature** and its **real priority and urgency** under the constraint (rough estimation) raised from development and testing team.  I have experienced many cases that so-called urgent features can later be deferred actually.  Something really important or cannot be broken down, no matter how long it need to take, we just need to put all the resource into it, right?  

Next thing is to make the item move as **fast and smooth** as possible after we truly define item scope and priority.  And that is what Kanban goods at.  Kanban focuses on flow, its emphasis is on lead time and flow efficiency.  It helps us to take our attention out from the old & bad habbit into the real important thing to be focused on.  

## Metrics

In Kanban, the most important measurement is Lead time and many metrics are based on it.  We will take more in-dept look into metrics Kanban commonly uses to identify the issue in our flow, do estimation & scheduling, etc. in later articles.  Here, I will just give a brief description on below two metrics so that you can have a rough idea.  

* **Lead Time** - Duration between the completion and start time of one item  

  How to choose appropriate start and end stage depends on what we really want to measure.  

  Say, from the development team's perspective, the lead time is starting from the time the requirement is ready for development and ending until QA completes testing.  However, if from the business's perspective, the starting point should be the time customer raises the request and the ending point is when it's released to production.  

* **Flow Efficiency** - `100% * Work Time / Lead Time`  

  This metric tells us how much time is wasted in the flow.  According to David Anderson, common figure in the software development industry is `1% to 5%`.  At the time he's working in Microsoft, the project he measured is `8%`.  If any company's flow efficiency can be higher than `40%`, then it's a very good level.  

## Afterword  

Estimation is hard and often incorrect.  Once it's used with wrong objective, it brings unnecessary mental effort on developer and cannot serve as valuable reference for scheduling.  However, if we focus on lead time, especially when we know how our lead time spreads statistically, we have better idea when it's the latest time we should start the item and greater agility if we have short lead time.  

### Series
[Dive into Kanban (1) - What is it]: http://www.thinkingincrowd.me/2015/05/20/Dive-into-Kanban-1-What-is-it/
[Dive into Kanban (2) - Visualizing Process]: http://www.thinkingincrowd.me/2015/05/29/Dive-into-Kanban-2-Visualizing-Process/
[Dive into Kanban (3) - How Kanban address the estimation headache]: http://www.thinkingincrowd.me/2015/05/31/Dive-into-Kanban-3-How-Kanban-address-the-estimation-headache/

* [Dive into Kanban (1) - What is it][]  
* [Dive into Kanban (2) - Visualizing Process][]  
* [Dive into Kanban (3) - How Kanban address the estimation headache][]  

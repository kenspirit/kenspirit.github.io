title: Dive into Kanban (3) - How Kanban address the scheduling & estimation headache
tags:
  - Retrospect
  - Kanban
  - Lead Time
comments: true
categories:
  - Think
date: 2015-05-31 13:06:14
---

[The Mythical Man-Month]: http://www.amazon.com/Mythical-Man-Month-Software-Engineering-Anniversary/dp/0201835959
[Visualizing the process in Kanban]: http://www.thinkingincrowd.me/2015/05/29/Dive-into-Kanban-2-Visualizing-Process/

[Visualizing the process in Kanban][] can reduce communication overhead and unnecessary process.  Besides, it can also help to addresses the common estimation headache in development process from a different perspective.  

## Reality

Traditional manangement or planning style is that, provding how many man-days or man-hours we have in a typical iteration and the estimation on the items we want to do, manager or product owner picks the items that match the man power and item priority.  However, we still meet a typical situation that the expected time of item is delayed, no matter requirement, development or testing.  we can only postpone or cut the scope when we realized that.  Either way affects the original plan and also has additional cost.  The reason is that estimation is often, if not always, wrong.  Frederick Brooks has spent a whole Chapter 2 in his influential software project manangement book, [The Mythical Man-Month][], to discuss about that many years ago.  If we are taking estimation as commitment, we might have a lot of trouble.  

## Do we still need estimation

If the estimation we have always been doing is not accurate, and we should not use it for commitment and scheduling, is it still useful?  We should ask ourselves what we originally want it to help us to achieve first.  Below listed some common usages:  

1. Resource Utilization  

  High utilization is intended to do more thing in fixed time.  However, there will be high risk if we plan our man-days to fully match the time we have in a iteration.  Once there is any issue blocker or change, schedule is affected.  And then we have to adjust or replan which is also costly and might also lead to degrade of quality.  

  If another intention of high utilization is to eliminate any slack, like the old way to manage physical worker, that is pathetic.  This thinking assumes that slack does no good to the company or the team.  In fact, this is some kind of trustness issue and treating knowledge worker as cost instead of asset.  

2. Prioritization  

  Sometime we use the estimation to help prioritize items, so call evaluating ROI (Return on Investment).  

3. Scheduling

  There are different purposes for planning or scheduling: When should I start if I want something to be completed at a particular time, when something can be completed if I start it now, or what is the max possible outcome given some resources.  

  In order to make sure things can be done as planned, many people add some buffer time into the estimation.  For example, a task required 2 man-days to complete might normally be estimated as 2.5 man-days.  However, how much buffer is appropriate highly relies on personal experience.  Although we can decrease error margin through peer evaluation, task breakdown into smaller unit, etc, many influential factors are out of control, such as low productivity due to multi-tasking, priority shifting, resource turnover, etc.  


Martin Fowler has also written a good article, [Purpose Of Estimation][].  There is no absolute right or wrong on estimation.  It depends on how we use it.  Effort estimation can still be used for roughly comparing the difficulty among tasks, evaluating whether there is risk on an item so we should come up a simplified version if needed, or prioritizing tasks if they are really equally important.  However, if we use it incorrect or the benefits it brings can be achieved through other methods, then we might not need estimation at all.  Actually, in Agile community, there are some voices about discarding effort estimation and also a movement called \#NoEstimates.  If you have interest, you can take a look on below articles:  

[The NoEstimates Movement]: http://ronjeffries.com/xprog/articles/the-noestimates-movement/  
['No Estimates' in Action: 5 Ways to Rethink Software Projects]: http://www.cio.com/article/2381167/agile-development/-no-estimates-in-action-5-ways-to-rethink-software-projects.html
[No Estimation in Small And Large Scale Agile Projects]: http://www.infoq.com/news/2015/02/agile-no-estimation  
[Purpose Of Estimation]: http://martinfowler.com/bliki/PurposeOfEstimation.html

[The NoEstimates Movement][]  
['No Estimates' in Action: 5 Ways to Rethink Software Projects][]  
[No Estimation in Small And Large Scale Agile Projects][]  

## Whether Kanban can help

What is Kanban's perspective?

1. Resource Utilization  

  Assuming we have shown all the tasks on the Kanban board and the team is communicating through Kanban, then we can really knows what each team member is working on right now and in what stage one task is.  Hence, we do be able to know the workload of each person so that we can tell if there is any slack.  

  However, Kanban doesn't encourage achieving 100% utilization on each stage as well, because slack is important for continuous improvement and creativity.  Like Google's 20% freetime, LinkedIn's InCubator, Apple's Blue Sky and Microsoft's The Garage program, different company takes similar approach to encourage that.  (_Notes: Seems Google took back that already but there are still many companies think it's useful._)  Purely achieving high utilization should not be the way to manage knowledge worker in the new era anymore.  Peter F. Drucker has written many great books about management which are highly recommended.  

2. Prioritization  

  Real prioritization does not really require estimation to assist.  It should NOT be defined as high, medium, low.  Instead, it should be in sequence of one, two, three, etc.  If we cannot set priority in sequence, it means we still don't know what the most important thing is yet.  If there is something very important and cannot be broken down, we should always spent all resource and time on it, right?  In case that we cannot tell the priority of some tasks, surely we can use the estimation as reference.  

  Kanban cannot help on prioritization.  However, it can transparently shows them on board for everyone and make sure we focus on flow to complete the task as fast and smooth as possible.  

3. Scheduling  

  In Kanban, the metrics we used is lead time.  Because it's actual time, it includes all possible external factors, say environment, people, task difficulty, etc.  What is more, by looking into this figure statistically, we use statistics to decrease the error margin.  We can understand the team's delivery productivity once having statistical lead time on hand.  Knowing how long it takes for the same class of service (say, Story, Support, or Defect) to complete in 85% or 98% of the cases than using estimation.

Kanban cannot solve all the problems we have, but it helps us to concentrate on the right thing we should care about.  


## Afterword  

Estimation is hard and often incorrect.  Once it's used with wrong objective, it brings unnecessary mental effort on developer and cannot serve as valuable reference for scheduling.  Hence, we should focus on what benefits we would like to achieve through estimation.

If we focus on lead time, especially when we know how our lead time spreads statistically, we have better idea when it's the latest time we should start and have greater agility if our lead time is short and stable.  


### Series
[Dive into Kanban (1) - What is it]: http://www.thinkingincrowd.me/2015/05/20/Dive-into-Kanban-1-What-is-it/
[Dive into Kanban (2) - Visualizing Process]: http://www.thinkingincrowd.me/2015/05/29/Dive-into-Kanban-2-Visualizing-Process/
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

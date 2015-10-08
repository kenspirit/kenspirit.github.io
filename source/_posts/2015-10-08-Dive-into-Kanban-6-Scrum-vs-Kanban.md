title: Dive into Kanban (6) - Scrum vs Kanban
tags:
  - Retrospect
  - Kanban
  - Scrum
comments: true
categories:
  - Think
date: 2015-10-08 21:47:57
---

[book]: http://www.amazon.com/Kanban-Successful-Evolutionary-Technology-Business/dp/0984521402

As a Kanban fan, I attended a Scrum-Master training organized by the company.  This is a good chance for me to know Scrum more from an experienced person beside reading books, blogs or other documentations.  

Here I will try to compare some core concept in Scrum with the same or similar idea in Kanban.  

## Timebox

Timebox is important in Scrum.  Sprint is the crucial one which is normally 2 ~ 4 weeks.  It's used to control pacing for delivering usable feature instead of mockup or prototype.  

There is NO prescribed Timebox in Kanban.  Kanban can have different Cadence for Replenishment and Delivery.  What is more, it can be on demand like release whenever there is something useful for users.  

### Pressure & Goal

From my perspective, the most important benefit or purpose of the Timebox is the pressure & goal it imposed.  The whole team is driven by a hard deadline limitation & commitment to plan & deliver.  This can provide a shared goal & understanding to the whole team.  

This sounds like deadline driven and many people don't like it.  But I think what we hate is that the deadline is unreasonably set by some managers regardless of the task difficulty and reality.  The Scrum Timebox is not that kind of a thing.  It's fixed for steady pacing and the team control what items are included in one Sprint.  Commitment is made by the team together.  

In Kanban, The steady pacing is controlled by WIP.  It makes sure everyone can try to focus on one item at at time and reduce multi-tasking.  For the pressure & goal, there is no explicit thing imposed in Kanban.  This can be a good thing or bad depending on the preference & maturity of the team.  

But as a team doing Agile, they should always keep looking for the obstacles & improvement area regardless choosing Scrum or Kanban.  Else, Scrum can also fail by merely following routine rules.  

### Evil of endless item splitting

Many people don't quite agree on such rude approach when fitting an item in a box, because cases happen that some team end up splitting the backlong item into finest level as technical items because it is too big to fit into a desired sprint Timebox.  Hence, they argue that the Timebox approach causes the undesired consequence.  

However, before blaming on it, we should know that:  

1. Reducing the length of Timebox is NOT the goal of agility  

  We should not merely pursue the goal of reducing length of Timebox in order to prove that we are more agile than before.  There is always a boundary or limitation for your business.  Too short Timebox can also introduce overhead.  Length of the Timebox should be chosen depending on how often we want and actually can deliver belancing the cost it takes.  

2. No matter use Scrum or Kanban, to be agile, we always want to split the item as small as possible but still should be a usable unit for user to perform testing.  

  The purpose for this is to let user validate the output as soon as possible and get feedback.  Make the item to be small shorten the feedback loop.  Don't split just for fitting into something.  Also, item splitting is not purely development team's decision and it also need PO's contribution.  

  In an ERP system, to implement a form containing 1000 fields in 5 tabs, is it acceptable to incrementally implement tab by tab or even section by section in one tab?  The strategy might also be different between developing a new product and doing a migration project.  For migration project, to the user, only when the new system that fully provide what old system has, the new system can be regarded as usable and can replace the old one.  During development phase, PO needs to align with user to accept "incrementally growing" version and do UAT gradually as well.  

3. Just let it be if the item really cannot be further broken down.  

  It happens and also some workable units are still not releasable from business perspective.  Then we have to disable the function or rollback the change.  The process is the same when things go wrong that originally planned item cannot be completed within Sprint.  The challenge here is not using Scrum or Kanban.  It's whether and how the Source Code Management, Testing & Release process supports these kinds of scenarios.  If we have technical level support here, we can more easily balance the Timebox length and item size.  


## Roles

Roles are defined in Scrum and not particularly mentioned in Kanban.  And one of opinion in the Kanban is that because no role or job title changed or external role introduced, resistance of change from management or employees should be minimal. But is that means that Kanban doesn't have any of the role defined in Scrum?

### Product Owner

No matter what agile methodology or old-fashion water-fall, we always want and need to have PO.  This role is very important and makes final decision on Product, including requirement, priority, scope, etc.  Especially when a Kanban board serves multiple Product, it even requires to involve multiple PO to have alignment on item priority as well.  

### Team

In Scrum, it emphasizes that the team is cross-functional and should be responsible for development, testing, release and anything required for delivering the usable features after each Sprint.  When all things are controlled within one team, for sure life is easier.  

However, traditional organization structure might breakdown the team by speicialty, like development team, testing team, UI/UX team, Release team, Infrastructure team, etc.  When this kind of company need to introduce Scrum into their development process, it requires to do structural change.  Without structure change, it does not work.  

One of the selling point in Kanban is that it doesn't require the company to do structural change.  The essence of Kanban is to change as little as possible, visualize the existing development process and map the value stream instead of introducing any imaginary ideal process or borrowing one from external success story.  Sounds very promising, right?  

There are pros and cons of it.

To define the start and end point for the Kanban board, David mentioned in his [book]:  

>Successful teams have tended to stick to adopting workflow visualization with cards and limiting WIP within their own political sphere of control, and negotiating a new way of interacting with immediate upstream and downstream partners.

For example, when initially adopt Kanban within development team, the start and end point can only cover the development stages, upstream who provides requirement and downstream who provides testing services are not in control.  When controlling the WIP at the first stage of Kanban board, the development manager must have agreement with PO.  What is more, chance of the improvement area is to block PO from sending urgent requests from time to time which interrupts the normal development flow and affects quality.  If development manager has less political power than PO and PO doesn't realize the agility of the company needs his own improvement, it's difficult for the whole company to become agile.  Power from higher level's is required then.  

Ideally, I prefer the Kanban way.  But this requires full cooperation from upstream and downstream and the person who introduces Kanban need to have great ability to influence them.  The other side, the person who introduces Scrum most likely has political power and ambition to do the structure change to break down the barriers already.  

Hence, knowing what is in front is important before choosing the radical way of Scrum to reorganize the company structure or the incremental way of Kanban to influence upstream and downstream.  

No matter which way to choose, management must have the ability to drive change among teams or departments.  It's not just simply adopting a process by following rules and then hoping the company becomes agile one day.  The training on Kanban and Scrum actually should be more on the management level to understand the prerequisite instead of the team to understand the process concept.  

### Scrum Master

A Scrum Master should be just like a Sheep Dog or Coach who actively do nothing on the team.  

In Kanban, there is no such role because it encourages that everyone involved in the Kanban process looks for the bottleneck and area to improve because everything is transparent and reflected on the board.  

One question may arise that if one day the team can do Scrum very well and nothing needs Scrum Master to coach, will the Scrum Master role be redundant?  

I think the existence of this role depends on whether you think a dedicated coach, issue spotter or change driver is required.  To be honest, I think the Kanban way is the ideal situation to pursue because to stay agile, everyone in the team must have agile thinking and culture.  But that is really not easy and sometimes an outsider can more easily spot out the problems in the process.  Retrospect and fresh eye are important.  


## Work Item Restriction

Scrum limits total items committed by the team at the beginning of the Sprint.  When there is a change requested from PO, normally it should be planned on next Sprint.  

Kanban limits the WIP per workflow state.  When upstream wants to introduce urgent item, it's OK to accept but required to pull out another one if the WIP limit is reached.  

Different business model might be suited for different methods or use both in a combination way.  For purely new product development, Scrum and Kanban should be both fine.  But if the team is both developing new product or feature and also need to handle urgent production support, Kanban might be more suitable.  Taking the Scrum approach requires you to consider how the urgent issue should be handled because production urgent issue normally is not accepable to wait until next Sprint.  


## Afterword  

[InfoQ]: http://www.infoq.com/minibooks/kanban-scrum-minibook

There is a good mini-book about the difference between Scrum and Kanban in [InfoQ][] and I suggest you to take a look on it.  I like one statement in the foreword very much.

>these are just tools, and what you really want to do is have a full toolkit, understand the strengths and limitations of each tool and how to use them all.


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

title: Dive into Kanban (1) - What is it?
date: 2015-05-20 20:55:41
tags:
  - Retrospect
  - Kanban
comments: true
categories:
  - Think
---

[Kanban: Successful Evolutionary Change for Your Technology Business]: http://www.amazon.com/Kanban-Successful-Evolutionary-Technology-Business/dp/0984521402
[Kanban]: http://en.wikipedia.org/wiki/Kanban
[Trello]: http://trello.com/

## What is Kanban

[Kanban][] can be considered as a **pull** system **visualizing** the **work-flow** through **stage transition** under certain **constraints**.  

It's still abstract, right?  Please check below sample Kanban board and I will explain each of the highlighted points below.  

<img alt="Kanban Board" src="http://thinkingincrowd.u.qiniudn.com/Kanban_Simple_Flow.png"/>

## Work-flow & Stage Transition

It's not hard to understand, when you are trying to get something done, it always involves stage transition.  At least two stages, in progress and done, right?

In software development field, before one product/feature is available for customer, it normally goes through **collecting requirement**, **requirement analysis**, **design**, **coding**, **testing**, and **release**.  These can be mapped to each column above and considered as the transition stages involved in work-flow especially when each stage is responsible by different person or team.  

Hence, before applying Kanban methodology to the development process, it's a must we understand how our process is and how the stages are transtioned.

## Visualize

Human-beings are better at recognizing and understanding the world visually.  Work process in software development is quite complex when many parties are involved and especially when the governing policies or management is in a mess.  

By visualizing the process with a board like above, it's easy for everyone to track the work item's progress and spot out the blocking issue or bottleneck if there is any.

## Constraints

The constraints applied in Kanban is called **WIP** (Work in Progress).  This is what differentiates Kanban from other "Card-Wall" style task management system, like [Trello][].  Constraints are those number applied on top of each stage which implies that at most that number of tasks put under that stage in parallel.  In the example above, only 6 tasks can be started in development at the same time.  

We can simply assume the constraint is the number of people in different teams although one person might not be limited to do one thing at a time.  But this idea should be easier to understand at first and we can start from that.  

## Pull

This is an interesting verb.  It's the opposite of **Push**.  I think most of the developers can feel the meaning behind it pretty well.  Most of the time, the work items or tasks are assigned/pushed from higher level.  

But in Kanban, it emphasize that the work items must be pulled from downstream.  Once, the downstream is busy which means the constraints mentioned above is met, then the work-flow has to be stopped until there is vacancy again in downstream.  

Not hard to imagine, upstream perfers **Push** more than **Pull** while the downstream should feel the opposite.  The reasons are due to out-dated management philosophy and/or level of trust among teams which Kanban is intended to improve.  


## Afterword

If you have some basic understanding on Kanban now and curious on what real benefits it can bring, I suggest you to read the great intro book **[Kanban: Successful Evolutionary Change for Your Technology Business][]** by David J Anderson.  


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

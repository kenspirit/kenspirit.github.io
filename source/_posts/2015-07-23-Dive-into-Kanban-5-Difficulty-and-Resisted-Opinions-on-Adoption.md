title: Dive into Kanban (5) - Difficulties and Resisted Opinions on Adoption
tags:
  - Retrospect
  - Kanban
  - Adoption
comments: true
categories:
  - Think
date: 2015-07-23 21:50:49
---

[book]: http://www.amazon.com/Kanban-Successful-Evolutionary-Technology-Business/dp/0984521402

As you have gone this far to know what Kanban is and the benefits it can bring, do you eagerly attempt to adopt in your team or company?  Hold on a little bit first and you should know what difficulties or resisted opinions you may encounter.  

## Management level

### Adoption

It's said that Kanban can evolve from bottom to top, which means you can adopt it within the team you can control first and then gradually influence your partners or external parties.  However, this approach is still very difficult.  

You should have some power to say NO.  The reason is that you have to control the tasks/items pushed from the higher level or external parties.  Else, it's difficult to setup WIP and your team can be frequently interruptted if the tasks/items arrives everywhere.  Hence, it's better if you can leverage your tasks and resources.  

Do you feel desperate if you don't have positional power or it's hard to say no?  There is still chance.  Remember that the first step of applying Kanban is to visualize the process and showing the exact situation your team is encountering.  Hence, it's good chance to sell the Kanban idea if there is some kind of figures can that how messy the situation is, how much effort is wasted, how many tasks per person concurrently, how many recurring blocking issues or requirement quality is not good, etc.  

### WIP Limit

It's hard to persuade the management that there is WIP limit set to the team and NO work can be accepted if resource is full.  Same as above that you can show what the current situation is and see if you can get figures that, concurrently how many tasks each member normally works on.  

David once shared a funny story.  He met with the development and marketing head for one of his consultation client.  Marketing head is complaining that their requests are not being served well and the lead time is too long.  The development head said that each person in his team is already handling average 7 items concurrently.  David asked the marketing head whether they think development team is already doing their best they can?  What do you think about 7 items per person?  Is it too many or too few?  The marketing head has no hesitation on expressing that 7 items per person is too many but he also thinks 1 item per person doesn't sound realistic.  After David gradually increase the WIP, marketing head agree on around 3/4 items per person.  

Actually, it's obvious and intuitive that most of the people can do one thing best without interruption and cannot do things well when multi-tasking.  Afraid of setting WIP is because management is concern on the resource utilization when there is blocking issue.  


#### Supporting arguments

Once you encounter above situation, you might need some supporting theories or arguments.  

1. Change from utilization to flow management.  

    A smooth flow enables us to react and change facing the challenging reality due to the nature that development process contains many variabilities.  In parking lot, we can emphasize on utilization because there is almost no variability affecting parking space.  But on the road, we need to measure and consider how cars flow smoothly because there are too many variabilities.  Lower WIP and enabling slack, which likes limiting number of cars on the road, are ways to achieve agility.  

2. Multi-tasking has negative impact on quality.  

    First, there is causation between WIP and average lead time, and the relationship is linear.  That is described by Little's Law in Queuing Theory.  Second, there is also observation shared by David in his [book][]:  

    >Longer lead times seem to be associated with significantly poorer quality. In fact, an approximately six-and-a-half times increase in average lead time resulted in a greater than 30-fold increase in initial defects. Longer average lead times result from greater amounts of work-in-progress.

    Hence, smaller WIP can bring good quality beside shorter lead time.  


### Defer Commitment

I met one development head who shares that their boss would prefer to be told that their requests are already being taken and holding in someone's hand even though that guy hasn't really spent much quality of time on it.  In the end, the quality might not be good for all items and the lead time for them are all increased because the boss might check the team from time to time and interrupt their progress if he thinks his item is being accepted.  

Obviously, this example shows that, the management don't understand well when it's best for the commitment to be made.  They misunderstand that once the team is acknowledged on the tasks, they are committed to it.  I think we can take the canteen as an example.  The people who lines up are not guaranteed to be served and we obviously should not count the meal ready time starting from waiting in line.  The commitment hasn't been made by the canteen yet.  You can complaint too many guests but not blame serving you poorly.  So, when the commitment is made by the canteen?  The time order is taken.  

Similarly, we should defer our commitment to the stage which indicates we really accept the item.  It should most likely be the time we pulled the item from Requirement stage to In-Dev stage.  Aligning the real starting stage of commitment can better set the expectation and ensure predictable lead time.  


## Execution level

### Changing Communication Channel

At the beginning stage, the behavior of the teams is still using the old habit that communicates through phone, IM or email.  Upstreams don't create tasks through Kanban cards but offline assign them.  In this case, the communication is NOT through cards and it's not following pull principle.  The consequence is that downstreams are kept interrupted and they actually know what they need to do without checking or updating on board.  

Hence, the most important thing on execution is that the whole team, especially upstream parties, should communicate with downstreams through Kanban cards and stick to the rule that tasks are pulled instead of being pushed.  

You may wonder that how if there is some really urgent thing that need interruption on the team or even I have to specifically assign a task to someone?  

1. First checks the board to see what the team or the person is doing which means checking the urgency between your new tasks, the tasks they are working on, and the cards waiting to be pulled.  

2. Create a card on board, adjust the priority or put to different lane to indicate different classes of services.  

3. If it's really an urgent issue like production support case, after doing above, also offline communicates with the team or specific person to realize that there is really something more important need immediately handle.  Then they would decide themselves whether immediately stop and mark the current card as blocked or wait until current tasks is completed.  

It's understandable that we cannot avoid adhoc urgent issue and offline communication.  However, we should try our best to indicate it in our communication channel, Kanban board and cards.  Actually, when this is done, it encourages the available team resource to check and pick tasks themselves.  Anyone think they can do the job can pick it up.  Proactive attitude and responsibility can grow and lessen the "It's not my business" atmosphere.  

There is one thing to notice though.  If it's not easy for the people to put a new card on Kanban board, they are not willing to do so.  For example, the software or website is tremendously slow or there are too many restrictions, rules or requirements about what should or should not be in the card.  


### Resisting Being Spied

I think no one is willing to be monitored or spied on.  Although Kanban can really shows all workload if we put all tasks on board and communicate through it, by no means it's intended to spy on everyone.  As mentioned in previous article, Kanban appreciate slack and doesn't intend to achieve 100% utilization.  Kanban just helps to increase transparency, encourage self-management and pro-active collaboration for problem solving.  

From another perspective, if a boss is really intended to spy on the team, no matter using Kanban or not, he will come up his own method.  So the worse thing is that the team must collect data everywhere to demonstrate that the resource is already fully utilized.  But using Kanban, we don't need to waste time on those boring, time-consuming and meaningless data collection and the boss can see how busy you are right on Kanban board.  


## Afterword  

[Thinking, Fast and Slow]: http://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555

It requires mindset change when using Kanban, no matter on management or execution level.  Human nature resists change.  When we decide to adopt it, we must understand the benefits it brings and what existing problems it can address.  If everyone evaluates that the benefits are more than drawbacks, change is easier.  If not, we should know the reasons behind it.  If you want to persuade someone, interesting thing is that you should know he's using System 1 or System 2 to argue with you, then you can come up more appropriate solutions.  You can take a look at related books about the different systems, like [Thinking, Fast and Slow][].  Try recall the scene that you argued with your girlfriend or wife and no consensus was made.  You two were probably arguing with different systems.  Adopting Kanban requires us to make it flow around the rock like water.  


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

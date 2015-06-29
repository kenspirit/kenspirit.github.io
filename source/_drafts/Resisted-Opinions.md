title: Difficulty and Resisted Opinions on Adoption
tags:
  - Retrospect
  - Kanban
comments: true
categories:
  - Think
---

[book]: http://www.amazon.com/Kanban-Successful-Evolutionary-Technology-Business/dp/0984521402

After you have gone this far to know what Kanban is and the benefits it can bring, you may eagerly attempt to apply to your team or company.  However, hold on a little bit first and you should know what difficulties or resisted opinions you may encounter.  

## Management level

### Adoption direction

Although it's said that Kanban can be evolved from lower level to higher level, adopted within the team you can control first and then gradually influence your partners or external parties, it's still very difficult.  

You'd better have some power to say NO.  The reason is that you have to control the tasks/items pushed from the higher level.  Else, it's difficult to setup WIP or your team can be frequently interruptted if the tasks/items are coming everywhere.  Hence, it's better if you can leverage your tasks and resources, or at least use the Kanban board.  

Do you feel desperate after hearing this if you are not in that position or hard to say no?  There is still chance.  Remember that the first step of applying Kanban is to visualize the process and showing the exact situation your team is encountering.  Hence, it's good chance to sell the Kanban idea if there is some kind of figures can be shown how messy the situation is, how much effort is wasted, tasks per person are too many, blocking issues recurs or requirement quality is not good, etc.  

### WIP Limit

It's hard to persuade the management that there is WIP limit set to the team and NO work can be accepted if resource is full.  Same as above that you can show what the current situation is and see if you can get figures that, concurrently how many items each member normally works on.  

David once shared a funny story.  He met with the development and marketing head for one of his consultation client.  Marketing head is complaining that their requests are not being served well and the lead time is too long.  The development head said that each person in his team is already handling average 7 items concurrently.  David asked the marketing head whether they think development team is already doing their best they can?  How do you think 7 items per person?  Is it too many or too few?  Sounds right?  The marketing head has no hesitation on expressing that 7 items per person is too many but he also thinks 1 item per person doesn't sound realistic.  After David gradually increase the WIP, marketing head agree on around 3/4 items per person.  

Actually, it's obvious and intuitive that most of the people will agree they can do one thing best without interruption and cannot do things well when multi-tasking.  Afraid of setting WIP is because management is concern on the resource utilization when there is blocking issue.  

### Commitment

I met one development head who shares that their boss would prefer to be told that their requests are already being taken and holding in someone's hand even though that guy hasn't really spent much quality of time on it because of some other urgent issues on hand.  In the end, the quality might not be good for all items and the lead time for them are all increased because the boss might check the team from time to time and interrupt their progress on all items.  

Obviously, this example shows that, the management don't understand well when it's best for the commitment to be made.  They misunderstand that once the team is acknowledged on the tasks, they are committed to it.

Commitment is deferred:  Canteen serving food vs lining up  (Predictability)


### Supporting arguments

Once you encounter above situation, you might need some supporting theory or arguments for it.  

1. Change from utilization to flow management.  

    As previous article mentioned, slack is a way to creativity and agility for knowledge worker.  We cannot manage them like factory worker and emphasize utilization.  A smooth flow in the company enables us to react and change facing the challenging reality.  For example, in parking lot, we can emphasize on utilization.  But on the road, we need to measure and consider how cars flow smoothly.  

2. Multi-tasking has negative impact on quality.  

    First, there is causation between WIP and average lead time, and the relationship is linear.  That is described by Little's Law in Queuing Theory.  Second, there is also observation shared by David in his [book][]:  

    >Longer lead times seem to be associated with significantly poorer quality. In fact, an approximately six-and-a-half times increase in average lead time resulted in a greater than 30-fold increase in initial defects. Longer average lead times result from greater amounts of work-in-progress.

    Hence, smaller WIP can bring good quality beside shorter lead time.  

## Execution level

At the beginning stage, the behavior of the teams is still using the old habit that communicates through phone, IM or email.  Upstreams don't create tasks through Kanban cards but offline assign them.  In this case, the communication is NOT through cards and it's not following pull principle.  The consequence is that downstreams are kept interrupted and they actually know what they need to do without checking or updating on board.  

Hence, the most important thing on execution is that the whole team, especially upstream parties, should communicate with downstreams through Kanban Cards and stick to the rules that tasks are pulled instead of being pushed.  

You may wonder that how if there is some really urgent thing that need interruption on the team or even I have to assign a task to some specific person?  

1. First checks the board to see what the team or the person is doing which means checking the urgency between your new tasks, the tasks they are working on, and the cards waiting to be pulled.  

2. Create a card on board, adjust the priority or put to different lane to indicate different classes of services.  

3. If it's really an urgent issue like production support case, offline communicate the team or specific person to realize that there is something more important to handle.  Then they would decide themselves whether immediately stop and mark the current card as blocked or wait until it completes.  

It's understandable that we cannot avoid adhoc urgent issue and offline communication.  However, we should try our best to indicate it in our communication channel, Kanban board and cards.  Actually, when this is done, it encourages the available team resource to check and pick tasks themselves.  Anyone think they can do the job can pick it up.  Proactive attitude and responsibility to resolve issues can grow and lessen the "It's not my business" attitude.  









System 1 vs System 2:  Argue using different system makes things worse




Make policies explicit (List all policies for everyone)

How & why work arrives
Tracks workflow through services
Map knowledge discovery workflow


Have managers changed their behaviors?
Have the customers interface changed?
Have the customers contract chagned?
Have the services delivery business model changed?

Kanban like water --> Flow around the rock.




## Metrics

In Kanban, the most important measurement is Lead time and many metrics are based on it.  We will take more in-dept look into metrics Kanban commonly uses to identify the issue in our flow, do estimation & scheduling, etc. in later articles.  Here, I will just give a brief description on below two metrics so that you can have a rough idea.  

* **Lead Time** - Duration between the completion and start time of one item  

  How to choose appropriate start and end stage depends on what we really want to measure.  

  Say, from the development team's perspective, the lead time is starting from the time the requirement is ready for development and ending until QA completes testing.  However, if from the business's perspective, the starting point should be the time customer raises the request and the ending point is when it's released to production.  

* **Flow Efficiency** - `100% * Work Time / Lead Time`  

  This metric tells us how much time is wasted in the flow.  According to David Anderson, common figure in the software development industry is `1% to 5%`.  At the time he's working in Microsoft, the project he measured is `8%`.  If any company's flow efficiency can be higher than `40%`, then it's a very good level.  


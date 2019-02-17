title: Dive into Kanban (2) - Visualizing Process
tags:
  - Retrospect
  - Kanban
  - Visualization
comments: true
categories:
  - Think
date: 2015-05-30 00:20:10
---

## Process and Visualization

I think no one will question the importance of process, but it actually also kills a company's agility and creativity if it becomes some bureaucracy procedures for doing certain things.  

It's very easy to add process which possibly is some governace on an incident happened once only but it's hard to remove an established one.  That is because almost no one can tell the historical reason of adding it or has the guts to suggest removing it.  It is hard to provide compelling reason or evidence to prove that removing it has great benefit or the people is afraid of taking the responsibility for something bad happened if removing it.  

Visualizing process is the **first and the most important** thing in using Kanban.  With proper visualization in Kanban, we can see if there is any process that prevents the item flow efficiently and consider area to improve.

Also, about the communication cost within the process, if we have put most of the valuable information on the Kanban board already, why borther to send out emails to ask a group of people and wait feedback?  

## Sample Process

Let's see the process established in one company:

1. **Business Analysis** collect requirement, confirms priority and a particular release schedule. Then walkthrough requirement to development & QA team.   

2. Shared **Development and QA team** estimate efforts given the item list and feedback if the items can be included.  

3. When development is done in time, development team raises a Release Candidate Request to **Release team** for central manangement.  It's some kind of paperwork to indicate that you have done development testing, QA walkthrough, review with system and/or DBA team for reviewing necessary change if required.  

4. After release team confirms the item can be included in a particular release, development team can request QA environment deployment from Release team.  

5. Once QA environment is ready by Release team, **Development team** need to do integration testing and mark the item as "Ready for Testing" so that QA steps in for full testing.  

6. If QA testing is completed without much blocking issue before final Code Freeze time, release team will include the release item to do PP deployment.

7. **QA** starts PP regression testing and see if there is any issue.

8. When regession testing is done, **Release team** packs code for arranging prodction release.  

_Notes: There are many daily or weekly reports gathering item progress & blocking issues within this period._  

You can see how many steps, different groups of people involved here and each step involves some kind of **signal** to indicate it can be ready for next stage to continue the process.  Bunches of email discussion, confirmation can happen especially when something unexpected happens.  

If we visualize the process using the Kanban below and all different teams based on the item status on the board to do actions accordingly, lot of communication cost can be avoided.  

## Visualization  

<img alt="Kanban Board" src="https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/Kanban_Visualize_Process.png"/>

Here is how the process integrates within the Kanban board.  

1. Before items' priority is confirmed, they are all put under **Backlog** stage.  Once priority is confirmed, then they can be put under **Prioritized** stage. The most important one should be listed at top so that the issue of balancing between different business unit can be easily solved.  As this company's working style still involves effort estimation, we can put effort estimation as task in the work item or make it as pull condition in Prioritized stage.

2. If the development of one work item is done, it can be marked as **Completed** (<span style="color: #7ED321">Green</span> border of the card) so that it can be treated as a signal to be pulled to next stage.  

3. Once release team approve the item and finish QA environment deployment, they can also mark the item as Completed in **RC Request** stage.

4. If DevInt Test is done, development team can mark the card as Completed in **Dev-Int Test** stage.  

5. Similar approach can be used on **QA Test**, **PP Deploy** and **PP Regression** stages.  

6. If any work item is **Blocked**, it can be easily told from the <span style="color: red">Red</span> border of the card and what the reason is.  Further, the blocked time and reason can be used to calcualte the flow efficiency later.  

Hence, visualizing the process in Kanban helps us clearly know in which stage the working item is and what followup actions are required to continue the process or clear the blocking issues. A picture is worth a thousand words.  


## Afterword

Process visualization in Kanban is the most essential step.  The difficulty on visualization is how to make policies explicit for everyone in the process.  And we **must reflect the real process** in the company/team instead of copying a existing Kanban board from others or design an ideal version in your mind.  


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

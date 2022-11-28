# Scheduler Simulator
*The **Capstone Project** marks the end of the **CS50’s Web Programming with Python and JavaScript** online course*.  

The purpose of this project is to design and implement a web application of your own with **Python** and **JavaScript**, distinct from the other projects in this course.


#### What does the app do? 

**Scheduler Simulator** has five main **functionalities**:

* Provide a bit of ***background information*** to the user to understand how each scheduler works 
* Provide ***prefilled settings*** for each scheduler for best and worst case scenarios
* Provide a playground in which the user can ***simulate*** a workload with ***custom settings*** for any scheduler and start a new ***scheduling session***
* ***play-stop*** option for an ongoing scheduling session 
* Provide a ***copy*** and ***paste*** setup option so that the user can:
    * paste(load) the copied workload and general settings as input for other scheduler 
    * create a **prefilled** like option for **custom workloads** added by the user 


### How to run the application

The app uses **Django**, the **Python**-based web framework, and **Django**'s **ORM** for interacting with the database.  
For frontend, the app is built with **React**, **HTML**, **CSS**, **JavaScript** and **Bootstrap**. 


Use the following to install and run the project, after downloading it:

`pip3 install -r requirements.txt`  in order to install **Django**

Inside the project directory (**Capstone/Simulation**) run the following command:  
`python3 manage.py loaddata data.json` to load default data into the database  


Inside the project directory (**Capstone/Simulation**) run the following command:  
`python3 manage.py runserver`


--- 

### Short intro to Terminology

* Process - a job that enters the system at *arrivalTime* and needs to run for *executionTime*
* Performance metrics: 
    * *Turnaround Time*: T(first run) - T(completion)
    * *Response Time*: T(enters the system) - T(first run)
* Workload - a list of processes entering the system 
* General settings for schedulers:
    * *time slice* (RR)
    * *boost* (MLFQ)
    * *queues* (MLFQ)
* Configuration: Workload and General settings 

---

### Distinctiveness and Complexity

The **Scheduler Simulator** is a single page *interactive learning app* used to present visually a theoretical *concept*: the ***Scheduler***. 

The ***Schedulers*** covered in this app are:

* **FIFO** (First-In, First-Out)
* **SJF** (Shortest-Job-First)
* **STCF** (Shortest-To-Completion-First)
* **RR** (Round-Robin)
* **MLFQ** (Multi-Level Feedback Queue)


The **Distinctiveness and Complexity** of this project can be split into five areas:

- [Understand the theory](#understand-the-theory)
- [Develop a responsive design for the UI elements](#develop-a-responsive-design-for-the-ui-elements)
- [Develop the algorithms for each scheduler](#develop-the-algorithms-for-each-scheduler)
- [Add the copy-paste functionality](#add-the-copy-paste-functionality) 
- [Add prefilled settings functionality](#add-prefilled-settings-functionality) 



### Understand the theory

* *understanding* very well each theoretical concept and the metrics through which the performance of a scheduler is measured
* understand how workload and performance metrics are defined 
* how each scheduling policy works
* how to emphasize the differences between them
* where each scheduler performs best and worst according to performance metrics


### Develop a responsive design for the UI elements

The schedulers provide *similar options* like adding a new process, showing performance statistics, play and stop an ongoing session, but are *different* in general settings (time slice, boost, queues), internal state and the *decision making* process. 

Part of the complexity of the project was deciding how to create the components **flexible** enough so that all schedulers can use what they have in common, and, at the same time, being able to accommodate **different options** where necessary:  
* For e.g: while the **progress bar** for a process is the same, the **MLFQ scheduler** has a *different design* that requires more than one progress bar to be displayed inside multiple queues

From the *home page*, the UI elements allow a user to:

* access a brief info section about each scheduler 
* navigate between schedulers
* get pre-filled settings for each scheduler


After a *scheduler* component is rendered, the UI elements allow a user to:

* create workloads for the rendered scheduler
* copy-paste current configuration and use it for other scheduler
* run scheduling sessions and obtain performance results for each session: average *Turnaround* and *Response* Time 
* play-pause an ongoing scheduling session
* visualize how the progress made by a process changes over time until completion and the dynamic between them 


At this point, understanding how to integrate and use *React* for frontend and *Django* for backend was part of the complexity of the project as well.

### Develop the algorithms for each scheduler

The ***decision making*** process is at the core of each scheduler and is unique in how it chooses what process from the workload to schedule next.

Here, **React** is used to create/update state/remove components and render them according to the **JavaScript** implemented logic within each component. 

An exciting part of the project was:
* figure out how the state of each scheduler should look like
* writte the decision making algorithm for each scheduler
* find solutions to interesting problems (e.g: can't trigger multiple state updates in *React* in a for loop)
* figure out how different elements should interact with each other and treat edge cases like don't delete/add a process while the scheduler is running 


### Add the copy-paste functionality

Create an **interface** for the user to **configure workloads** and **load** them as **prefilled settings** for other scheduler: 

* If the new scheduler has **more general settings** than the current one, enable and require additional input from the user (for e.g switch from FIFO to RR, require time slice)
* If the new scheduler has **fewer general settings** than the current one, the additional settings will be removed (for e.g switch from MLFQ to STCF: time slice, queues and boost will be dropped)

This interface was used to **create the workloads** for **prefilled configuration**, export them and save them in **Django admin**. 

### Add prefilled settings functionality


Using the already implemented **copy-paste** function for a workload, the **prefilled configurations** were saved to the database. 

The prefilled settings show best and worst case scenarios for each scheduler, serving as **guidelines** for each scheduler's **performance**.

After the prefilled settings are fetched from the database, the scheduler starts running a new session.

---

### The Structure of the Project 

The *Django* project is called *Simulation* and has one app called *scheduler*.

##### Capstone/Simulation/scheduler/views.py 

Here are defined the routes for:
* the home page, rendering the index.html template from the view
* the endpoint API, that returns the prefilled settings from the database to the requester. 

##### Capstone/Simulation/scheduler/models.py

*  models for the database
*  the database has prefilled workloads examples (best performing and worst performing) for each scheduler 


##### Capstone/Simulation/scheduler/templates/scheduler/index.html

The index.html template is rendered when the default route is reached.  

* load *React* and *Boostrap* throught CDN `<script>` tags
* link the *CSS style sheet*
* the main *React* component called **app.js** is rendered to the DOM. 
* components use different modules that are imported inside the index.html `<body>` tag.


##### Capstone/Simulation/scheduler/static/scheduler/

Has the following files and folders: 

* app.js - where the main *React* app component is defined 
* styles.css - the stylesheet 
* components/ - where all the *React* components used by the main **app.js** are defined

##### Capstone/Simulation/scheduler/static/scheduler/app.js 

The **app.js** component is at the core of the app.  

Its main purpose is to allow the user to learn about each scheduler and navigate between schedulers (with **prefilled settings** or **custom settings**). 

At the same time, allows for new scheduler components to be added/removed and also allows for **major changes** to be made to any scheduler **without impacting** other schedulers.


##### Capstone/Simulation/scheduler/static/scheduler/components/

The **components** folder has all the **modules** needed for the app:

* components for each scheduler (except FIFO and SJF that share the same component with small differences)
* each scheduler component allows the user to: 
    * **create** workload as input
    * **start/pause** a scheduling session for the input workload
    * keeps a list with all the processes settings, **decides** which process should run next and calls `runProcess()` function that runs one process 
    * maintains the state of the **progress** made on workload and **visually** represents it
    * shows **statistics** at the end of the session
    * allows users to **copy** the configuration of the workload and **trigger** the render of another scheduler 
* **helper modules** for the main scheduler components, for e.g: **rendering buttons**, **progress bars**, **run a process**, **delete a process**, **compute average metrics** 
* the helper modules were created with the purpose of **re-using elements** shared or frequently used by the schedulers

---

### Final thoughts

The course had a brief introduction to **React** and I thought that it would be nice to start from there and learn **React** on my own and.   
Eventually, I used what I've learned in the final project.  

Also, at the same time, I was working on an OS Course (*Introduction to Operating Systems, Three Easy Pieces by Remzi Arpaci Dusseau*) and the idea of the project came by combining the two.






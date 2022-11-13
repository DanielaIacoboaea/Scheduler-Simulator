# Scheduler Simulator
*The **Capstone Project** marks the end of the **CS50’s Web Programming with Python and JavaScript** online course*.  

The purpose of this project is to design and implement a web application of your own with **Python** and **JavaScript**, distinct from the other projects in this course.

### How to run the application

The app uses **Django**, the **Python**-based web framework, and **Django**'s **ORM** for interacting with the database.  
For frontend, the app is built with **React**, **HTML**, **CSS**, **JavaScript** and **Bootstrap**. 


Use the following to install and run the project, after downloading it:

`pip3 install -r requirements.txt`  
Inside the project directory run the following command:
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

The **Scheduler Simulator** is a single page *interactive learning app* used to present visually a theoretical *OS concept*: the *Scheduler*. 

The *OS Schedulers* covered in this app are:

* **FIFO** (First-In, First-Out)
* **SJF** (Shortest-Job-First)
* **STCF** (Shortest-To-Completion-First)
* **RR** (Round-Robin)
* **MLFQ** (Multi-Level Feedback Queue)

#### What does the app do? 

**Scheduler Simulator** has four main functionalities:

* Provide a bit of *background information* to the user to understand how each scheduler works 
* Provide *pre-filled settings* for each scheduler for best and worst case scenarios
* Provide a playground in which the user can *simulate* a workload with *custom settings* for any scheduler and start a new *scheduling session*
* Provide a *copy* setup option so that the user can copy different workloads and use them for future reference

#### Complexity 

In order to develop this project I've split it in four main parts, described below.

The first part of the project meant *understanding* very well each theoretical concept and the metrics through which the performance of a scheduler is measured.  

Understanding the theory:

* understand how workload and performance metrics are defined 
* how each scheduling policy works
* how to emphasize the differences between them
* where each scheduler performs best and worst according to performance metrics

The second part of the project focused on *developing the UI elements* while creating a *responsive design* throughout the project.  
The UI elements allow a user to:

* navigate between schedulers
* create workloads for any scheduler
* run scheduling sessions and obtain performance results for each session: average *Turnaround* and *Response* Time 
* get pre-filled settings for each scheduler
* visualize how the progress made by a process changes over time until completion 
* visualize the dynamic between processess and when each of them gets scheduled to run according to each scheduling policy 
* access a brief info section about each scheduler 

At this point, understanding how to integrate and use *React* for frontend and *Django* for backend was part of the complexity of the project as well.


The third part of the project focused on *developing the algorithms* for each scheduler.  
Here, **React** is used to create/update state/remove components and render them according to the **JavaScript** implemented logic within each component. 

The schedulers provide *similar options* like adding a new process, showing performance statistics, but are *different* in general settings (time slice, boost, queues), internal state and the *decision making* process.  
The *decision making* process is at the core of each scheduler.

An exciting part of the project was:
* figure out how the state of each scheduler should look like
* writte the decision making algorithm for each scheduler with the goal of choosing the next process from the list of processes that should run 
* find solutions to interesting problems (e.g: can't trigger multiple state updates in *React* in a for loop)

The fourth part of the project focused on developing the *pre-filled settings*, using the already implemented copy function for a workload and *fetching* them from the database.


---

### The Structure of the Project 

The *Django* project is called *Simulation* and has one app called *scheduler*.

##### Simulation/scheduler/views.py 

We have here the route for the home page, rendering the index.html template from the view.   
Also, we have defined a route for the endpoint API, that returns the pre-filled settings from the database to the requester. 

The database is filtered after the scheduler name and type (Good example or Bad example) received as parameters in the request. 

##### Simulation/scheduler/models.py

The models for the database are defined here.   
The database has pre-filled workloads examples for each scheduler. 
Each scheduler has one set of positive examples and one set of negative examples.


##### Simulation/scheduler/templates/scheduler/index.html

The index.html template is rendered when the default route is reached.  

*React* is loaded in the app by adding CDN `<script>` tags to the HTML index.html.  
Additional `<script>` tags are needed for *Babel* to convert JSX syntax used in *React* to vanilla *JavaScript* and a *Babel* plugin that allows creation of modules that can be exported and used between components.   

All modules are imported inside index.html `<body>` tag.

The index.html page has a `<main>` tag with id="app" where the main *React* component called **app.js** is rendered to the DOM. 


##### Simulation/scheduler/static/scheduler/

Has the following files and folders: 

* app.js - where the main *React* app component is defined 
* styles.css - the stylesheet 
* components/ - where all the *React* components used by the main app.js are defined

##### Simulation/scheduler/static/scheduler/app.js 

The app.js component is at the core of the app: 

* It renders each individual scheduler depending on the user's choice: with default settings or with custom settings
* displays navigation buttons that trigger the render of components for each scheduler 
* displays info buttons 
* makes an API call to the backend to retrieve pre-filled settings

##### Simulation/scheduler/static/scheduler/components/

The components folder has all the modules needed for the app:

* components for each scheduler (except FIFO and SJF that share the same component with small differences)
* each scheduler component allows the user to: 
    * create workload as input
    * start a scheduling session for the input workload
    * keeps a list with all the processes settings, decides which process should run next and calls `runProcess()` function that runs one process 
    * maintains the state of the progress made on workload 
    * shows statistics at the end of the session
    * allows users to copy the configuration of the workload
* helper modules for the main scheduler components, for e.g: rendering buttons, progress bars, run a process, delete a process, compute average metrics 
* the helper modules were created with the purpose of re-using elements shared or frequently used by the schedulers


### Final thoughts

The course had a brief introduction to **React** and I thought that it would be nice to start from there and learn **React** on my own and, eventually, use what I've learned in the final project.  

Also, at the same time, I was working on an OS Course (*Introduction to Operating Systems, Three Easy Pieces by Remzi Arpaci Dusseau*) and the idea of the project came by combining the two.






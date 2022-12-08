import React from "react";

/*
    Buttons are used to navigate to scheduler with pre-filled settings
 */


export default class ButtonsDefault extends React.Component{
    constructor(props){
        super(props);
    }

    startDefaultScheduler = (event) => {
        this.props.handleDefaultClick(event.target.id);
    }

    render(){

        const descriptions =[
            {
                "name": "FIFO", 
                "class": "btn btn-secondary", 
                "classInfo": "btn btn-outline-secondary",
                "info": `First In, First Out (FIFO) scheduler has a simple and easy to implement algorithm.
                    FIFO is a non-preemptive scheduler, it shedules each process to run to completion before moving to the next one.
                    \nProcesses are scheduled in the order of their arrival. While this can work pretty well, at the same time, 
                    it can lead to the 'convoy effect', where a number of relatively short processes get queued behind a heavyweight process.
                    \nFor example, if A=100s, B=10s and C=10s arrive at the same time.
                    A gets scheduled first, runs to completion 100s before B or C get a chance to run. In this case FIFO performs poorly.`
            },
            {
                "name": "SJF", 
                "class": "btn btn-info", 
                "classInfo": "btn btn-outline-info",
                "info": `Shortest Job First (SJF) schedules the shortest job first, then the next shortest and so on.
                    SJF is a non-preemptive scheduler, it schedules each process to run completion before moving to the next one. 
                    \nFor example, if A=100s, B=10s and C=10s arrive at the same time, B or C will be run first to completion 
                    and then A will start running, which is great for response time.
                    But if B or C arrive shortly after A, they are forced to wait until A has completed.`
            },
            {
                "name": "STCF", 
                "class": "btn btn-dark", 
                "classInfo": "btn btn-outline-dark",
                "info": `Shortest Time-To-Completion First (STCF) is a preemptive scheduler. 
                    It can preempt process A and decide to schedule another process to run, perhaps continuing A later. 
                    Any time a new process enters the system, the STCF scheduler, determines which of the remaining processes has the least time left and schedules that one. 
                    \nFor example if A=100s arrives at T=0 and B=10s, C=10s, arrive at T=15, the scheduler will stop running A 
                    and will schedule B or C at T=15 to run to completion, and continue running A later.  
                    \nWhile this is great, it can still perform poorly for response time, in this case C will have
                    to wait 10s until B runs to completion to start running.
                `
            },
            {
                "name": "RR", 
                "class": "btn btn-success", 
                "classInfo": "btn btn-outline-success",
                "info": `The Round-Robin (RR) scheduler is sensitive to response time.
                    RR is a preemptive algorithm, but instead of scheduling processes to run to completion, once it's decided which process should run,
                    RR schedules a process for a time slice and then switches to the next process in the queue. 
                    It repeats the same idea until the processes are finished.
                    \nFor example if time slice=1 and A=5s, B=5s and C=5s arrive at the same time, RR would cycle through the 
                    processes quickly with an average response time of 1.
                    \nThe trade-off is that RR performs worst on turnaround time because it is streching each process as long as it can 
                    by running them for a little bit until moving to the next process.
                `
            },
            {
                "name": "MLFQ", 
                "class": "btn btn-danger", 
                "classInfo": "btn btn-outline-danger",
                "info": `Usually, very little is known about the length of each process.
                    The Multi-Level Feedback Queue uses the recent past to predict the future. 
                    It uses multiple levels of queues and uses feedback to determine the priority of a process. Paying attention to how a process behaves over time and changing its priority.
                    \nWhen a process enters the system, it is placed at the highest priority (top queue).
                    Once it uses its time slice, its priority is reduced and moves down one queue.
                    If two or more procesess have the same priority, they are scheduled to run according to RR algorithm. 
                    \nTo prevent starvation of long-running processes, if multiple short running processes enter the system,
                    after some boost time, all processes in the system are assigned highest priority: move to the top queue.
                `
            }
        ];

        return(
            <section className="wrapper-btns-default">
                <section id="infoGroup">
                    <div id="description">
                        <div className="wrapper-btns-info">
                            <h4 className="guide-header">
                                Learn how each scheduler works. <br /> 
                            </h4>
                            <div className="btns-default-info">
                                {descriptions.map((description) => 
                                    <div className="btns-default">
                                        <button 
                                            className={`${description.classInfo} btn-lg`}
                                            id={`${description.name}Info`} 
                                            type="button" data-toggle="collapse" 
                                            data-target={`#info${description.name}card`} 
                                            aria-expanded="false" 
                                            aria-controls={`info${description.name}card`}>
                                                {description.name} ?
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="wrapper-btns-info">
                            <h4 className="guide-header">
                                Practice exemples with pre-filled settings for best and worst case scenarios to see them in action: 
                            </h4>
                            <div className="btns-default-info">
                                {descriptions.map((description) => 
                                    <div className="btns-default">
                                        <button 
                                            type="button" 
                                            className={description.class} 
                                            id={`${description.name}Good`} 
                                            onClick={this.startDefaultScheduler}>
                                                Best Case
                                        </button>
                                        <button 
                                            type="button" 
                                            className={description.class} 
                                            id={`${description.name}Bad`} 
                                            onClick={this.startDefaultScheduler}>
                                                Worst Case
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {descriptions.map((description) => 
                        <article className="collapse" id={`info${description.name}card`} data-parent="#infoGroup">
                            <div className="card card-body">
                                <p className="scheduler-info">
                                    {description.info}
                                </p>
                            </div>
                        </article>
                    )}
                </section>
            </section>
        );
    }
}
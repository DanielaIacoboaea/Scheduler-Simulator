
/*
    Each button triggers the display of additional information
    for each scheduler.
 */
export default class ButtonsInfo extends React.Component{
    constructor(props){
        super(props);
    }

    render(){

        const descriptions =[
            {
                "name": "FIFO", 
                "class": "btn btn-secondary btn-lg", 
                "info": `First In, First Out (FIFO) scheduler has a simple and easy to implement algorithm.
                    FIFO is a non-preemptive scheduler, it shedules each process to run to completion before moving to the next one.
                    \nProcesses are scheduled in the order of their arrival. While this can work pretty well, at the same time, 
                    it can lead to the 'convoy effect', where a number of relatively short processes get queued behind a heavyweight process.
                    \nFor e.g if A=100sec, B=10sec and C=10sec arrive at the same time.
                    A gets scheduled first, runs to completion 100sec before B or C get a chance to run. In this case FIFO performs poorly.`
            },
            {
                "name": "SJF", 
                "class": "btn btn-info btn-lg", 
                "info": `Shortest Job First (SJF) schedules the shortest job first, then the next shortest and so on.
                    SJF is a non-preemptive scheduler, it schedules each process to run completion before moving to the next one. 
                    \nFor e.g if A=100sec, B=10sec and C=10sec arrive at the same time, B or C will be run first to completion 
                    and then A will start running, which is great for response time.
                    But if B or C arrive shortly after A, they are forced to wait until A has completed.`
            },
            {
                "name": "STCF", 
                "class": "btn btn-dark btn-lg", 
                "info": `Shortest Time-To-Completion First (STCF) is a preemptive scheduler. 
                    It can preempt process A and decide to schedule another process to run, perhaps continuing A later. 
                    Any time a new process enters the system, the STCF scheduler, determines which of the remaining processes has the least time left and schedules that one. 
                    \nFor e.g if A=100sec arrives at T=0 and B=10sec, C=10sec, arrive at T=15, the scheduler will stop running A 
                    and will schedule B or C at T=15 to run to completion, and continue running A later.  
                    \nWhile this is great, it can still perform poorly for response time, in this case C will have
                    to wait 10sec until B runs to completion to start running.
                `
            },
            {
                "name": "RR", 
                "class": "btn btn-success btn-lg", 
                "info": `The Round-Robin (RR) scheduler is sensitive to response time.
                    RR is a preemptive algorithm, but instead of scheduling processes to run to completion, once it's decided which process should run,
                    RR schedules a process for a time slice and then switches to the next process in the queue. 
                    It repeats the same idea until the processes are finished.
                    \nFor e.g if time slice=1 and A=5sec, B=5sec and C=5sec arrive at the same time, RR would cycle through the 
                    processes quickly with an average response time of 1.
                    \nThe trade-off is that RR performs worst on turnaround time because it is streching each process as long as it can 
                    by running them for a little bit until moving to the next process.
                `
            },
            {
                "name": "MLFQ", 
                "class": "btn btn-danger btn-lg", 
                "info": `The OS usually knows very little about the length of each process.
                    The Multi-Level Feedback Queue uses the recent past to predict the future. 
                    It uses multiple levels of queues and uses feedback to determine the priority of a process. Paying attention to how a process behaves over time and changing its priority.
                    \nWhen a process enters the system, it is placed at the highest priority (top queue).
                    Once it uses its time slice, its priority is reduced and moves down one queue.
                    If two or more procesess have the same priority, they are scheduled to run according to RR algorithm. 
                    \nTo prevent starvation of long-running processes, if multiple short running processes enter the system,
                    after some boost time, all processes in the system are assigned highest priority: move to the top queue.
                `
            },
            {
                "name": "Terms", 
                "class": "btn btn-light btn-lg", 
                "info": `Turnaround Time: the time at which the process completes minus the time at which the process arrived in the system. 
                    Response Time: the time from when the process arrives in the system to the first time it is scheduled to run. 
                    \nFIFO, SJF and STCF optimize turnaround time but are bad for response time.
                    RR optimizez the response time, but is bad for turnaround time.
                    MLFQ optimizes turnaround time and minimizez response time by giving any process a chance to run when
                    entering the system, learn how it behaves over time and adjust accordingly.
                `
            }
        ];

        return(
            <React.Fragment>
            <section id="infoGroup">
                <div id="description">
                    {descriptions.map((description) =>
                        <button 
                            className={description.class} 
                            id={`${description.name}Info`} 
                            type="button" data-toggle="collapse" 
                            data-target={`#info${description.name}card`} 
                            aria-expanded="false" 
                            aria-controls={`info${description.name}card`}>
                                Info {description.name}
                        </button>
                    )}
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
            <p id="credits">
                <p>Information based on the book: Operating Systems, Three easy pieces. </p>
                <p>Author: Remzi Arpaci Dusseau.</p>
                <p>If you want to learn more, check it out for further reference.</p>
            </p>
            </React.Fragment>
        );
    }
}
import React from "react";

/*
    Buttons are used to navigate to scheduler with pre-filled settings
 */


export default class Description extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        
        const descriptions ={
            "FIFO": {
                "Good": `Processes P0, P1 and P2 arrive at the same time (A = 0) in the system and each process needs to run for 3s (E = 3).
                    They are scheduled in the order of their arrival. After a process runs to completion, the next one is scheduled.
                    Because they have short execution time, we get an average Turnaround Time of 5.00s and an average Response Time of 3.00s.
                    So, in this case, FIFO performs well.`,
                "Bad": `Processes P0(A=0, E=29), P1(A=0, E=3), P2(A=0, E=3), P3(A=1, E=1) arrive in the system and are scheduled in the order of their arrival.
                    P3(E=1) is forced to wait until all the processes that arrived before it finished running. Same happens for P1 and P2, even though they arrived at the same time with P0. 
                    In this case, all the short running processes get queued behind P0(E=29), which leads us to an average Turnaround Time of 31.75s, 
                    an average Response Time of 23.75s and a poorly performing FIFO, especially for the Response Time metric.`
            },
            "SJF": {
                "Good": `Processes P0(A=0, E=29), P1(A=0, E=3), P2(A=0, E=3) arrive at the same time. 
                    If processes arrive at the same time, they are evaluated and the shortest running process gets scheduled first. 
                    After they're done, any remaining long running processes are scheduled. This improves average Turnaround Time to 13.67s and average Response Time to 3.00s.`,
                "Bad": `Processes P0(A=0, E=29), P1(A=1, E=3), P2(A=1, E=3) and P3(A=1, E=1) arrive in the system.
                    Because P3, P2 and P1 arrive at the same time (A=1), the shortest among them is scheduled to run: P3.
                    But SJF's performance drops in this case, because P1, P2 and P3 arrive 1s later than a long running process, P0(A=2) and they will be forced to wait until P0 completes. 
                    This leads to an average Turnaround Time of 30.25s and an average Response Time of 22.25s.
                    `
            },
            "STCF": {
                "Good": `Processes P0(A=0, E=29), P1(A=1, E=3), P2(A=1, E=3), P3(A=1, E=1) arrive in the system.
                    P0 (A=0) starts running, but gets interrupted when P1, P2 and P3 arrive at A=1. P3 has the least time left and gets sheduled to run.
                    After P3 runs to completion, P1 and P2 are scheduled to run. P0, the longest running process resumes after P1 and P2 run to completion. 
                    This leads to an average Turnaround Time of 11.00s and an average Response Time of 1.25s.`,
                "Bad": `Processes P0(A=0, E=20), P1(A=2, E=10), P2(A=3, E=2), P3(A=2, E=10) arrive in the system. P0 runs first. 
                    It gets interrupted by P1 or P3 at T=2. P1 or P3 stop running when P2 arrives(A=3). While a new process does not arrive in the system, the current scheduled process will run to completion. 
                    So, for P3 the response time is bad because it needs to wait until P1 ends. As for P0, a long running process, if multiple short processes arrive in the system and all of them run to completion, it can starve until it gets a chance to run again.
                    This leads to an average Turnaround Time of 18.50s and an average Response Time of 3.00s.`
            },
            "RR": {
                "Good": `Processes P0(A=0, E=10), P1(A=1, E=5), P2(A=1, E=5), P3(A=3, E=1) arrive in the system with time slice of 2.
                    Each process runs for 2s in the order of their arrival, so RR cycles through the processes quickly with an average response time of 2.50s
                    and with and an average Turnaround Time of 14.25s.
                    When it reaches the last process from the list of processes, it starts over, until every process is complete.`,
                "Bad": `Processes P0(A=0, E=5), P1(A=0, E=5), P2(A=0, E=5) arrive in the system with time slice of 1.
                    Because the time slice is small (1s) RR needs to cycle through the processes multiple times and run each of them for 1s.
                    In this case, RR performs worst on turnaround time because it is streching each process as long as it can by running them for 1s until moving to the next process.
                    This leads to an average Turnaround Time of 12.33s and an average Response Time of 1.67s.`
            },
            "MLFQ": {
                "Good": `Processes P0(A=0, E=17), P1(A=1, E=4), P2(A=2, E=2), P3(A=9, E=7) arrive in the system with Time Slice = 3, Priority Boost = 10 and number of Queues = 3.
                    Queues are used to determine the priority of a process, with queue 0 having the highest priority. When P0, P1, P2 and P3 arrive, they start from queue 0. 
                    After they use their time slice, they loose priority and move to queue 1 and so on. To prevent starvation of long running processes(P0), after 10s(Boost Time) all processes regain highest priority and are moved on queue 0.
                    The processes that are running on the same queue are scheduled to run according to RR policy. Using information about how a process behaves over time and changing its priority, leads to an average Turnaround Time of 16.25s and an average Response Time of 1.75s.`,
                "Bad": `Processes P0(A=0, E=15), P1(A=1, E=1), P2(A=1, E=3), P3(A=2, E=2), P4(A=6, E=3), P5(A=8, E=2) arrive in the system with Time Slice = 2, Priority Boost = 50 and number of Queues = 3.
                    Getting the settings right for MLFQ can be challenging. How many queues would be ideal? What about boost and time slice intervals? 
                    A high boost interval can prevent the long running processes from reaching on the top queue and run again if multiple short processes keep arriving in the system. At the same time, short time slice and boost times can add overhead when switching between processes. 
                    Different approaches were developed over time to tackle this problems and having different time slices for different priorities is one of them.
                    But we'll let you explore further in greater detail on your own.`
            }
        };

        return(
            <article className="card card-body sessionDescription">
                <p className="scheduler-info">
                    {descriptions[this.props.sched][this.props.type]}
                </p>
            </article>
        );
    }
}
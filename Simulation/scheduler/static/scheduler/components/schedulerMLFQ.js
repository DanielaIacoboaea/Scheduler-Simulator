import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./scheduleNoTimeSlice";
import RenderProgressBarsMLFQ from "./renderProgressBarsMLFQ";
import deleteEntry from "./deleteProc";


/* 
    The Multi-Level Feedback Queue Scheduler schedules each process 
    based on its priority. Each process starts on the top most queue(0)
    and is moved on a lower priority queue(e.g, from 0 to 1, from 1 to 2) 
    after it uses its quantum.

*/


export default class MLFQ extends React.Component{
    /* 
    Component for Multi-Level Feedback Queue Scheduler 
    Renders a form through which the user can set up
    parameters for the scheduler and submit processes to run.
    Runs the scheduler and mentains state for each running process
    while rendering the progress bar for each process.
    */
    constructor(props){
        super(props);
        this.state = {
            procs: [],
            numQueues: "",
            queues: [],
            count: 0,
            running: false,
            timer: 0,
            currentProcessIdx: 0,
            currentQueueIdx: 0,
            arrivalTime: "",
            executionTime: "",
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            quantum: "",
            quantumTicks: 0,
            boost: "",
            boostTicks: 0,
            quantumDisabled: false,
            boostDisabled: false,
            queuesDisabled: false,
            textarea: ""

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runSchedulerTimeSlice = this.runSchedulerTimeSlice.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
        this.copyCurrentConf = this.copyCurrentConf.bind(this);
    }
    

    /* 
        delete a process from the scheduler
    */
    deleteProc(procId){
        /* 
            if the list of procs is empty, reset 
            - the count to 0
            - numQueues, quantum, boost
            - update the queues
        */
        if(!this.state.running){
            const deleted = deleteEntry(this.state.procs.slice(), procId);
            const updateQueue0 = [];
            const addToQueue = this.state.queues.slice();
            for (let i = 0; i < deleted.updateProcs.length; i++){
                updateQueue0.push(deleted.updateProcs[i]);
            }
            addToQueue[0] = updateQueue0.slice(0);
            if (deleted.updateProcs.length === 0){
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    queues: [],
                    numQueues: "",
                    quantum: "",
                    boost: "",
                    quantumDisabled: false,
                    boostDisabled: false,
                    queuesDisabled: false,
                    count: 0
                }));
            }else{
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    queues: addToQueue
                }));
            }
        }
    }


    /*
        runSchedulerTimeSlice() gets called every second by the scheduler. 
        While the timer hasn't reached the total Execution time:
        - check if it is time to boost all procs to queue 0
        - check if the current running proc used its quantum 
        - decide which queue should run
        - decide which process should run from the selected queue
        - run the process and update its progress within state 
    */
    runSchedulerTimeSlice(){
        const quantumSlice = parseInt(this.state.quantum);
        const boost = parseInt(this.state.boost);
        const numQueues = parseInt(this.state.numQueues);

        /* 
            check timer 
        */
        if(this.state.timer < this.state.totalExecutionTime){

            /*
                Check if a new process from queue 0 is supposed to run now
             */
            let copyProcsOnQueue0 = this.state.queues[0].slice();

            let newArrivalProcIdx = this.state.currentProcessIdx;
            for (let i = 0; i < copyProcsOnQueue0.length; i++){
                if (copyProcsOnQueue0[i].arrivalTime < this.state.timer){
                    continue;
                }
                if(copyProcsOnQueue0[i].timeLeft !== 0){
                    newArrivalProcIdx = i;
                    break;
                }
            }

            /*
                Schedule the proc to run
             */
            if (newArrivalProcIdx !== this.state.currentProcessIdx){
                this.setState(state => ({
                    currentProcessIdx: newArrivalProcIdx,
                    quantumTicks: 0
                }));
            }

            /* 
                if it is time to boost all procs to queue 0
            */
            if (this.state.boostTicks === boost){
                let get_queues = [];
                let get_procs = this.state.procs.slice();
                
                for (let i = 0; i < numQueues; i++){
                    get_queues[i] = [];
                }

                /*
                    If a process ran to completion, leave it on its current queue
                    Otherwise move them to the first queue(0)
                 */
                for (let i = 0; i < get_procs.length; i++){
                    if(get_procs[i].executed < get_procs[i].executionTime){
                        get_procs[i].queueIdx = 0;
                        get_queues[0].push(get_procs[i]);
                    }else{
                        let currentQueue = get_procs[i].queueIdx;
                        get_queues[currentQueue].push(get_procs[i]);
                    }
                }

                for (let i = 0; i < numQueues; i++){
                    get_queues[i].sort((a, b) => {
                        return a.queueIdx - b.queueIdx;
                    });
                }

                /*
                    Update state to reflect where each process is on the queue
                    and reset the number of ticks for the boost time slice
                 */
                this.setState(state => ({
                    procs: get_procs,
                    queues: get_queues,
                    boostTicks: 0,
                    quantumTicks: quantumSlice
                }));

            }

            /*
                check if the current running proc used its quantum 
                if it's the case, move the process on a queue with 
                a lower priority (e.g from 0 - 1, 1-2). If it is on the last queue,
                it remains there until the next boost happens
            */
            if(this.state.quantumTicks === quantumSlice){

                let currentProcIdx = this.state.currentProcessIdx;
                let currentProc = this.state.procs[currentProcIdx];

                if (this.state.procs[currentProcIdx].executed < this.state.procs[currentProcIdx].executionTime){
                    if (this.state.procs[currentProcIdx].queueIdx + 1 < numQueues){
                        const procOnQueue = this.state.procs[currentProcIdx].queueIdx;
                        const updateProcs = this.state.procs.slice();
                        updateProcs[currentProcIdx].queueIdx += 1;

                        const updateQueue = this.state.queues.slice();
                        let idxOfProc = updateQueue[procOnQueue].indexOf(this.state.procs[currentProcIdx]);
                        updateQueue[procOnQueue].splice(idxOfProc, 1);

                        updateQueue[procOnQueue + 1].push(this.state.procs[currentProcIdx]);
                        
                        /*
                            update state to reflect changes in the process and for the queue
                         */
                        this.setState(state => ({
                            procs: updateProcs,
                            queues: updateQueue
                        }));
                    }
                }

                /*
                    Decide which queue should run and which process from that queue should run
                 */
                let newProc;
                let newQueue;
                let getNewProc;
                
                /*
                    Starting with the queue with the highest priority(0) chech 
                    each queue to see if it has any proc available to run
                    get the first process available to run from that queue
                 */
                for (let i = 0; i < this.state.queues.length; i++){
                    for (let j = 0; j < this.state.queues[i].length; j++){
                        if (this.state.queues[i][j].executed < this.state.queues[i][j].executionTime){
                            newQueue = i;
                            getNewProc = this.state.queues[i][j];
                            break;
                        }
                    }
                }

                /*
                    Update state to move to the new queue and start running the new process
                 */
                newProc = this.state.procs.indexOf(getNewProc);
                this.setState(state => ({
                    currentProcessIdx: newProc,
                    currentQueueIdx: newQueue,
                    quantumTicks: 0
                }));
            }

            /*
                Run the selected process and update its internal state
             */
            const schedule = scheduleNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            
            if(schedule){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it
                 */
                if (schedule.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1,
                        timer: state.timer + 1
                    }));
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, signal that another process should run 
                        by setting quantumTicks to quantumSlice
                     */
                    if(schedule.procDone){
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
                            quantumTicks: quantumSlice
                        }));
                    }else{
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
                            quantumTicks: state.quantumTicks + 1
                        }));
                    }
                }
            }

        }else if(this.state.timer === this.state.totalExecutionTime){
            /* 
                if timer reached the end (all the procs ran to completion)
                compute the results for the session (avgTurnaround, avgResponse)
                and reset the parameters related to timer.
            */
            clearInterval(this.schedulerTimerId);
            let avgT = 0;
            let avgR = 0;
            for (let proc in this.state.procs){
                avgT += this.state.procs[proc].turnaround;
                avgR += this.state.procs[proc].response;
            }
            avgT = avgT/this.state.procs.length;
            avgR = avgR/this.state.procs.length;
            /* 
                reset the component's state
            */
            this.setState(state => ({
                running: false,
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                quantumTicks: 0,
                boostTicks: 0,
                numQueues: "",
                quantum: "",
                boost: "",
                quantumDisabled: false,
                boostDisabled: false,
                queuesDisabled: false,
                count: 0,
                currentProcessIdx: 0
            }));
        }
    }


    /*
        Save a process to state in the array with all the processes 
        that the scheduler should run.
        Add the process on the starting queue(0).
     */

    handleSubmit(event){
        event.preventDefault();
        let addProc;
        let count;
        let totalExecution;
        let addToQueue;
        if (this.state.arrivalTime && this.state.executionTime){
            if (this.state.avgTurnaround !== 0){
                addProc = [];
                count = 0;
                totalExecution = 0;
                addToQueue = [];
                for (let i = 0; i < parseInt(this.state.numQueues); i++){
                    addToQueue[i] = [];
                }

            }else{
                addProc = this.state.procs.slice();
                count = this.state.count;
                totalExecution = this.state.totalExecutionTime;
                addToQueue = this.state.queues.slice();
            }

            const newProc =  {
                id: count,
                arrivalTime: parseInt(this.state.arrivalTime),
                executionTime: parseInt(this.state.executionTime),
                turnaround: "",
                response: "",
                color: colors[Math.floor(Math.random() * 31)],
                executed: 0,
                executedPercentage: 0,
                percentage: 0,
                startRunning: 0,
                timeLeft: parseInt(this.state.executionTime),
                queueIdx: 0
            };

            addProc.push(newProc);
            addToQueue[newProc.queueIdx].push(newProc);
            
            this.setState((state) => ({
                procs: addProc,
                count: count + 1,
                queues: addToQueue,
                totalExecutionTime: totalExecution + parseInt(this.state.executionTime),
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                quantumDisabled: true,
                boostDisabled: true,
                queuesDisabled: true
            }));
        }
    }


    /* 
        get the user input for each process and update state:
        - arrival time, execute time, queues, boost, quantum
     */
    handleChange(event){

        if (event.target.name === "numQueues"){
            let initialize_queues = [];
            for (let i = 0; i < parseInt(event.target.value); i++){
                initialize_queues[i] = [];
            }
            this.setState((state) => ({
                [event.target.name]: event.target.value,
                queues: initialize_queues
            }));
        }else{
            this.setState((state) => ({
                [event.target.name]: event.target.value
            }));
        }
    }


    /*
        Sort the list of processes based on when 
        they are supposed to start running
        Sort the first queue(0) because all the processes 
        will start on this queue.
        Run the scheduler every second until the timer reaches the total 
        Execution Time for all process.
    */
    handleClickStart(){
        if (this.state.procs.length !== 0){
            if (!this.state.running){
                this.setState(state => ({
                    running: true
                }));
                this.state.procs.sort((a, b) => {
                    return a.arrivalTime - b.arrivalTime;
                });
                this.state.queues[0].sort((a, b) => {
                    return a.arrivalTime - b.arrivalTime;
                });
                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
            }
        }
    }

    copyCurrentConf(){
        if(this.state.procs.length >= 1){
            
            let procsJSON = `{\nProcs: `;
            for (let proc in this.state.procs){
                let procID = this.state.procs[proc].id;
                let procArrivalTime = this.state.procs[proc].arrivalTime;
                let procExecutionTime = this.state.procs[proc].executionTime;
                procsJSON = `${procsJSON} \n{id: ${procID}, Arrival Time: ${procArrivalTime}, Execute Time: ${procExecutionTime}}`
            }
            procsJSON = `${procsJSON}, \nTime Slice: ${this.state.quantum}, \nPriority Boost: ${this.state.boost}, \nQueues: ${this.state.numQueues}\n}`
            this.setState(state => ({
                textarea: procsJSON
            }));
        }
    }

    render(){
        const processes = this.state.procs.slice();
        return(
            <React.Fragment>
            <div className="container-fluid">
                {/* Render the form through which the user will submit parameters for each process*/}
                <div className="controlBtns">
                    <form onSubmit={this.handleSubmit}>
                    <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add">add_circle</span></button>
                        <label>
                            Arrival time: 
                            <input
                                type="number"
                                name="arrivalTime"
                                id={this.state.count}
                                onChange={this.handleChange}
                                value={this.state.arrivalTime}
                                min="0"
                                max="200"
                                required
                            />
                        </label>
                        <label>
                            Execute time:
                            <input
                                type="number"
                                name="executionTime"
                                onChange={this.handleChange}
                                value={this.state.executionTime}
                                min="1"
                                max="200"
                                required
                            />
                        </label>
                        <label>
                            Time slice:
                            <input
                                type="number"
                                name="quantum"
                                onChange={this.handleChange}
                                value={this.state.quantum}
                                min="1"
                                max="100"
                                disabled={this.state.quantumDisabled}
                                required
                            />
                        </label>
                        <label>
                            Priority Boost:
                            <input
                                type="number"
                                name="boost"
                                onChange={this.handleChange}
                                value={this.state.boost}
                                min="1"
                                max="100"
                                disabled={this.state.boostDisabled}
                                required
                            />
                        </label>
                        <label>
                            Queues:
                            <input
                                type="number"
                                name="numQueues"
                                onChange={this.handleChange}
                                value={this.state.numQueues}
                                min="1"
                                max="10"
                                disabled={this.state.queuesDisabled}
                                required
                            />
                        </label>
                    </form>
                    <span class="material-symbols-outlined icon-play" onClick={this.handleClickStart}>play_circle</span>
                    <div className="results-desc">
                    <button type="button" className="btn btn-secondary" dataToggle="tooltip" dataPlacement="top" title="Turnaround and Response Time">Time
                    </button>
                    </div>
                </div>
                 {/* Render the progress bars for each process*/}
                <RenderProgressBarsMLFQ
                    procs={processes.sort((a, b) => a.id - b.id)}
                    queues={this.state.queues}
                    deleteBar={this.deleteProc}
                    avgTurnaround={this.state.avgTurnaround}
                    avgResponse={this.state.avgResponse}
                    alertColor={this.props.alertColor}
                />
            </div>
            <div>
                <div className="wrapper-copy">
                    <button type="button" className="btn btn-light btn-lg" id="copy" onClick={this.copyCurrentConf}>Copy Setup</button>
                </div>
                <div>
                    <textarea id="paste-textarea" value={this.state.textarea}>
                    </textarea>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
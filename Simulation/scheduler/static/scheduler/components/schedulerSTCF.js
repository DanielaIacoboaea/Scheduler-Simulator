import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./scheduleNoTimeSlice";
import deleteEntry from "./deleteProc";


/*
    Shortest to Completion First Scheduler (STCF) checks every time 
    when a new process enters the system all the procs that started 
    running before the new proc (included)
    and schedules the process that has the least time left from execution.
 */

export default class STCF extends React.Component{
     /* 
     Shortest to Completion First Scheduler (STCF) 
    Renders a form through which the user can set up
    parameters for the scheduler and submit processes to run.
    Runs the scheduler and mentains state for each running process
    while rendering the progress bar for each process.
    */
    constructor(props){
        super(props);
        this.state = {
            procs: [],
            count: 0,
            running: false,
            timer: 0,
            currentProcessIdx: 0,
            arrivalTime: "",
            executionTime: "",
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            textarea: ""

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runSchedulerInterrupt = this.runSchedulerInterrupt.bind(this);
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
            if the list of procs is empty, reset the count to 0
        */
        if(!this.state.running){
            const deleted = deleteEntry(this.state.procs.slice(), procId);
            if (deleted.updateProcs.length === 0){
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    count: 0
                }));
            }else{
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime
                }));
            }
        }
    }

    /*
        runScheduler() gets called every second by the scheduler. 
        While the timer hasn't reached the total Execution time:
        - decide which process should run from the sorted list of processes
        - when a new process enters the system, sort all procs before it based on the time left from execution
        - run the process and update its progress within state 
        - if the process is done, select the next proc to run from the list
    */
    runSchedulerInterrupt(){
        /* 
            check timer 
        */
        if(this.state.timer < this.state.totalExecutionTime){

            /*
                Check if a new process entered the system
                and it should run at this timer
             */
            let copyProcs = this.state.procs.slice();

            let newArrivalProcIdx = this.state.currentProcessIdx;
            for (let i = 0; i < copyProcs.length; i++){
                if (copyProcs[i].arrivalTime < this.state.timer){
                    continue;
                }
                if(copyProcs[i].timeLeft !== 0){
                    newArrivalProcIdx = i;
                    break;
                }
            }

            /*
                If a process different than the current proc arrived,
                take this process as reference
             */
            if (newArrivalProcIdx !== this.state.currentProcessIdx){
                this.setState(state => ({
                    currentProcessIdx: newArrivalProcIdx
                }));
            }

            /*
                Check all procs with arrival time before the selected process 
                and select the one with the smallest execution time left
             */
            let sortProcsTimeLeft = copyProcs.slice(0, this.state.currentProcessIdx + 1).sort((a, b) => a.timeLeft - b.timeLeft);
            let unsortedProcs = copyProcs.slice(this.state.currentProcessIdx + 1, copyProcs.length);
            let newProcs = sortProcsTimeLeft.concat(unsortedProcs);
            let newProcessIdx;
            for (let i = 0; i < newProcs.length; i++){
                if(newProcs[i].timeLeft !== 0){
                    newProcessIdx = i;
                    break;
                }
            }
            
             /*
                Run the selected process and update its internal state
             */
            const schedule = scheduleNoTimeSlice(this.state.timer, newProcs, newProcessIdx);
            
            if(schedule){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it and increase the total execution Time 
                 */
                if (schedule.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1,
                        timer: state.timer + 1
                    }));
                }else{
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, select the next process from the list
                     */
                    if(schedule.procDone){
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            currentProcessIdx: newProcessIdx + 1
                        }));
                    }else{
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            currentProcessIdx: newProcessIdx
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
                count: 0,
                currentProcessIdx: 0
            }));
        }
    }

    /*
        Save a process to state in the array with all the processes 
        that the scheduler should run.
     */
    handleSubmit(event){
        event.preventDefault();
         /* 
            check if a pervious session is over 
            if it's the case, clear data for the previous session:
             - procs
             - totalExecutionTime
             - count of procs
        */
        let addProc;
        let count;
        let totalExecution;
        if (this.state.arrivalTime && this.state.executionTime){
            if (this.state.avgTurnaround !== 0){
                addProc = [];
                count = 0;
                totalExecution = 0;
            }else{
                addProc = this.state.procs.slice();
                count = this.state.count;
                totalExecution = this.state.totalExecutionTime;
            }
            addProc.push(
                {
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
                    timeLeft: parseInt(this.state.executionTime)
                }
            )
            this.setState((state) => ({
                procs: addProc,
                count: count + 1,
                totalExecutionTime: totalExecution + parseInt(this.state.executionTime),
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: ""
            }));
        }
    }

    /* 
        get the user input for each process and update state:
        - arrival time, execute time
     */
    handleChange(event){
        this.setState((state) => ({
            [event.target.name]: event.target.value
        }));
    }

     /*
        Sort the list of processes based on when 
        they are supposed to start running and execution time
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
                     if(a.arrivalTime === b.arrivalTime){
                        return a.executionTime - b.executionTime;
                    }
                    return a.arrivalTime - b.arrivalTime;
                });
                this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000);
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
            procsJSON = `${procsJSON}\n}`
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
                    </form>
                    <span class="material-symbols-outlined icon-play" onClick={this.handleClickStart}>play_circle</span>
                    <div className="results-desc">
                    <button type="button" className="btn btn-secondary" dataToggle="tooltip" dataPlacement="top" title="Turnaround and Response Time">Time
                    </button>
                    </div>
                </div>
                {/* Render the progress bars for each process*/}
                <RenderProgressBars 
                    procs={processes.sort((a, b) => a.id - b.id)}
                    deleteBar={this.deleteProc}
                    avgTurnaround={this.state.avgTurnaround}
                    avgResponse={this.state.avgResponse}
                    alertColor={this.props.alertColor}
                />
            </div>
            <div className="wrapper-copy">
                <div>
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
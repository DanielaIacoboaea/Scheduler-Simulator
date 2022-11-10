import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./scheduleNoTimeSlice";
import deleteEntry from "./deleteProc";
import addProcess from "./addDefaultProc";


/*
    Round-Robin (RR) Scheduler schedules each process to run 
    for a time slice. Once that quantum(time slice) is up, it moves 
    to the next process in the list. If it reaches the end of the list of procs, 
    it returns at the beginning of the list and schedules the remaining ones.
 */

export default class RR extends React.Component{
    /*
        Component that renders the Round Robin Scheduler(RR)
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
            quantum: "",
            quantumTicks: 0,
            disabled: false,
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
        When the component is mounted, check if we have prefilled settings to 
        display and start running a session.
        Prefilled settings means: 
        - processes with arrival and execution time 
        - slice time - if available 
        - boost time - if available 
        - queues - if available
    */

    componentDidMount(){
        /*
            Check if we received default processes and settings 
            */
        if(this.props.prefilled){
            let procs_list = this.props.prefilled;

            /*
                Create an array that will hold all procs 
                */
            let addProc = [];
            let count = 0;
            let totalExecution = 0;

            /*
                Add each default proc to the array of procs
                */
            for (let i = 0; i < procs_list.length; i++){
                let newAddproc = addProcess(addProc, count, procs_list[i].arrivalTime, procs_list[i].executeTime);
                addProc.length = 0;
                addProc.push(...newAddproc);
                count++;
                totalExecution += parseInt(procs_list[i].executeTime);
            }

            /*
                Sort the array of procs based on the type of scheduler
                */
            addProc.sort((a, b) => {
                return a.arrivalTime - b.arrivalTime;
            });

            /* 
                Update state with all default settings 
                and start sunning the scheduler with these settings
            */
            this.setState((state) => ({
                procs: addProc,
                count: count,
                totalExecutionTime: totalExecution,
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                running: true,
                quantum: parseInt(procs_list[0].quantum),
                disabled: true
            }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000));

        }
    }

    /*
        Clear state and timer when the component unmounts 
    */
    componentWillUnmount(){
        this.setState(state => ({
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
            quantum: "",
            quantumTicks: 0,
            disabled: false,
            textarea: ""
        }));
        clearInterval(this.state.schedulerTimerId);
    }

    /* 
        delete a process from the scheduler
    */
    deleteProc(procId){
        if(!this.state.running){
            /* 
                if the list of procs is empty, reset:
                 - the count to 0
                 - quantum to empty 
                 - make input editable

            */
            const deleted = deleteEntry(this.state.procs.slice(), procId);
            if (deleted.updateProcs.length === 0){
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    quantum: "",
                    disabled: false,
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
        - check if the current running used its time slice 
        - if it did, schedule the next process
    */
    runSchedulerTimeSlice(){
        const quantumSlice = parseInt(this.state.quantum);
       
        /* 
            check timer 
        */
        if(this.state.timer < this.state.totalExecutionTime){
            /*
                Check if the current running proc used its time slice
             */
            if(this.state.quantumTicks === quantumSlice){
                let newIdx;
                /*
                    Select the next proc from the list
                 */
                for (let i = this.state.currentProcessIdx + 1; i < this.state.procs.length; i++){
                    if(this.state.procs[i].executed < this.state.procs[i].executionTime){
                        newIdx = i;
                        break;
                    }
                }

                /*
                    If no proc after the current one has time left from execution 
                    Start searching a new proc from the beginning of the list
                 */
                if(newIdx === undefined){
                    newIdx = 0;
                    while(this.state.procs[newIdx].executed === this.state.procs[newIdx].executionTime){
                        newIdx++;
                    }
                }
                /*
                    Switch to the new found proc
                 */
                if (this.state.currentProcessIdx !== newIdx){
                    this.setState(state => ({
                        currentProcessIdx: newIdx,
                        quantumTicks: 0
                    }));
                }else{
                    this.setState(state => ({
                        quantumTicks: 0
                    }));
                }
            }

            /*
                Run the selected process and update its internal state
             */
            const schedule = scheduleNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            
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
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, select the next process from the list
                     */
                    if(schedule.procDone){
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            quantumTicks: quantumSlice
                        }));
                    }else{
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
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
                Initialize the scheduler's state
             */
            this.setState(state => ({
                running: false,
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                quantumTicks: 0,
                quantum: "",
                disabled: false,
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

            let newAddproc = addProcess(addProc, count, this.state.arrivalTime, this.state.executionTime);
            addProc.length = 0;
            addProc.push(...newAddproc);

            this.setState((state) => ({
                procs: addProc,
                count: count + 1,
                totalExecutionTime: totalExecution + parseInt(this.state.executionTime),
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                disabled: true
            }));
        }
    }

    /* 
        get the user input for each process and update state:
        - arrival time, execute time and quantum(time slice)
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
            procsJSON = `${procsJSON}, \nTime Slice: ${this.state.quantum}\n}`
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
                                max="20"
                                disabled={this.state.disabled}
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
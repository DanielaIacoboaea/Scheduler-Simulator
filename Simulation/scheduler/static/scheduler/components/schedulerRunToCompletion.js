import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./components/scheduleNoTimeSlice";
import deleteEntry from "./deleteProc";

/*
    The First-In First-Out (FIFO) and Shortest Job First (SJF) Schedulers
    schedule a process to be run to completion. 
    FIFO runs every process based on arrival time.
    SJF compares the processes that arrive at the same time and schedules the shortest 
    process first (Execute Time). 
 */


export default class SchedulerFIFOandSJF extends React.Component{
    /*
        Component for First-In First-Out (FIFO) and Shortest Job First (SJF) Schedulers.
    Renders a form through which the user can set up
    parameters for the scheduler and submit processes to run.
    Runs the scheduler and mentains state for each running process
    while rendering the progress bar for each process.
    The list of processes to run is sorted different based on scheduler.
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
            avgResponse: 0
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runScheduler = this.runScheduler.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
    }
    

    /* 
        delete a process from the scheduler
    */
    deleteProc(procId){
        if(!this.state.running){
            const deleted = deleteEntry(this.state.procs.slice(), procId);
            this.setState(state => ({
                procs: deleted.updateProcs,
                totalExecutionTime: deleted.updateTotalExecTime
            }));
        }
    }


     /*
        runScheduler() gets called every second by the scheduler. 
        While the timer hasn't reached the total Execution time:
        - decide which process should run from the sorted list of processes
        - run the process and update its progress within state 
        - if the process is done, select the next proc to run from the list
    */
    runScheduler(){
        /* 
            check timer 
        */
        if(this.state.timer < this.state.totalExecutionTime){
            /*
                Run the selected process and update its internal state
             */
            const scheduler = scheduleNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            if (scheduler){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it and increase the total execution Time 
                 */
                if (scheduler.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1,
                        timer: state.timer + 1
                    }));
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, select the next process from the list
                     */
                    if (scheduler.procDone){
                        this.setState(state => ({
                            procs: scheduler.updateProcs,
                            currentProcessIdx: state.currentProcessIdx + 1,
                            timer: state.timer + 1
                        }));
                    }else if (!scheduler.procDone){
                        this.setState(state => ({
                            procs: scheduler.updateProcs,
                            timer: state.timer + 1
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
            this.setState(state => ({
                running: false,
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR
            }));
        }
    }

     /*
        Save a process to state in the array with all the processes 
        that the scheduler should run.
     */
    handleSubmit(event){
        event.preventDefault();
        if (this.state.arrivalTime && this.state.executionTime){
            const addProc = this.state.procs.slice();
            addProc.push(
                {
                    id: this.state.count,
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
            /*
                Initialize the scheduler's state
             */
            this.setState((state) => ({
                procs: addProc,
                count: state.count + 1,
                totalExecutionTime: state.totalExecutionTime + parseInt(this.state.executionTime),
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
        they are supposed to start running
        FIFO:
            - sort the procs by arrival time 
        SJF:
            - sort the procs by arrival time and execution time
        Run the scheduler every second until the timer reaches the total 
        Execution Time for all process.
    */
    handleClickStart(){
        if (this.state.procs.length !== 0){
            if (!this.state.running){
                this.setState(state => ({
                    running: true
                }));
                if (this.props.sortBy === "FIFO"){
                    this.state.procs.sort((a, b) => a.arrivalTime - b.arrivalTime);
                }else if (this.props.sortBy === "SJF"){
                    this.state.procs.sort((a, b) => {
                        if(a.arrivalTime === b.arrivalTime){
                            return a.executionTime - b.executionTime;
                        }
                        return a.arrivalTime - b.arrivalTime;
                    });
                }
                this.schedulerTimerId = setInterval(() => this.runScheduler(), 1000);
            }
        }
    }
    render(){
        const processes = this.state.procs.slice();
        return(
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
        );
    }
}
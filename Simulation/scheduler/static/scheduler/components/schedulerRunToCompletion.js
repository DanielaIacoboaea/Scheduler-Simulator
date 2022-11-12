import RenderProgressBars from "./components/renderProgressBars";
import runProcess from "./components/runProcess";
import deleteEntry from "./deleteProc";
import addProcess from "./addDefaultProc";
import copyConfiguration from "./copyConfiguration";


/*
    The First-In First-Out (FIFO) and Shortest Job First (SJF) Schedulers
    schedule a process to be run to completion. 
    FIFO schedules a process to run based on arrival time.
    SJF compares the processes that arrive at the same time and schedules the shortest 
    process first (Execute Time). 
 */


export default class SchedulerFIFOandSJF extends React.Component{
    /*
        Component for First-In First-Out (FIFO) and Shortest Job First (SJF) Schedulers.
    Renders a form through which the user can set up
    parameters for the scheduler and submit processes to run.
    After it schedules a process, calls runProcess function to run it.
    Mentains state for each running process
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
            avgResponse: 0,
            textarea: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runScheduler = this.runScheduler.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
        this.copyCurrentConf = this.copyCurrentConf.bind(this);
    }
    

    /* 
        When the component is mounted, check if we have prefilled settings to 
        display and start running a session.
        Prefilled settings: 
        - processes with arrival and execution time
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
                Can't use a for loop to update state in React at each iteration 
                because react updates state asynchronous and uses batch updating. 
                As a consequence, for a for loop, only the last iteration 
                is in fact reflected in the state.
                This is why we can't just call handleSubmit and  handleClickStart 
                to push all the processes at once and run the scheduler.
                So we reuse parts of handleSubmit and handleClickStart to achieve this.
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
            if (this.props.sortBy === "FIFO"){
                addProc.sort((a, b) => a.arrivalTime - b.arrivalTime);
            }else if (this.props.sortBy === "SJF"){
                addProc.sort((a, b) => {
                    if(a.arrivalTime === b.arrivalTime){
                        return a.executionTime - b.executionTime;
                    }
                    return a.arrivalTime - b.arrivalTime;
                });
            }

            /* 
                Update state with all default settings 
                and start running the scheduler with these settings
            */
            this.setState((state) => ({
                procs: addProc,
                count: count,
                totalExecutionTime: totalExecution,
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                running: true
            }), () => this.schedulerTimerId = setInterval(() => this.runScheduler(), 1000));

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
            textarea: ""
        }));
        clearInterval(this.state.schedulerTimerId);
    }

    /*
        Because this component is shared between 2 schedulers (FIFO and SJF),
        the only difference is in how we sort the procs, the state is maintained 
        between the button clicks (change from one scheduler to another).
        So if the Scheduler name changes(e.g from FIFO to SJF) we need to clear the 
        state first.
    */
    componentDidUpdate(prevProps){
        if(prevProps.sortBy !== this.props.sortBy){
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
                textarea: ""
            }));
            clearInterval(this.state.schedulerTimerId);
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
        Save a process to state in the array with all the processes 
        that the scheduler should schedule to run.
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
            
            /*
                Initialize the scheduler's state
            */
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
        delete a process from the scheduler
    */
    deleteProc(procId){
        if(!this.state.running){
            const deleted = deleteEntry(this.state.procs.slice(), procId);
            /* 
                if the list of procs is empty, reset the count and statistics 
            */
            if (deleted.updateProcs.length === 0){
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    count: 0,
                    avgTurnaround: 0,
                    avgResponse: 0
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
        Sort the list of processes based on when 
        they are supposed to start running
        FIFO:
            - sort the procs by arrival time 
        SJF:
            - sort the procs by arrival time and execution time
        Schedule a process to run every second until the timer reaches the total 
        Execution Time for all processes.
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
            const scheduler = runProcess(this.state.timer, this.state.procs, this.state.currentProcessIdx);
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
            /* 
                reset the component's state
            */
            this.setState(state => ({
                running: false,
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                currentProcessIdx: 0,
                count: 0
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf(){
        const configuration = copyConfiguration(this.state.procs, {})

        this.setState(state => ({
            textarea: configuration
        }));
    }


    render(){
        const processes = this.state.procs.slice();
        return(
            <React.Fragment>
            <div className="container-fluid">
                {/* Render the form through which the user will submit parameters for each process*/}
                <div className="controlBtns">
                    <span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>play_circle</span>
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
                                autocomplete="off"
                                required
                            />
                        </label>
                        <label>
                            Execute time:
                            <input
                                type="number"
                                name="executionTime"
                                id="inputExecutionTime"
                                onChange={this.handleChange}
                                value={this.state.executionTime}
                                autocomplete="off"
                                min="1"
                                max="200"
                                required
                            />
                        </label>
                    </form>
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
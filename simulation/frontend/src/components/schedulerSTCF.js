import React from "react";
import RenderProgressBars from "./renderProgressBars";
import runProcess from "./runProcess";
import deleteEntry from "./deleteProc";
import addProcess from "./addDefaultProc";
import copyConfiguration from "./copyConfiguration";
import getAverage from "./computeAverage";
import sortProcs from "./sortListOfProcs";


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
    After it schedules a process, calls runProcess function to run it.
    Mentains state for each running process
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
            arrivalDisabled: false,
            executionDisabled: false,
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            textarea: "",
            pasteSetup: "",
            pasteSlice: "",
            pasteSliceDisabled: true,
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runSchedulerInterrupt = this.runSchedulerInterrupt.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
        this.copyCurrentConf = this.copyCurrentConf.bind(this);
        this.pasteCurrentConf = this.pasteCurrentConf.bind(this);

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
        
        //set up the tooltips for input labels 
        this.props.activateTooltip();

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
                addProc.splice(0, addProc.length, ...newAddproc);

                count++;
                totalExecution += parseInt(procs_list[i].executeTime);
            }

            /*
                Sort the array of procs based on the type of scheduler
            */

            let sortAddProc = sortProcs(addProc, 2, {"1": "arrivalTime", "2": "executionTime"});
            addProc.splice(0, addProc.length, ...sortAddProc);

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
                arrivalDisabled: true,
                executionDisabled: true
            }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000));

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
            arrivalDisabled: false,
            executionDisabled: false,
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            textarea: "",
            pasteSetup: "",
            pasteSlice: "",
            pasteSliceDisabled: true,
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true
        }));
        clearInterval(this.schedulerTimerId);
    }
    
    /* 
        get the user input for each process and update state:
        - arrival time, execute time
    */
    handleChange(event){

        /*
            Check if the event is related to additional inputs 
            for general settings in the paste area of a copied setup.
            Based on the new scheduler selected by the user, that we're going
            to switch to (this.state.pasteSetup);
            Aditional inputs that this scheduler does not have will be:
            - Time Slice 
            - Boost Time
            - Queues
            Switching to MLFQ means checking if we have all 3 additional general 
            settings inputs.
        */
        if(event.target.name === "pasteSlice"){

            /*
                If we have all the inputs for the RR scheduler, 
                start a new session
            */
            if (this.state.pasteSetup === "RR" && this.state.textarea){
                this.setState((state) => ({
                    [event.target.name]: event.target.value
                }), () => this.props.pastePrefill("STCF", this.state.pasteSetup, this.state.textarea, this.state.pasteSlice, "", ""));

            }else if(this.state.pasteSetup === "MLFQ" && this.state.textarea){
                /*
                    If we have all the inputs for the MLFQ scheduler, 
                    start a new session.
                    Otherwise, just update state with this input.
                */
                if(this.state.pasteQueues && this.state.pasteBoost){
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }), () => this.props.pastePrefill("STCF", this.state.pasteSetup, this.state.textarea, this.state.pasteSlice, this.state.pasteQueues, this.state.pasteBoost));
                }else{
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }));
                }
            }
        }else if (event.target.name === "pasteQueues"){
            /*
                If we have all the inputs for the MLFQ scheduler, 
                start a new session.
                Otherwise, just update state with this input.
            */
            if(this.state.pasteSetup === "MLFQ" && this.state.textarea){

                if(this.state.pasteSlice && this.state.pasteBoost){
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }), () => this.props.pastePrefill("STCF", this.state.pasteSetup, this.state.textarea, this.state.pasteSlice, this.state.pasteQueues, this.state.pasteBoost));
                }else{
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }));
                }
            }
        }else if (event.target.name === "pasteBoost"){
            /*
                If we have all the inputs for the MLFQ scheduler, 
                start a new session.
                Otherwise, just update state with this input.
            */
            if(this.state.pasteSetup === "MLFQ" && this.state.textarea){

                if(this.state.pasteSlice && this.state.pasteQueues){
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }), () => this.props.pastePrefill("STCF", this.state.pasteSetup, this.state.textarea, this.state.pasteSlice, this.state.pasteQueues, this.state.pasteBoost));
                }else{
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }));
                }
            }
        }else{
            /*
                Otherwise, the input is not related to the copy-paste functionality,
                just update the state.

            */
            this.setState((state) => ({
                [event.target.name]: event.target.value
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
                - statistics
        */
        let addProc;
        let count;
        let totalExecution;
        if (this.state.arrivalTime && this.state.executionTime){
            this.props.updateSubtitle();

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
            addProc.splice(0, addProc.length, ...newAddproc);

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
        /* 
            if the list of procs is empty, reset the count to 0
            reset statistics to 0 as well
        */
        if(!this.state.running && this.state.timer === 0){
            this.props.updateSubtitle();

            const deleted = deleteEntry(this.state.procs.slice(), procId);

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
        they are supposed to start running and execution time
        Schedule a process to run every every second until the timer reaches the total 
        Execution Time for all process.
    */
    handleClickStart(){
        if (this.state.procs.length !== 0){

            if (!this.state.running && this.state.totalExecutionTime !== 0){
                this.setState(state => ({
                    running: true,
                    arrivalDisabled: true,
                    executionDisabled: true
                }));

                let sortProcList = sortProcs(this.state.procs, 2, {"1": "arrivalTime", "2": "executionTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000);
            }else{
                clearInterval(this.schedulerTimerId);
                this.setState(state => ({
                    running: false
                }));
            }
        }
    }


    /*
        runScheduler() gets called every second by the scheduler. 
        While the timer hasn't reached the total Execution time:
        - decide which process should run from the sorted list of processes
        - when a new process enters the system, sort all procs before it based on the time left from execution
        - call runProcess function and update its progress within state 
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

                /*
                    Make sure that procs that arrive at the same time get a chance to run 
                 */
                if (i+1 < copyProcs.length){

                    if (copyProcs[i].arrivalTime === this.state.timer && copyProcs[i+1].arrivalTime !== this.state.timer){
                        newArrivalProcIdx = i;
                        break;
                    }
                }else{
                    if (copyProcs[i].arrivalTime === this.state.timer){
                        newArrivalProcIdx = i;
                        break;
                    }
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
            const schedule = runProcess(this.state.timer, newProcs, newProcessIdx);
            
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

            let avgT = getAverage(this.state.procs, "turnaround");
            let avgR = getAverage(this.state.procs, "response");

            /* 
                reset the component's state
            */
            this.setState(state => ({
                running: false,
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                count: 0,
                currentProcessIdx: 0,
                arrivalDisabled: false,
                executionDisabled: false,
                totalExecutionTime: 0
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

    /*
        Paste the current copied scheduler setup.
        The user can paste the current setup as prefilled settings for 
        another scheduler, as well as for the current scheduler.
        This action will start a new session for the selected scheduler.
    */
    pasteCurrentConf(event){
        /*
            Check if we have a setup copied in the textarea.
        */
        let errorMsg = `{"Oops":"No processes available to copy. Start by adding at least one."}`;

        if(this.state.textarea && this.state.textarea !== errorMsg){
            /*
                If the new scheduler will be RR or MLFQ, enable extra inputs for 
                their general settings that the current scheduler does not have.
            */
            if(event.target.value === "RR"){

                this.setState((state) => ({
                    pasteSetup: event.target.value,
                    pasteSliceDisabled: false
                }));

            }else if(event.target.value === "MLFQ"){

                this.setState((state) => ({
                    pasteSetup: event.target.value,
                    pasteSliceDisabled: false,
                    pasteBoostDisabled: false,
                    pasteQueuesDisabled: false
                }));
            
            /*
                Otherwise, start running the selected scheduler with a new session of 
                prefilled copied settings.
            */
            }else{

                this.setState((state) => ({
                    pasteSetup: event.target.value
                }), () => this.props.pastePrefill("STCF", this.state.pasteSetup, this.state.textarea, this.state.pasteSlice, this.state.pasteQueues, this.state.pasteBoost));
            }
        }
    }

    render(){
        const processes = this.state.procs.slice();
        return(
            <React.Fragment>
            <div className="container-fluid">
                {/* Render the form through which the user will submit parameters for each process*/}
                <div className="controlBtns">
                    <span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>play_pause</span>
                    <form onSubmit={this.handleSubmit}>
                    <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add">add_circle</span></button>
                        <label data-toggle="tooltip" data-placement="top" title="When a process enters into the system.">
                            Arrival time: 
                            <input
                                type="number"
                                name="arrivalTime"
                                id={this.state.count}
                                onChange={this.handleChange}
                                value={this.state.arrivalTime}
                                disabled={this.state.arrivalDisabled}
                                min="0"
                                max="200"
                                autocomplete="off"
                                required
                            />
                        </label>
                        <label data-toggle="tooltip" data-placement="top" title="How long the process will run.">
                            Execute time:
                            <input 
                                type="number"
                                name="executionTime"
                                onChange={this.handleChange}
                                value={this.state.executionTime}
                                disabled={this.state.executionDisabled}
                                min="1"
                                max="200"
                                autocomplete="off"
                                required
                            />
                        </label>
                    </form>
                    <div className="results-desc">
                    <button id="icon-time" type="button" className="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Turnaround Time: T(arrival) - T(completion); Response Time: T(arrival) - T(First Run)">Time
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
                    <button type="button" className="btn btn-light btn-lg" id="copy" onClick={this.copyCurrentConf} data-toggle="tooltip" data-placement="top" title="Copy the current scheduler configuration.">
                        Copy Setup
                    </button>
                <div>
                    <textarea id="paste-textarea" value={this.state.textarea}>
                    </textarea>
                </div>
                <div id="paste-wrapper">
                    <label data-toggle="tooltip" data-placement="top" title="When switching to other scheduler, general settings from this one, that don't apply, will be removed. Additional settings may be required.">
                        Choose a scheduler to paste your setup:
                        <br />
                    </label>
                    <select id="paste-setup" value={this.state.pasteSetup} onChange={this.pasteCurrentConf}>
                        <option defaultValue disabled></option>
                        <option name="FIFO">FIFO</option>
                        <option name="SJF">SJF</option>
                        <option name="STCF">STCF</option>
                        <option name="RR">RR</option>
                        <option name="MLFQ">MLFQ</option>
                    </select>
                    <div>
                        <label data-toggle="tooltip" data-placement="top" title="Amount of time a process runs when scheduled.">
                            Time slice:
                        </label>
                        <input
                            type="number"
                            name="pasteSlice"
                            min="1"
                            max="20"
                            onChange={this.handleChange}
                            value={this.state.pasteSlice}
                            disabled={this.state.pasteSliceDisabled}
                            autocomplete="off"
                            required
                        />
                    </div>
                    <div>
                    
                        <label data-toggle="tooltip" data-placement="top" title="Amount of time after which all processes move to the highest priority (queue 0).">
                            Priority Boost:
                        </label>
                        <input
                            type="number"
                            name="pasteBoost"
                            min="1"
                            max="100"
                            onChange={this.handleChange}
                            value={this.state.pasteBoost}
                            disabled={this.state.pasteBoostDisabled}
                            autocomplete="off"
                            required
                        />
                    </div>
                    <div>
                        <label data-toggle="tooltip" data-placement="top" title="Number of priority queues. Each process moves to lower priority after its time slice is over.">
                            Queues:
                        </label>
                        <input
                            type="number"
                            name="pasteQueues"
                            min="1"
                            max="10"
                            onChange={this.handleChange}
                            value={this.state.pasteQueues}
                            disabled={this.state.pasteQueuesDisabled}
                            autocomplete="off"
                            required
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
import React from "react";
import RenderProgressBars from "./renderProgressBars";
import runProcess from "./runProcess";
import deleteEntry from "./deleteProc";
import addProcess from "./addDefaultProc";
import copyConfiguration from "./copyConfiguration";
import getAverage from "./computeAverage";
import sortProcs from "./sortListOfProcs";
import Input from "./inputNumber";


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
            arrivalDisabled: false,
            executionDisabled: false,
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            quantum: "",
            quantumTicks: 0,
            disabled: false,
            textarea: "",
            pasteSetup: "",
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runSchedulerTimeSlice = this.runSchedulerTimeSlice.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
        this.copyCurrentConf = this.copyCurrentConf.bind(this);
        this.pasteCurrentConf = this.pasteCurrentConf.bind(this);
    }
    

    /* 
        When the component is mounted, check if we have prefilled settings to 
        display and start running a session.
        Prefilled settings means: 
        - processes with arrival and execution time 
        - slice time
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

            let sortAddProc = sortProcs(addProc, 1, {"1": "arrivalTime"});
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
                quantum: parseInt(procs_list[0].quantum),
                disabled: true,
                arrivalDisabled: true,
                executionDisabled: true
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
            arrivalDisabled: false,
            executionDisabled: false,
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            quantum: "",
            quantumTicks: 0,
            disabled: false,
            textarea: "",
            pasteSetup: "",
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true
        }));
        clearInterval(this.schedulerTimerId);
    }

    /* 
        get the user input for each process and update state:
        - arrival time, execute time and quantum(time slice)
     */
    handleChange(event){

        /*
            Aditional inputs that this scheduler, when changing to MLFQ, does not have will be:
            - Boost Time
            - Queues
            When switching to FIFO, SJF or STCF, the time slice from RR will be removed.
        */
        if (event.target.name === "pasteQueues"){

            /*
                If we have all the inputs for the MLFQ scheduler, 
                start a new session.
                Otherwise, just update state with this input.
            */
            if(this.state.pasteSetup === "MLFQ" && this.state.textarea){

                if(this.state.pasteBoost){
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }), () => this.props.pastePrefill("RR", this.state.pasteSetup, this.state.textarea, "", this.state.pasteQueues, this.state.pasteBoost));
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

                if(this.state.pasteQueues){
                    this.setState((state) => ({
                        [event.target.name]: event.target.value
                    }), () => this.props.pastePrefill("RR", this.state.pasteSetup, this.state.textarea, "", this.state.pasteQueues, this.state.pasteBoost));
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
                executionTime: "",
                disabled: true
            }));
        }
    }

    /* 
        delete a process from the scheduler
    */
    deleteProc(procId){
        if(!this.state.running && this.state.timer === 0){
            /* 
                if the list of procs is empty, reset:
                 - the count to 0
                 - quantum to empty 
                 - make input editable

            */
            this.props.updateSubtitle();

            const deleted = deleteEntry(this.state.procs.slice(), procId);
            if (deleted.updateProcs.length === 0){

                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    quantum: "",
                    disabled: false,
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
        Run the scheduler every second until the timer reaches the total 
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

                let sortProcList = sortProcs(this.state.procs, 1, {"1": "arrivalTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
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
            const schedule = runProcess(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            
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

            let avgT = getAverage(this.state.procs, "turnaround");
            let avgR = getAverage(this.state.procs, "response");

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
                arrivalDisabled: false,
                executionDisabled: false,
                disabled: false,
                count: 0,
                currentProcessIdx: 0,
                totalExecutionTime: 0
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf(){

        const general_settings = {"Slice": this.state.quantum};
        const configuration = copyConfiguration(this.state.procs, general_settings)

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
                If the new scheduler will be MLFQ, enable extra inputs for 
                their general settings that the current scheduler does not have.
            */
            if(event.target.value === "MLFQ"){

                this.setState((state) => ({
                    pasteSetup: event.target.value,
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
                }), () => this.props.pastePrefill("RR", this.state.pasteSetup, this.state.textarea, "", this.state.pasteQueues, this.state.pasteBoost));
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
                        <Input title="When a process enters into the system."
                                label="Arrival time: "
                                name="arrivalTime"
                                id={this.state.count}
                                handleChange={this.handleChange}
                                value={this.state.arrivalTime}
                                disabled={this.state.arrivalDisabled}
                                min="0"
                                max="200"
                        />
                        <Input title="How long the process will run."
                                label="Execute time: "
                                name="executionTime"
                                id="inputExecutionTime"
                                handleChange={this.handleChange}
                                value={this.state.executionTime}
                                disabled={this.state.executionDisabled}
                                min="1"
                                max="200"
                        />
                        <Input title="Amount of time a process runs when scheduled."
                                label="Time slice: "
                                name="quantum"
                                id="quantum"
                                handleChange={this.handleChange}
                                value={this.state.quantum}
                                disabled={this.state.disabled}
                                min="1"
                                max="50"
                        />
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
                        <Input title="Amount of time after which all processes move to the highest priority (queue 0)."
                                label="Priority Boost: "
                                name="pasteBoost"
                                id="pasteBoost"
                                handleChange={this.handleChange}
                                value={this.state.pasteBoost}
                                disabled={this.state.pasteBoostDisabled}
                                min="1"
                                max="100"
                        />
                    </div>
                    <div>
                        <Input title="Number of priority queues. Each process moves to lower priority after its time slice is over."
                                label="Queues: "
                                name="pasteQueues"
                                id="pasteQueues"
                                handleChange={this.handleChange}
                                value={this.state.pasteQueues}
                                disabled={this.state.pasteQueuesDisabled}
                                min="1"
                                max="10"
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
import React from "react";
import RenderProgressBars from "./renderProgressBars";
import runProcess from "./runProcess";
import deleteEntry from "./deleteProc";
import addProcess from "./addDefaultProc";
import copyConfiguration from "./copyConfiguration";
import getAverage from "./computeAverage";
import sortProcs from "./sortListOfProcs";
import Input from "./inputNumber";
import TimeTooltip from "./timeTooltip";


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
            playIcon: "play_circle",
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
            pasteQueuesDisabled: true,
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745",
            colorClearIcon: "#dec8c8",
            clear: {
                "quantum": ""
            },
            sessionComplete: false
        };
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
            this.prefillState(true, this.props.prefilled);
        }
    }

    /*
        Clear state and timer when the component unmounts 
    */
    componentWillUnmount(){
        this.clearState();
        clearInterval(this.schedulerTimerId);
    }

    componentDidUpdate(prevProps){
    
        if (prevProps.prefilled !== this.props.prefilled){
            if (this.props.prefilled){
                this.clearState();
                clearInterval(this.schedulerTimerId);
                this.prefillState(true, this.props.prefilled);
            }else{
                this.clearState();
                clearInterval(this.schedulerTimerId);
            }
        }
    }

    /*
        Add prefilled list of procs to state and start 
        a new scheduling session.
    */
    prefillState = (start, prefillProcs) => {
        if( prefillProcs){
            let procs_list = prefillProcs;

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
            if(start){
                this.setState((state) => ({
                    procs: addProc,
                    count: count,
                    totalExecutionTime: totalExecution,
                    avgTurnaround: 0,
                    avgResponse: 0,
                    arrivalTime: "",
                    executionTime: "",
                    running: true,
                    playIcon: "pause_circle",
                    quantum: parseInt(procs_list[0].quantum),
                    disabled: true,
                    arrivalDisabled: true,
                    executionDisabled: true,
                    colorDeleteIcon: "#6c757d",
                    colorAddIcon: "#6c757d",
                    colorClearIcon: "#6c757d"
                }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000));
            }else{
                this.setState((state) => ({
                    procs: addProc,
                    count: count,
                    totalExecutionTime: totalExecution,
                    avgTurnaround: 0,
                    avgResponse: 0,
                    arrivalTime: "",
                    executionTime: "",
                    running: false,
                    playIcon: "play_circle",
                    quantum: parseInt(procs_list[0].quantum),
                    disabled: true,
                    arrivalDisabled: false,
                    executionDisabled: false,
                    colorDeleteIcon: "#dc3545",
                    colorAddIcon: "#28a745",
                    colorClearIcon: "#dec8c8"
                }));
            }

        }
    }
        
    clearState = () => {
        this.setState(state => ({
            procs: [],
            count: 0,
            running: false,
            playIcon: "play_circle",
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
            pasteQueuesDisabled: true,
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745",
            colorClearIcon: "#dec8c8",
            clear: {
                "quantum": ""
            },
            sessionComplete: false
        }));
    }
    
    /* 
        get the user input for each process and update state:
        - arrival time, execute time and quantum(time slice)
     */
    handleChange = (event) => {

        this.setState((state) => ({
            [event.target.name]: event.target.value
        }));
    }

    /*
        Save a process to state in the array with all the processes 
        that the scheduler should run.
    */
    handleSubmit = (event) => {
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
    deleteProc = (procId) => {
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
                    avgResponse: 0,
                    sessionComplete: false
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
    handleClickStart = () => {
        if (this.state.procs.length !== 0){

            if (!this.state.running && this.state.totalExecutionTime !== 0){
                this.setState(state => ({
                    running: true,
                    playIcon: "pause_circle",
                    arrivalDisabled: true,
                    executionDisabled: true,
                    colorDeleteIcon: "#6c757d",
                    colorAddIcon: "#6c757d",
                    colorClearIcon: "#6c757d"
                }));

                let sortProcList = sortProcs(this.state.procs, 1, {"1": "arrivalTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
            }else{
                clearInterval(this.schedulerTimerId);
                this.setState(state => ({
                    running: false,
                    playIcon: "play_circle",
                    colorDeleteIcon: "#dc3545",
                    colorAddIcon: "#28a745",
                    colorClearIcon: "#dec8c8"
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
    runSchedulerTimeSlice = () => {
        
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
                playIcon: "play_circle",
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
                totalExecutionTime: 0,
                colorDeleteIcon: "#dc3545",
                colorAddIcon: "#28a745",
                colorClearIcon: "#dec8c8",
                clear: {
                    "quantum": state.quantum
                },
                sessionComplete: true
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf = () => {

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
    pasteCurrentConf = (event) => {
        /*
            Check if we have a setup copied in the textarea.
        */

        this.copyCurrentConf();

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
            }else{
                this.setState((state) => ({
                    pasteSetup: event.target.value
                }));
            }
        }
    }

    handleGo = () => {

        const name = this.state.pasteSetup;
        const slice = this.state.pasteSlice;
        const boost = this.state.pasteBoost;
        const queues = this.state.pasteQueues;
        const setup = this.state.textarea;
        const currentName = "RR";

        if (name === "MLFQ" && boost !== "" && queues !== ""){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);

        }else if (name === "FIFO" || name === "SJF" || name === "STCF"){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);
        }
    }

    /*
        Reset the completed scheduling session.
        The progress made by each proc returns to 0.
    */
    handleClear = () => {
        const session = this.state.sessionComplete;
        const active = this.state.running;
        const procs = this.state.procs.slice();
        const quantum = this.state.clear.quantum;
        const clearProcs = [];

        if(!active && session){

            for (let i = 0; i < procs.length; i++){

                clearProcs.push({
                    "id": procs[i].id,
                    "arrivalTime": procs[i].arrivalTime,
                    "executeTime": procs[i].executionTime,
                    "quantum": quantum,
                    "boost": "",
                    "queues": ""
                })
            }
            this.clearState();
            clearInterval(this.schedulerTimerId);
            this.prefillState(false, clearProcs);
        }
    }

    render(){
        const processes = this.state.procs.slice();
        return(
            <React.Fragment>
            <div class="scheduler-wrapper">
                <div className="container-fluid">
                    {/* Render the form through which the user will submit parameters for each process*/}
                    <div className="controlBtns">
                        <button type="buton" id="button-clear"><span class="material-symbols-outlined icon-clear" id="clear" style={{color: this.state.colorClearIcon}} onClick={this.handleClear} >backspace</span></button>
                        <form onSubmit={this.handleSubmit}>
                            <p id="add-proc-desc">Add a new process: </p>
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
                            <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: this.state.colorAddIcon}}>add_circle</span></button>
                        </form>
                        <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{this.state.playIcon}</span></button>
                        <TimeTooltip />
                    </div>
                    {/* Render the progress bars for each process*/}
                    <RenderProgressBars 
                        procs={processes.sort((a, b) => a.id - b.id)}
                        deleteBar={this.deleteProc}
                        avgTurnaround={this.state.avgTurnaround}
                        avgResponse={this.state.avgResponse}
                        alertColor={this.props.alertColor}
                        name="RR"
                        prefilledType={this.props.prefilledType}
                        colorDeleteIcon={this.state.colorDeleteIcon}
                        sessionComplete={this.state.sessionComplete}
                    />
                </div>
                <div className="wrapper-copy">
                    <div id="paste-wrapper">
                        <label id="label-simulate" data-toggle="tooltip" data-placement="top" title="When switching to other scheduler, general settings from this one, that don't apply, will be removed. Additional settings may be required.">
                            Simulate setup with a different scheduler: 
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
                        <button type="button" className="go" id="go-paste" onClick={this.handleGo}>GO!</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
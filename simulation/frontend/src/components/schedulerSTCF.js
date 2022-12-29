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
import {arrival, execute, slice, boost, queues, switchScheduler} from "./inputTooltips";
import {general, general_paste} from "./generalStateSettings";


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
            general: general,
            paste: general_paste
        };
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
        if(prefillProcs){
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

            let sortAddProc = sortProcs(addProc, 2, {"1": "arrivalTime", "2": "executionTime"});
            addProc.splice(0, addProc.length, ...sortAddProc);

            /* 
                Update state with all default settings 
                and start sunning the scheduler with these settings
            */

            let setGeneral = {...general};
            setGeneral.procs = addProc;
            setGeneral.count = count;
            setGeneral.totalExecutionTime = totalExecution;

            if(start){
                setGeneral.running = true;
                setGeneral.playIcon = "pause_circle";
                setGeneral.arrivalDisabled = true;
                setGeneral.executionDisabled = true;
                setGeneral.colorDeleteIcon = "#6c757d";
                setGeneral.colorAddIcon = "#6c757d";
                setGeneral.colorClearIcon = "#6c757d";
                setGeneral.showDescription = true;

                this.setState((state) => ({
                    general: setGeneral
                }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000));

            }else{
                this.setState((state) => ({
                    general: setGeneral
                }));
            }
        }
    }
    
    clearState = () => {
        let clear_general = {...general};
        let clear_paste = {...general_paste};

        this.setState(state => ({
           general: clear_general,
           paste: clear_paste
        }));
    }

    
    /* 
        get the user input for each process and update state:
        - arrival time, execute time
    */
    handleChange = (event) => {

        if (event.target.name in this.state.general){

            this.setState((state) => ({
                general: {...state.general,
                    [event.target.name]: event.target.value
                }
            }));

        }else {
            
            this.setState((state) => ({
                paste: {...state.paste,
                    [event.target.name]: event.target.value
                }
            }));
        }
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
                - statistics
        */
        let addProc;
        let count;
        let totalExecution;

        const procArrival = this.state.general.arrivalTime;
        const procExecute = this.state.general.executionTime;
        const avgT = this.state.general.avgTurnaround;
        const old_procs = this.state.general.procs.slice();
        const old_count = this.state.general.count;
        const old_totalExecute = this.state.general.totalExecutionTime;

        if (procArrival && procExecute){
            this.props.updateSubtitle();

            if (avgT !== 0){
                addProc = [];
                count = 0;
                totalExecution = 0;
                this.clearState();
            }else{
                addProc = old_procs;
                count = old_count;
                totalExecution = old_totalExecute;
            }

            let newAddproc = addProcess(addProc, count, procArrival, procExecute);
            addProc.splice(0, addProc.length, ...newAddproc);

            this.setState((state) => ({
                general: {...state.general,
                    procs: addProc,
                    count: count + 1,
                    totalExecutionTime: totalExecution + parseInt(procExecute),
                    avgTurnaround: 0,
                    avgResponse: 0,
                    arrivalTime: "",
                    executionTime: "",
                    sessionComplete: false
                }
            }));
        }
    }

    /* 
        delete a process from the scheduler
    */
    deleteProc = (procId) => {
        /* 
            if the list of procs is empty, reset the count to 0
            reset statistics to 0 as well
        */
        const running = this.state.general.running;
        const timer = this.state.general.timer;
        const procs = this.state.general.procs.slice();

        if(!running && timer === 0){
            this.props.updateSubtitle();

            const deleted = deleteEntry(procs, procId);

            if (deleted.updateProcs.length === 0){
                this.clearState();
            }else{
                this.setState(state => ({
                    general: {...state.general,
                        procs: deleted.updateProcs,
                        totalExecutionTime: deleted.updateTotalExecTime
                    }
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
    handleClickStart = () => {

        let procs = this.state.general.procs.slice();
        const numProcs = this.state.general.procs.length;
        const running = this.state.general.running;
        const totalExecute = this.state.general.totalExecutionTime;

        if (numProcs !== 0){

            let update = {...this.state.general};

            if (!running && totalExecute !== 0){

                let sortProcList = sortProcs(procs, 2, {"1": "arrivalTime", "2": "executionTime"});
                procs.splice(0, numProcs, ...sortProcList);

                this.setState(state => ({
                    general: {...state.general,
                        procs: procs,
                        running: true,
                        playIcon: "pause_circle",
                        arrivalDisabled: true,
                        executionDisabled: true,
                        colorDeleteIcon: "#6c757d",
                        colorAddIcon: "#6c757d",
                        colorClearIcon: "#6c757d"
                    }
                }));

                this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000);
            }else{
                
                clearInterval(this.schedulerTimerId);

                this.setState(state => ({
                    general: {...state.general,
                        running: false,
                        playIcon: "play_circle",
                        colorDeleteIcon: "#dc3545",
                        colorAddIcon: "#28a745",
                        colorClearIcon: "#dec8c8"
                    }
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
    runSchedulerInterrupt = () => {
        /* 
            check timer 
        */
        
        const timer = this.state.general.timer;
        const totalExecute = this.state.general.totalExecutionTime;

        if(timer < totalExecute){

            /*
                Check if a new process entered the system
                and it should run at this timer
            */

            let procs = this.state.general.procs.slice();
            let running_proc_idx = this.state.general.currentProcessIdx;

            for (let i = 0; i < procs.length; i++){

                /*
                    Make sure that procs that arrive at the same time get a chance to run 
                */

                if (procs[i].arrivalTime === timer || procs[i].arrivalTime < timer && procs[i].executed === 0){
                    running_proc_idx = i;
                    break;
                }
            }


            /*
                Check all procs with arrival time before the selected process 
                and select the one with the smallest execution time left.
                If a process different than the current proc arrived,
                take this process as reference
            */
            let sortProcsTimeLeft = procs.slice(0, running_proc_idx + 1).sort((a, b) => a.timeLeft - b.timeLeft);
            let unsortedProcs = procs.slice(running_proc_idx + 1, procs.length);
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
            const scheduler = runProcess(timer, newProcs, newProcessIdx);
            
            if(scheduler){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it and increase the total execution Time 
                */
                let update = {...this.state.general}
                update.timer = timer + 1;

                if (scheduler.noProcToRun){

                    this.setState(state => ({
                        general: {...state.general,
                            timer: state.general.timer + 1,
                            totalExecutionTime: state.general.totalExecutionTime + 1
                        }
                    }));

                }else{
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, select the next process from the list
                     */
                    if(scheduler.procDone){

                        this.setState(state => ({
                            general: {...state.general,
                                procs: scheduler.updateProcs,
                                currentProcessIdx: state.general.currentProcessIdx + 1,
                                timer: state.general.timer + 1
                            }
                        }));

                    }else if (!scheduler.procDone){
    
                        this.setState(state => ({
                            general: {...state.general,
                                timer: state.general.timer + 1,
                                procs: scheduler.updateProcs
                            }
                        }));
                    }
                }
            }
        }else if(timer === totalExecute){

            /* 
                if timer reached the end (all the procs ran to completion)
                compute the results for the session (avgTurnaround, avgResponse)
                and reset the parameters related to timer.
            */
            clearInterval(this.schedulerTimerId);

            let procs = this.state.general.procs.slice();
            let avgT = getAverage(procs, "turnaround");
            let avgR = getAverage(procs, "response");

            /* 
                reset the component's state
            */
            this.copyCurrentConf();
            let textareaProcs = this.state.general.textarea;

            this.setState(state => ({
                general: {...general,
                    procs: procs,
                    avgTurnaround: avgT,
                    avgResponse: avgR,
                    sessionComplete: true,
                    textarea: textareaProcs
                }
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf = () => {
        const configuration = copyConfiguration(this.state.general.procs, {});

        this.setState(state => ({
            general: {...state.general,
                textarea: configuration
            }
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

        const textarea = this.state.general.textarea;

        if(textarea && textarea !== errorMsg){

            /*
                If the new scheduler will be RR or MLFQ, enable extra inputs for 
                their general settings that the current scheduler does not have.
            */
            if(event.target.value === "RR"){
                
                this.setState((state) => ({
                    paste: {...state.paste,
                        pasteSetup: event.target.value,
                        pasteSliceDisabled: false
                    }
                }));

            }else if(event.target.value === "MLFQ"){

                this.setState((state) => ({
                    paste: {...state.paste,
                        pasteSetup: event.target.value,
                        pasteBoostDisabled: false,
                        pasteQueuesDisabled: false,
                        pasteSliceDisabled: false
                    }
                }));
            }else{
                this.setState((state) => ({
                    paste: {...state.paste,
                        pasteSetup: event.target.value
                    }
                }));
            }
        }
    }

    handleGo = () => {

        const name = this.state.paste.pasteSetup;
        const slice = this.state.paste.pasteSlice;
        const boost = this.state.paste.pasteBoost;
        const queues = this.state.paste.pasteQueues;
        const setup = this.state.general.textarea;
        const currentName = "STCF";

        if(name === "RR" && slice !== ""){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);

        }else if (name === "MLFQ" && slice !== "" && boost !== "" && queues !== ""){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);

        }else if (name === "FIFO" || name === "SJF"){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);
        }
    }

    /*
        Reset the completed scheduling session.
        The progress made by each proc returns to 0.
    */
    handleClear = () => {
        const session = this.state.general.sessionComplete;
        const active = this.state.general.running;
        const procs = this.state.general.procs.slice();
        const clearProcs = [];

        if(!active && session){

            for (let i = 0; i < procs.length; i++){

                clearProcs.push({
                    "id": procs[i].id,
                    "arrivalTime": procs[i].arrivalTime,
                    "executeTime": procs[i].executionTime,
                    "quantum": "",
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
        const state = {...this.state.general};
        const paste = {...this.state.paste};

        return(
            <React.Fragment>
            <div class="scheduler-wrapper">
                <div className="container-fluid">
                    {/* Render the form through which the user will submit parameters for each process*/}
                    <div className="controlBtns">
                        <button type="buton" id="button-clear"><span class="material-symbols-outlined icon-clear" id="clear" style={{color: state.colorClearIcon}} onClick={this.handleClear} >backspace</span></button>
                        <form id="add-proc-form" onSubmit={this.handleSubmit}>
                            <p id="add-proc-desc">Add a new process: </p>
                            <Input title={arrival}
                                    label="Arrival time: "
                                    name="arrivalTime"
                                    id={state.count}
                                    handleChange={this.handleChange}
                                    value={state.arrivalTime}
                                    disabled={state.arrivalDisabled}
                                    min="0"
                                    max="200"
                            />
                            <Input title={execute}
                                    label="Execute time: "
                                    name="executionTime"
                                    id="inputExecutionTime"
                                    handleChange={this.handleChange}
                                    value={state.executionTime}
                                    disabled={state.executionDisabled}
                                    min="1"
                                    max="200"
                            />
                            <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: state.colorAddIcon}}>add_circle</span></button>
                        </form>
                        <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{state.playIcon}</span></button>

                        <TimeTooltip />
                    </div>
                    {/* Render the progress bars for each process*/}
                    <RenderProgressBars 
                        procs={state.procs.sort((a, b) => a.id - b.id)}
                        deleteBar={this.deleteProc}
                        avgTurnaround={state.avgTurnaround}
                        avgResponse={state.avgResponse}
                        alertColor={this.props.alertColor}
                        name="STCF"
                        prefilledType={this.props.prefilledType}
                        showDescription={state.showDescription}
                        colorDeleteIcon={state.colorDeleteIcon}
                        sessionComplete={state.sessionComplete}
                    />
                </div>
                <div className="wrapper-copy">
                    <div id="paste-wrapper">
                        <label id="label-simulate" data-toggle="tooltip" data-placement="top" data-html="true" title={switchScheduler}>
                                Simulate setup with a different scheduler: 
                            <br />
                        </label>
                        <select className="form-control form-control-sm" id="paste-setup" value={paste.pasteSetup} onChange={this.pasteCurrentConf}>
                            <option defaultValue>Select</option> 
                            <option name="FIFO">FIFO</option>
                            <option name="SJF">SJF</option>
                            <option name="STCF">STCF</option>
                            <option name="RR">RR</option>
                            <option name="MLFQ">MLFQ</option>
                        </select>
                        <div>
                            <Input title={slice}
                                    label="Time slice: "
                                    name="pasteSlice"
                                    id="pasteSlice"
                                    handleChange={this.handleChange}
                                    value={paste.pasteSlice}
                                    disabled={paste.pasteSliceDisabled}
                                    min="1"
                                    max="50"
                            />
                        </div>
                        <div>
                            <Input title={boost}
                                    label="Priority Boost: "
                                    name="pasteBoost"
                                    id="pasteBoost"
                                    handleChange={this.handleChange}
                                    value={paste.pasteBoost}
                                    disabled={paste.pasteBoostDisabled}
                                    min="1"
                                    max="100"
                            />
                        </div>
                        <div>
                            <Input title={queues}
                                    label="Queues: "
                                    name="pasteQueues"
                                    id="pasteQueues"
                                    handleChange={this.handleChange}
                                    value={paste.pasteQueues}
                                    disabled={paste.pasteQueuesDisabled}
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
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
import {general, specific_RR, paste_RR} from "./generalStateSettings";
import chooseProc from "./chooseNextProcRR";


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
            general: general,
            specific: specific_RR,
            paste: paste_RR
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

            let setGeneral = {...general};
            let setSpecific = {...specific_RR};

            setGeneral.procs = addProc;
            setGeneral.count = count;
            setGeneral.totalExecutionTime = totalExecution;

            setSpecific.quantum = parseInt(procs_list[0].quantum);
            setSpecific.disabled = true;

            if(start){

                setGeneral.running = true;
                setGeneral.playIcon = "pause_circle";
                setGeneral.arrivalDisabled = true;
                setGeneral.executionDisabled = true;
                setGeneral.colorDeleteIcon = "#6c757d";
                setGeneral.colorAddIcon = "#6c757d";
                setGeneral.colorClearIcon = "#6c757d";
                setGeneral.showDescription = true;

                this.setState((state, props) => ({
                    general: setGeneral,
                    specific: setSpecific

                }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000));
            }else{
                this.setState((state, props) => ({
                    general: setGeneral,
                    specific: setSpecific
                }));
            }
        }
    }
        
    clearState = () => {
        let clear_general = {...general};
        let clear_specific = {...specific_RR};
        let clear_paste = {...paste_RR};

        this.setState(state => ({
           general: clear_general,
           specific: clear_specific,
           paste: clear_paste
        }));
    }
    
    /* 
        get the user input for each process and update state:
        - arrival time, execute time and quantum(time slice)
     */
    handleChange = (event) => {

        if (event.target.name in this.state.general){

            this.setState((state) => ({
                general: {...state.general,
                    [event.target.name]: event.target.value
                }
            }));

        }else if(event.target.name in this.state.specific){

            this.setState((state) => ({
                specific: {...state.specific,
                    [event.target.name]: event.target.value
                }
            }));

        }else{

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
                },
                specific: {...state.specific,
                    disabled: true
                }
            }));
        }
    }

    /* 
        delete a process from the scheduler
    */
    deleteProc = (procId) => {
        const running = this.state.general.running;
        const timer = this.state.general.timer;
        const procs = this.state.general.procs.slice();

        if(!running && timer === 0){
            /* 
                if the list of procs is empty, reset:
                 - the count to 0
                 - quantum to empty 
                 - make input editable

            */
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
        Run the scheduler every second until the timer reaches the total 
        Execution Time for all process.
    */
    handleClickStart = () => {
        let procs = this.state.general.procs.slice();
        const numProcs = this.state.general.procs.length;
        const running = this.state.general.running;
        const totalExecute = this.state.general.totalExecutionTime;

        if (numProcs !== 0){

            if (!running && totalExecute !== 0){
                
                let sortProcList = sortProcs(procs, 1, {"1": "arrivalTime"});
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

                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
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
        - check if the current running used its time slice 
        - if it did, schedule the next process
    */
    runSchedulerTimeSlice = () => {
        
        const quantumSlice = parseInt(this.state.specific.quantum);
        const timer = this.state.general.timer;
        const totalExecute = this.state.general.totalExecutionTime;
        const procs = this.state.general.procs.slice();
        const numProcs = this.state.general.procs.length;
        let running_proc_idx = this.state.general.currentProcessIdx;
        
        /* 
            check timer 
        */
       
        if(timer < totalExecute){
            /*
                Check if the current running proc used its time slice
                Run the selected process and update its internal state
            */

            if(this.state.specific.quantumTicks === quantumSlice){
                let idx = chooseProc(running_proc_idx, this.state.general.procs.slice(), numProcs);
                this.setState(state => ({
                    general: {...state.general,
                        currentProcessIdx: idx
                    },
                    specific: {...state.specific,
                        quantumTicks: 0
                    }
                }));
            }
            running_proc_idx = this.state.general.currentProcessIdx;

            const scheduler = runProcess(timer, procs, running_proc_idx);
            
            if(scheduler){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it and increase the total execution Time 
                */

                if (scheduler.noProcToRun){

                    this.setState(state => ({
                        general: {...state.general,
                            timer: state.general.timer + 1,
                            totalExecutionTime: state.general.totalExecutionTime + 1
                        }
                    }));
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, select the next process from the list
                     */
                    if(scheduler.procDone){

                        this.setState(state => ({
                            general: {...state.general,
                                procs: scheduler.updateProcs,
                                timer: state.general.timer + 1
                            },
                            specific: {...state.specific,
                                quantumTicks: quantumSlice
                            }
                        }));
                    }else{
                        this.setState(state => ({
                            general: {...state.general,
                                timer: state.general.timer + 1,
                                procs: scheduler.updateProcs,
                            },
                            specific: {...state.specific,
                                quantumTicks: state.specific.quantumTicks + 1
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

            let avgT = getAverage(this.state.general.procs, "turnaround");
            let avgR = getAverage(this.state.general.procs, "response");

            /*
                Initialize the scheduler's state
            */

            let procs = this.state.general.procs.slice();
            this.copyCurrentConf();

            let textareaProcs = this.state.general.textarea;

            let updateSpecific = {...specific_RR};

            updateSpecific.clear.quantum = this.state.specific.quantum;

            this.setState(state => ({
                general: {...general,
                    procs: procs,
                    avgTurnaround: avgT,
                    avgResponse: avgR,
                    sessionComplete: true,
                    textarea: textareaProcs
                },
                specific: updateSpecific
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf = () => {

        let general_settings;
        if (this.state.specific.quantum){
            general_settings = {"Slice": this.state.specific.quantum};

        }else if (this.state.specific.clear.quantum){
            general_settings = {"Slice": this.state.specific.clear.quantum};
        }

        const configuration = copyConfiguration(this.state.general.procs, general_settings);

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
                If the new scheduler will be MLFQ, enable extra inputs for 
                their general settings that the current scheduler does not have.
            */

            if(event.target.value === "MLFQ"){

                this.setState((state) => ({
                    paste: {...state.paste,
                        pasteSetup: event.target.value,
                        pasteBoostDisabled: false,
                        pasteQueuesDisabled: false
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

     /*
        Switch with the current setup from RR to other scheduler
        and start running a new session.
    */
    handleGo = () => {

        const name = this.state.paste.pasteSetup;
        const slice = this.state.specific.clear.quantum;
        const boost = this.state.paste.pasteBoost;
        const queues = this.state.paste.pasteQueues;
        const setup = this.state.general.textarea;
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
        const session = this.state.general.sessionComplete;
        const active = this.state.general.running;
        const procs = this.state.general.procs.slice();
        const quantum = this.state.specific.clear.quantum;
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
        const state_general = {...this.state.general};
        const state_specific = {...this.state.specific};
        const paste = {...this.state.paste};

        return(
            <React.Fragment>
            <div class="scheduler-wrapper">
                <div className="container-fluid">
                    {/* Render the form through which the user will submit parameters for each process*/}
                    <div className="controlBtns">
                        <button type="buton" id="button-clear"><span class="material-symbols-outlined icon-clear" id="clear" style={{color: state_general.colorClearIcon}} onClick={this.handleClear} >backspace</span></button>
                        <form id="add-proc-form" onSubmit={this.handleSubmit}>
                            <p id="add-proc-desc">Add a new process: </p>
                            <Input title={arrival}
                                    label="Arrival time: "
                                    name="arrivalTime"
                                    id={state_general.count}
                                    handleChange={this.handleChange}
                                    value={state_general.arrivalTime}
                                    disabled={state_general.arrivalDisabled}
                                    min="0"
                                    max="200"
                            />
                            <Input title={execute}
                                    label="Execute time: "
                                    name="executionTime"
                                    id="inputExecutionTime"
                                    handleChange={this.handleChange}
                                    value={state_general.executionTime}
                                    disabled={state_general.executionDisabled}
                                    min="1"
                                    max="200"
                            />
                            <Input title={slice}
                                    label="Time slice: "
                                    name="quantum"
                                    id="quantum"
                                    handleChange={this.handleChange}
                                    value={state_specific.quantum}
                                    disabled={state_specific.disabled}
                                    min="1"
                                    max="50"
                            />
                            <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: state_general.colorAddIcon}}>add_circle</span></button>
                        </form>
                        <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{state_general.playIcon}</span></button>
                        <TimeTooltip />
                    </div>
                    {/* Render the progress bars for each process*/}
                    <RenderProgressBars 
                        procs={state_general.procs}
                        deleteBar={this.deleteProc}
                        avgTurnaround={state_general.avgTurnaround}
                        avgResponse={state_general.avgResponse}
                        alertColor={this.props.alertColor}
                        name="RR"
                        prefilledType={this.props.prefilledType}
                        showDescription={state_general.showDescription}
                        colorDeleteIcon={state_general.colorDeleteIcon}
                        sessionComplete={state_general.sessionComplete}
                    />
                </div>
                <div className="wrapper-copy">
                    <div id="paste-wrapper">
                        <label id="label-simulate" data-toggle="tooltip" data-html="true" data-placement="top" title={switchScheduler}>
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
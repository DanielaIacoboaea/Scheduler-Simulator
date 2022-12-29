import React from "react";
import runProcess from "./runProcess";
import RenderProgressBarsMLFQ from "./renderProgressBarsMLFQ";
import deleteEntry from "./deleteProc";
import copyConfiguration from "./copyConfiguration";
import colors from "./colors";
import getAverage from "./computeAverage";
import sortProcs from "./sortListOfProcs";
import Input from "./inputNumber";
import TimeTooltip from "./timeTooltip";
import updateQueues from "./updateQueuesMLFQ";
import {arrival, execute, slice, boost, queues, switchScheduler} from "./inputTooltips";
import {general, specific_MLFQ, paste_MLFQ} from "./generalStateSettings";


/* 
    The Multi-Level Feedback Queue Scheduler schedules each process 
    based on its priority. Each process starts on the top most queue(0)
    and is moved on a lower priority queue(e.g, from 0 to 1, from 1 to 2) 
    after it uses its quantum. 
    At boost time, all remaining processes are moved back to queue 0.

*/

export default class MLFQ extends React.Component{
    /* 
    Component for Multi-Level Feedback Queue Scheduler 
    */
    constructor(props){
        super(props);
        this.state = {
            general: general,
            specific: specific_MLFQ,
            paste: paste_MLFQ
        };
    }
    

    /* 
        When the component is mounted, check if we have prefilled settings to 
        display and start running a session.
        Prefilled settings means: 
        - processes with arrival and execution time 
        - slice time
        - boost time
        - queues
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
            let addToQueue = [];

            let numQueuesDefault = parseInt(procs_list[0].queues);
            let timeSliceDefault = parseInt(procs_list[0].quantum);
            let boostDefault = parseInt(procs_list[0].boost);

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

                let newAddproc = {
                    id: count,
                    arrivalTime: parseInt(procs_list[i].arrivalTime),
                    executionTime: parseInt(procs_list[i].executeTime),
                    turnaround: "",
                    response: "",
                    color: colors[Math.floor(Math.random() * 31)],
                    executed: 0,
                    executedPercentage: 0,
                    percentage: 0,
                    startRunning: 0,
                    timeLeft: parseInt(procs_list[i].executeTime),
                    queueIdx: 0
                }
                addProc.push(newAddproc);
                count++;
                totalExecution += parseInt(procs_list[i].executeTime);
            }

            addToQueue = updateQueues(addProc, numQueuesDefault);
            /*
                Sort the array of procs based on the type of scheduler
            */

            let sortAddProc = sortProcs(addProc, 1, {"1": "arrivalTime"});
            addProc.splice(0, addProc.length, ...sortAddProc);

            /*
                At time T=0 all procs will be on the first queue (0),
                so we need to sort it as well
            */
            let sortQueue = sortProcs(addToQueue[0], 1, {"1": "arrivalTime"});
            addToQueue[0].splice(0, addToQueue[0].length, ...sortQueue);

            let setGeneral = {...general};
            let setSpecific = {...specific_MLFQ};

            setGeneral.procs = addProc;
            setGeneral.count = count;
            setGeneral.totalExecutionTime = totalExecution;

            setSpecific.quantum = timeSliceDefault;
            setSpecific.quantumDisabled = true;
            setSpecific.boost = boostDefault;
            setSpecific.boostDisabled = true;
            setSpecific.numQueues = numQueuesDefault;
            setSpecific.queuesDisabled = true;
            setSpecific.queues = addToQueue;

            /* 
                Update state with all default settings 
                and start sunning the scheduler with these settings
            */
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
        let clear_specific = {...specific_MLFQ};
        let clear_paste = {...paste_MLFQ};

        this.setState(state => ({
           general: clear_general,
           specific: clear_specific,
           paste: clear_paste
        }));
    }

    /* 
        get the user input for each process and update state:
        - arrival time, execute time, queues, boost, quantum
    */
    handleChange = (event) => {

        /*
            When switching to FIFO, SJF, STCF from MLFQ the following extra settings will be removed:
            - time slice
            - boost
            - queues
            When switching to RR only boost and queues settings will be removed.
        */

        if (event.target.name in this.state.general){

            this.setState((state) => ({
                general: {...state.general,
                    [event.target.name]: event.target.value
                }
            }));

        }else if(event.target.name in this.state.specific){

            if (event.target.name === "numQueues"){
                let initialize_queues = [];
                for (let i = 0; i < parseInt(event.target.value); i++){
                    initialize_queues[i] = [];
                }

                this.setState((state) => ({
                    specific: {...state.specific,
                        [event.target.name]: event.target.value,
                        queues: initialize_queues
                    }
                }));
            }else{
                this.setState((state) => ({
                    specific: {...state.specific,
                        [event.target.name]: event.target.value
                    }
                }));
            }
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
        Add the process on the starting queue(0).
    */
    handleSubmit = (event) => {
        event.preventDefault();

        let addProc;
        let count;
        let totalExecution;
        let addToQueue;

        const procArrival = this.state.general.arrivalTime;
        const procExecute = this.state.general.executionTime;
        const avgT = this.state.general.avgTurnaround;
        const old_procs = this.state.general.procs.slice();
        const old_count = this.state.general.count;
        const old_totalExecute = this.state.general.totalExecutionTime;
        const numQueues = parseInt(this.state.specific.numQueues);
        let queues = this.state.specific.queues.slice();


        if (procArrival && procExecute){
            this.props.updateSubtitle();

            if (avgT !== 0){
                addProc = [];
                count = 0;
                totalExecution = 0;
                addToQueue = [];
                this.clearState();
                /*
                    initalize all queues with an empty array
                 */
                for (let i = 0; i < numQueues; i++){
                    addToQueue[i] = [];
                }

            }else{
                addProc = old_procs;
                count = old_count;
                totalExecution = old_totalExecute;
                addToQueue = queues;
            }

            const createProc = {
                id: old_count,
                arrivalTime: parseInt(procArrival),
                executionTime: parseInt(procExecute),
                turnaround: "",
                response: "",
                color: colors[Math.floor(Math.random() * 31)],
                executed: 0,
                executedPercentage: 0,
                percentage: 0,
                startRunning: 0,
                timeLeft: parseInt(procExecute),
                queueIdx: 0
            }

            /*
                add the process to the list of procs
            */
            addProc.push(createProc);

            /*
                Add a new arrived process to the queue with the highest priority (0)
            */
            addToQueue[0].push(createProc);

            this.setState((state) => ({
                general: {...state.general,
                    procs: addProc,
                    count: count + 1,
                    totalExecutionTime: state.general.totalExecutionTime + parseInt(procExecute),
                    avgTurnaround: 0,
                    avgResponse: 0,
                    arrivalTime: "",
                    executionTime: "",
                    sessionComplete: false
                },
                specific: {...state.specific,
                    quantumDisabled: true,
                    boostDisabled: true,
                    queuesDisabled: true,
                    queues: addToQueue
                }
            }))
        }
    }

    /* 
        delete a process from the scheduler
    */
    deleteProc = (procId) => {
        /* 
            if the list of procs is empty, reset 
            - the count to 0
            - numQueues, quantum, boost
            - update the queues
        */
        const running = this.state.general.running;
        const timer = this.state.general.timer;
        const procs = this.state.general.procs.slice();
        let queues = this.state.specific.queues.slice();

        if(!running && timer === 0){
            this.props.updateSubtitle();

            const deleted = deleteEntry(procs, procId);
            const updateQueue0 = [];
            const addToQueue = queues;
            for (let i = 0; i < deleted.updateProcs.length; i++){
                updateQueue0.push(deleted.updateProcs[i]);
            }

            addToQueue[0] = updateQueue0.slice(0);
            /*
                If we're deleting the last process from the list,
                clear the state as well
             */
            if (deleted.updateProcs.length === 0){
                this.clearState();
            }else{

                this.setState(state => ({
                    general: {...state.general,
                        procs: deleted.updateProcs,
                        totalExecutionTime: deleted.updateTotalExecTime
                    },
                    specific: {...state.specific,
                        queues: addToQueue
                    }
                }));
            }
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
    handleClickStart = () => {

        let procs = this.state.general.procs.slice();
        const numProcs = this.state.general.procs.length;
        const running = this.state.general.running;
        const totalExecute = this.state.general.totalExecutionTime;
        let firstQueue = this.state.specific.queues.slice();

        if (numProcs !== 0){

            if (!running && totalExecute !== 0){

                let sortProcList = sortProcs(procs, 1, {"1": "arrivalTime"});
                procs.splice(0, numProcs, ...sortProcList);

                let sortQueue0 = sortProcs(firstQueue[0], 1, {"1": "arrivalTime"});
                firstQueue[0].splice(0, firstQueue[0].length, ...sortQueue0);

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
                   },
                   specific: {...state.specific,
                        queues: firstQueue
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
        runSchedulerTimeSlice() gets called every second by the scheduler. 
        While the timer hasn't reached the total Execution time:
        - check if it is time to boost all procs to queue 0
        - check if the current running proc used its quantum 
        - decide which queue should run
        - decide which process should run from the selected queue
        - call runProcess function to run the process and update its progress within state 
    */
    runSchedulerTimeSlice = () => {
        const quantumSlice = parseInt(this.state.specific.quantum);
        const boost = parseInt(this.state.specific.boost);
        const numQueues = parseInt(this.state.specific.numQueues);

        let boostReached = false;
        let quantumReached = false;

        /* 
            check timer 
        */
        
        if(this.state.general.timer < this.state.general.totalExecutionTime){

            /*
                Check arrival of new process
                -----------------------------
                Check if a new process from queue 0 is supposed to run now
             */
            let copyProcsOnQueue0 = this.state.specific.queues[0].slice();

            let newArrivalProcIdx = this.state.general.currentProcessIdx;

            for (let i = 0; i < copyProcsOnQueue0.length; i++){
                /*
                    if the process already ran, skip it
                 */
                if (copyProcsOnQueue0[i].arrivalTime < this.state.general.timer && copyProcsOnQueue0[i].executed !== 0){
                    continue;
                }

                /*
                    if the process comes later than the current value of the timer,
                    skip it
                 */
                if(copyProcsOnQueue0[i].arrivalTime > this.state.general.timer){
                    continue;
                }

                /*
                    found a process to run
                 */
                if(copyProcsOnQueue0[i].timeLeft !== 0){
                    newArrivalProcIdx = copyProcsOnQueue0[i].id;
                    break;
                }
            }

            /*
                Interrupt the current running process
                -------------------------------------
                Schedule the proc to run
             */
            if (newArrivalProcIdx !== this.state.general.currentProcessIdx){

                this.setState(state => ({
                    general: {...state.general,
                        currentProcessIdx: newArrivalProcIdx
                    },
                    specific: { ...state.specific,
                        currentQueueIdx: 0,
                        quantumTicks: 0
                    }
                }));
            }

            /* 
                Boost slice reached
                -------------------
                if it is time to boost all procs to queue 0
            */
            if (this.state.specific.boostTicks === boost){
                let get_procs = this.state.general.procs.slice();
                
                /*
                    If a process still has time left, update it's queueIdx to 
                    queue 0.
                 */
                for (let i = 0; i < get_procs.length; i++){ 
                    if(get_procs[i].executed < get_procs[i].executionTime){
                        get_procs[i].queueIdx = 0;
                    }
                }

                /*
                    If a process ran to completion, leave it on its current queue
                    Otherwise move them to the first queue(0)
                */
                let build_queues = updateQueues(get_procs, numQueues);

                /*
                    Update state to reflect where each process is on the queue
                    and reset the number of ticks for the boost time slice
                 */
                boostReached  = true;

                this.setState(state => ({
                    general: {...state.general,
                        procs: get_procs
                    },
                    specific: {...state.specific,
                        queues: build_queues,
                        boostTicks: 0,
                        quantumTicks: 0,
                        currentQueueIdx: 0
                    }
                }));
            }

            /*
                Time slice reached 
                ------------------
                check if the current running proc used its quantum 
                if it's the case, move the process on a queue with 
                a lower priority (e.g from 0 - 1, 1-2). If it is on the last queue,
                it remains there until the next boost happens
            */
            if(this.state.specific.quantumTicks === quantumSlice){
                let currentProcIdx = this.state.general.currentProcessIdx;
                let findProc;
                let procs = this.state.general.procs.slice();
                /*
                    Find the current running process
                 */
                for (let i = 0; i < procs.length; i++){
                    if(procs[i].id === currentProcIdx){
                        findProc = i;
                    }
                }

                let currentProc = procs[findProc];
                if (currentProc.executed < currentProc.executionTime){
                    if (currentProc.queueIdx + 1 < numQueues){
                        procs[findProc].queueIdx += 1;
                    }
                }

                let updateQueue = updateQueues(procs, numQueues);
                quantumReached = true;

                this.setState(state => ({
                    general: {...state.general,
                        procs: procs
                    },
                    specific: {...state.specific,
                        queues: updateQueue,
                        quantumTicks: 0
                    }
                }));
            }
                
            /*
                Starting with the queue with the highest priority(0) chech 
                each queue to see if it has any proc available to run
                get the first process available to run from that queue
            */
            if(boostReached || quantumReached){
                let sortProcList = sortProcs(this.state.general.procs.slice(), 2, {"1": "queueIdx", "2": "arrivalTime"});
                let procs = [];

                procs.splice(0, procs.length, ...sortProcList);

                let chooseProcId;
                let newQueue;

                for(let i = 0; i < procs.length; i++){
                    if(procs[i].executed === procs[i].executionTime){
                        continue;
                    }
                    if(procs[i].arrivalTime > this.state.general.timer){
                        continue;
                    }
                    chooseProcId = procs[i].id;
                    newQueue = procs[i].queueIdx;
                    break;
                }

                let updateQueue = updateQueues(procs, numQueues);

                /*
                    Update state to move to the new queue and start running the new process
                */
                this.setState(state => ({
                    general: {...state.general,
                        currentProcessIdx: chooseProcId
                    },
                    specific: {...state.specific,
                        currentQueueIdx: newQueue,
                        queues: updateQueue
                    }
                }));
            }


            /*
                Run the selected process and update its internal state
            */
            let newProcIdForScheduler;
            for (let i = 0; i < this.state.general.procs.length; i++){
                if (this.state.general.procs[i].id === this.state.general.currentProcessIdx){
                    newProcIdForScheduler = i;
                }
            }
            
            const scheduler = runProcess(this.state.general.timer, this.state.general.procs.slice(), newProcIdForScheduler);
            
            if(scheduler){

                /*
                    If the timer is lower than the proc's arrival time in the system,
                    don't run it
                */
                if (scheduler.noProcToRun){

                    this.setState(state => ({
                        general: {...state.general,
                            totalExecutionTime: state.totalExecutionTime + 1,
                            timer: state.general.timer + 1
                        }
                    }));
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, signal that another process should run 
                        by setting quantumTicks to quantumSlice
                    */

                    let updateQueue = updateQueues(scheduler.updateProcs, numQueues);

                    if(scheduler.procDone){

                        this.setState(state => ({
                            general: {...state.general,
                                timer: state.general.timer + 1,
                                procs: scheduler.updateProcs
                            },
                            specific: {...state.specific,
                                queues: updateQueue,
                                boostTicks: state.specific.boostTicks + 1,
                                quantumTicks: quantumSlice
                            }
                        }));

                    }else{
                        this.setState(state => ({
                            general: {...state.general,
                                procs: scheduler.updateProcs,
                                timer: state.general.timer + 1
                            },
                            specific: {...state.specific,
                                queues: updateQueue,
                                boostTicks: state.specific.boostTicks + 1,
                                quantumTicks: state.specific.quantumTicks + 1
                            }
                        }));
                    }
                }
            }
        }else if(this.state.general.timer === this.state.general.totalExecutionTime){
            /* 
                if timer reached the end (all the procs ran to completion)
                compute the results for the session (avgTurnaround, avgResponse)
                and reset the parameters related to timer.
            */
            clearInterval(this.schedulerTimerId);

            let avgT = getAverage(this.state.general.procs, "turnaround");
            let avgR = getAverage(this.state.general.procs, "response");

            /* 
                reset the component's state
            */

            let procs = this.state.general.procs.slice();
            let queues = this.state.specific.queues.slice();

            this.copyCurrentConf();

            let textareaProcs = this.state.general.textarea;

            let updateSpecific = {...specific_MLFQ};
            
            updateSpecific.clear.quantum = this.state.specific.quantum;
            updateSpecific.clear.boost = this.state.specific.boost;
            updateSpecific.clear.numQueues = this.state.specific.numQueues;
            updateSpecific.queues = queues;

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

        let slice;
        if (this.state.specific.quantum){
            slice =  this.state.specific.quantum;

        }else if (this.state.specific.clear.quantum){
            slice = this.state.specific.clear.quantum;
        }

        const general_settings = {
            "Slice": slice,
            "Boost": this.state.specific.boost, 
            "Queues": this.state.specific.numQueues
        };

        const configuration = copyConfiguration(this.state.general.procs.slice(), general_settings);

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

        if(this.state.general.textarea && this.state.general.textarea !== errorMsg){

            this.setState((state) => ({
                paste: {...state.paste,
                    pasteSetup: event.target.value
                }
            }));
        }
    }

    /*
        Switch with the current setup from MLFQ to other scheduler
        and start running a new session.
    */
    handleGo = () => {

        const name = this.state.paste.pasteSetup;
        const slice = this.state.specific.clear.quantum;
        const boost = this.state.specific.clear.boost;
        const queues = this.state.specific.clear.numQueues;
        const setup = this.state.general.textarea;
        const currentName = "MLFQ";

       if (name === "FIFO" || name === "SJF" || name === "STCF" || name === "RR"){

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
        const queues = this.state.specific.clear.numQueues;
        const boost = this.state.specific.clear.boost;
        const clearProcs = [];

        if(!active && session){

            for (let i = 0; i < procs.length; i++){

                clearProcs.push({
                    "id": procs[i].id,
                    "arrivalTime": procs[i].arrivalTime,
                    "executeTime": procs[i].executionTime,
                    "quantum": quantum,
                    "boost": boost,
                    "queues": queues
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
                        <form id="add-proc-form" className="form-mlfq" onSubmit={this.handleSubmit}>
                            <p id="add-proc-desc">Add a new process: </p>
                            <div className="mlfq-inputs">
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
                                        disabled={state_specific.quantumDisabled}
                                        min="1"
                                        max="50"
                                />
                                <Input title={boost}
                                        label="Priority Boost: "
                                        name="boost"
                                        id="boost"
                                        handleChange={this.handleChange}
                                        value={state_specific.boost}
                                        disabled={state_specific.boostDisabled}
                                        min="1"
                                        max="100"
                                />
                                <Input title={queues}
                                        label="Queues: "
                                        name="numQueues"
                                        id="numQueues"
                                        handleChange={this.handleChange}
                                        value={state_specific.numQueues}
                                        disabled={state_specific.queuesDisabled}
                                        min="1"
                                        max="10"
                                />
                            </div>
                            <div>
                                <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: state_general.colorAddIcon}}>add_circle</span></button>
                            </div>

                        </form>
                        <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{state_general.playIcon}</span></button>

                        <TimeTooltip />
                    </div>
                    {/* Render the progress bars for each process*/}
                    <RenderProgressBarsMLFQ
                        procs={state_general.procs.slice().sort((a, b) => a.id - b.id)}
                        queues={state_specific.queues}
                        deleteBar={this.deleteProc}
                        avgTurnaround={state_general.avgTurnaround}
                        avgResponse={state_general.avgResponse}
                        alertColor={this.props.alertColor}
                        name="MLFQ"
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
                        <select id="paste-setup" className="paste-setup-MLFQ form-control form-control-sm" value={paste.pasteSetup} onChange={this.pasteCurrentConf}>
                            <option defaultValue>Select</option> 
                            <option name="FIFO">FIFO</option>
                            <option name="SJF">SJF</option>
                            <option name="STCF">STCF</option>
                            <option name="RR">RR</option>
                            <option name="MLFQ">MLFQ</option>
                        </select>
                        <button type="button" className="go" id="go-paste" onClick={this.handleGo}>GO!</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
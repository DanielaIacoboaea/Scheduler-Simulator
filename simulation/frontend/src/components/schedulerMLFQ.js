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
            procs: [],
            numQueues: "",
            queues: [],
            count: 0,
            running: false,
            playIcon: "play_circle",
            timer: 0,
            currentProcessIdx: 0,
            currentQueueIdx: 0,
            arrivalTime: "",
            executionTime: "",
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            quantum: "",
            quantumTicks: 0,
            boost: "",
            boostTicks: 0,
            quantumDisabled: false,
            boostDisabled: false,
            queuesDisabled: false,
            arrivalDisabled: false,
            executionDisabled: false,
            textarea: "",
            pasteSetup: "",
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745"
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
            this.prefillState();
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
                this.prefillState();
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
    prefillState = () => {
        if(this.props.prefilled){
            let procs_list = this.props.prefilled;

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

            for (let i = 0; i < numQueuesDefault; i++){
                addToQueue[i] = [];
            }

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
                addToQueue[0].push(newAddproc);
                count++;
                totalExecution += parseInt(procs_list[i].executeTime);
            }

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

            /* 
                Update state with all default settings 
                and start sunning the scheduler with these settings
            */
            this.setState((state) => ({
                procs: addProc,
                count: count,
                queues: addToQueue,
                totalExecutionTime: totalExecution,
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                numQueues: numQueuesDefault,
                quantum: timeSliceDefault,
                boost: boostDefault,
                quantumDisabled: true,
                boostDisabled: true,
                queuesDisabled: true,
                running: true,
                playIcon: "pause_circle",
                arrivalDisabled: true,
                executionDisabled: true,
                colorDeleteIcon: "#6c757d",
                colorAddIcon: "#6c757d"
            }), () => this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000));

        }
    }
    
    clearState = () => {
        this.setState(state => ({
            procs: [],
            numQueues: "",
            queues: [],
            count: 0,
            running: false,
            playIcon: "play_circle",
            timer: 0,
            currentProcessIdx: 0,
            currentQueueIdx: 0,
            arrivalTime: "",
            executionTime: "",
            totalExecutionTime: 0,
            avgTurnaround: 0,
            avgResponse: 0,
            quantum: "",
            quantumTicks: 0,
            boost: "",
            boostTicks: 0,
            quantumDisabled: false,
            boostDisabled: false,
            queuesDisabled: false,
            arrivalDisabled: false,
            executionDisabled: false,
            textarea: "",
            pasteSetup: "",
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745"
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
        if (event.target.name === "numQueues"){
            let initialize_queues = [];
            for (let i = 0; i < parseInt(event.target.value); i++){
                initialize_queues[i] = [];
            }
            this.setState((state) => ({
                [event.target.name]: event.target.value,
                queues: initialize_queues
            }));
        }else{
            this.setState((state) => ({
                [event.target.name]: event.target.value
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

        if (this.state.arrivalTime && this.state.executionTime){
            this.props.updateSubtitle();

            if (this.state.avgTurnaround !== 0){
                addProc = [];
                count = 0;
                totalExecution = 0;
                addToQueue = [];
                /*
                    initalize all queues with an empty array
                 */
                for (let i = 0; i < parseInt(this.state.numQueues); i++){
                    addToQueue[i] = [];
                }

            }else{
                addProc = this.state.procs.slice();
                count = this.state.count;
                totalExecution = this.state.totalExecutionTime;
                addToQueue = this.state.queues.slice();
            }

            const createProc = {
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
                timeLeft: parseInt(this.state.executionTime),
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
                procs: addProc,
                count: count + 1,
                queues: addToQueue,
                totalExecutionTime: totalExecution + parseInt(this.state.executionTime),
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: "",
                quantumDisabled: true,
                boostDisabled: true,
                queuesDisabled: true
            }));
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
        if(!this.state.running && this.state.timer === 0){
            this.props.updateSubtitle();

            const deleted = deleteEntry(this.state.procs.slice(), procId);
            const updateQueue0 = [];
            const addToQueue = this.state.queues.slice();
            for (let i = 0; i < deleted.updateProcs.length; i++){
                updateQueue0.push(deleted.updateProcs[i]);
            }

            addToQueue[0] = updateQueue0.slice(0);
            /*
                If we're deleting the last process from the list,
                clear the state as well
             */
            if (deleted.updateProcs.length === 0){
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    queues: [],
                    numQueues: "",
                    quantum: "",
                    boost: "",
                    quantumDisabled: false,
                    boostDisabled: false,
                    queuesDisabled: false,
                    count: 0,
                    avgTurnaround: 0,
                    avgResponse: 0
                }));
            }else{
                this.setState(state => ({
                    procs: deleted.updateProcs,
                    totalExecutionTime: deleted.updateTotalExecTime,
                    queues: addToQueue
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
        if (this.state.procs.length !== 0){
            if (!this.state.running && this.state.totalExecutionTime !== 0){
                this.setState(state => ({
                    running: true,
                    playIcon: "pause_circle",
                    arrivalDisabled: true,
                    executionDisabled: true,
                    colorDeleteIcon: "#6c757d",
                    colorAddIcon: "#6c757d"
                }));

                let sortProcList = sortProcs(this.state.procs, 1, {"1": "arrivalTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                let sortQueue0 = sortProcs(this.state.queues[0], 1, {"1": "arrivalTime"});
                this.state.queues[0].splice(0, this.state.queues[0].length, ...sortQueue0);

                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
            }else{
                clearInterval(this.schedulerTimerId);
                this.setState(state => ({
                    running: false,
                    playIcon: "play_circle",
                    colorDeleteIcon: "#dc3545",
                    colorAddIcon: "#28a745"
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
        const quantumSlice = parseInt(this.state.quantum);
        const boost = parseInt(this.state.boost);
        const numQueues = parseInt(this.state.numQueues);

        /* 
            check timer 
        */
        if(this.state.timer < this.state.totalExecutionTime){

            /*
                Check if a new process from queue 0 is supposed to run now
             */
            let copyProcsOnQueue0 = this.state.queues[0].slice();

            let newArrivalProcIdx = this.state.currentProcessIdx;

            for (let i = 0; i < copyProcsOnQueue0.length; i++){
                
                /*
                    if the process already ran, skip it
                 */
                if (copyProcsOnQueue0[i].arrivalTime < this.state.timer && copyProcsOnQueue0[i].executed !== 0){
                    continue;
                }

                /*
                    if the process comes later than the current value of the timer,
                    skip it
                 */
                if(copyProcsOnQueue0[i].arrivalTime > this.state.timer){
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
                Schedule the proc to run
             */
            if (newArrivalProcIdx !== this.state.currentProcessIdx){
                this.setState(state => ({
                    currentProcessIdx: newArrivalProcIdx,
                    currentQueueIdx: 0,
                    quantumTicks: 0
                }));
            }

            /* 
                if it is time to boost all procs to queue 0
            */
            if (this.state.boostTicks === boost){

                let get_procs = this.state.procs.slice();
                
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
                let build_queues = [];
                for (let i = 0; i < numQueues; i++){
                    build_queues[i] = [];
                }

                let currentQueues = this.state.queues.slice();

                for(let i = 0; i < currentQueues.length; i++){

                    for(let j = 0; j < currentQueues[i].length; j++){

                        if(currentQueues[i][j].executed < currentQueues[i][j].executionTime){
                            build_queues[0].push(currentQueues[i][j]);
                        }else{
                            let remainIdx = currentQueues[i][j].queueIdx;
                            build_queues[remainIdx].push(currentQueues[i][j]);
                        }
                    }
                }

                /*
                    Update state to reflect where each process is on the queue
                    and reset the number of ticks for the boost time slice
                 */
                this.setState(state => ({
                    procs: get_procs,
                    queues: build_queues,
                    boostTicks: 0,
                    quantumTicks: 0,
                    currentQueueIdx: 0
                }));

            }

            /*
                check if the current running proc used its quantum 
                if it's the case, move the process on a queue with 
                a lower priority (e.g from 0 - 1, 1-2). If it is on the last queue,
                it remains there until the next boost happens
            */
            
            if(this.state.quantumTicks === quantumSlice){

                let currentProcIdx = this.state.currentProcessIdx;
                let findProc;

                /*
                    Find the current running process
                 */
                for (let i = 0; i < this.state.procs.length; i++){
                    if(this.state.procs[i].id === currentProcIdx){
                        findProc = i;
                    }
                }

                let currentProc = this.state.procs[findProc];

                /*
                    If the proc is not complete, move it down one queue
                    Otherwise leave it on it's current queue
                 */
                if (currentProc.executed < currentProc.executionTime){

                    if (currentProc.queueIdx + 1 < numQueues){

                        const procOnQueue = currentProc.queueIdx;
                        const updateProcs = this.state.procs.slice();
                        updateProcs[findProc].queueIdx += 1;

                        const updateQueue = this.state.queues.slice();
                        let idxOfProc = updateQueue[procOnQueue].indexOf(currentProc);
                        updateQueue[procOnQueue].splice(idxOfProc, 1);

                        updateQueue[procOnQueue + 1].push(currentProc);
                        
                        /*
                            update state to reflect changes in the process and for the queue
                         */
                        this.setState(state => ({
                            procs: updateProcs,
                            queues: updateQueue,
                            currentQueueIdx: 0
                        }));
                    }
                }
                
                /*
                    Starting with the queue with the highest priority(0) chech 
                    each queue to see if it has any proc available to run
                    get the first process available to run from that queue
                */

                let sortProcList = sortProcs(this.state.procs, 2, {"1": "queueIdx", "2": "arrivalTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                let chooseProcId;
                let newQueue;

                for(let i = 0; i < this.state.procs.length; i++){
                    if(this.state.procs[i].executed === this.state.procs[i].executionTime){
                        continue;
                    }
                    if(this.state.procs[i].arrivalTime > this.state.timer){
                        continue;
                    }
                    chooseProcId = this.state.procs[i].id;
                    newQueue = this.state.procs[i].queueIdx;
                    break;
                }

                /*
                    Update state to move to the new queue and start running the new process
                */
                this.setState(state => ({
                    currentProcessIdx: chooseProcId,
                    currentQueueIdx: newQueue,
                    quantumTicks: 0
                }));
            }

            /*
                Run the selected process and update its internal state
            */
            
            let newProcIdForScheduler;
            for (let i = 0; i < this.state.procs.length; i++){
                if (this.state.procs[i].id === this.state.currentProcessIdx){
                    newProcIdForScheduler = i;
                }
            }
            

            const schedule = runProcess(this.state.timer, this.state.procs, newProcIdForScheduler);
            
            if(schedule){
                /*
                    If the timer is lower than the proc's arrival time in the system, 
                    don't run it
                 */
                if (schedule.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1,
                        timer: state.timer + 1
                    }));
                }else {
                    /*
                        Otherwise, update the process's internal state
                        If the process is complete, signal that another process should run 
                        by setting quantumTicks to quantumSlice
                     */

                    let updateProcInQueue = this.state.queues.slice();
                    let queueIdxProc = this.state.procs[newProcIdForScheduler].queueIdx;
                    updateProcInQueue[queueIdxProc].executed += 1;

                    if(schedule.procDone){

                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            queues: updateProcInQueue,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
                            quantumTicks: quantumSlice
                        }));
                    }else{

                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            queues: updateProcInQueue,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
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
                reset the component's state
            */
            this.setState(state => ({
                running: false,
                playIcon: "play_circle",
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                quantumTicks: 0,
                boostTicks: 0,
                numQueues: "",
                quantum: "",
                boost: "",
                quantumDisabled: false,
                boostDisabled: false,
                queuesDisabled: false,
                arrivalDisabled: false,
                executionDisabled: false,
                count: 0,
                currentProcessIdx: 0,
                totalExecutionTime: 0,
                colorDeleteIcon: "#dc3545",
                colorAddIcon: "#28a745"
            }));
        }
    }

    /*
        Copy current settings for the scheduler 
        and update the textarea in JSON format.
    */
    copyCurrentConf = () => {

        const general_settings = {
            "Slice": this.state.quantum, 
            "Boost": this.state.boost, 
            "Queues": this.state.numQueues
        };
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
            this.setState((state) => ({
                pasteSetup: event.target.value
            }));
        }
    }

    handleGo = () => {

        const name = this.state.pasteSetup;
        const slice = this.state.pasteSlice;
        const boost = this.state.pasteBoost;
        const queues = this.state.pasteQueues;
        const setup = this.state.textarea;
        const currentName = "MLFQ";

       if (name === "FIFO" || name === "SJF" || name === "STCF" || name === "RR"){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);
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
                                    disabled={this.state.quantumDisabled}
                                    min="1"
                                    max="50"
                            />
                            <Input title="Amount of time after which all processes move to the highest priority (queue 0)."
                                    label="Priority Boost: "
                                    name="boost"
                                    id="boost"
                                    handleChange={this.handleChange}
                                    value={this.state.boost}
                                    disabled={this.state.boostDisabled}
                                    min="1"
                                    max="100"
                            />
                            <Input title="Number of priority queues. Each process moves to lower priority after its time slice is over."
                                    label="Queues: "
                                    name="numQueues"
                                    id="numQueues"
                                    handleChange={this.handleChange}
                                    value={this.state.numQueues}
                                    disabled={this.state.queuesDisabled}
                                    min="1"
                                    max="10"
                            />
                            <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: this.state.colorAddIcon}}>add_circle</span></button>
                            <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{this.state.playIcon}</span></button>

                        </form>
                        <TimeTooltip />
                    </div>
                    {/* Render the progress bars for each process*/}
                    <RenderProgressBarsMLFQ
                        procs={processes.sort((a, b) => a.id - b.id)}
                        queues={this.state.queues}
                        deleteBar={this.deleteProc}
                        avgTurnaround={this.state.avgTurnaround}
                        avgResponse={this.state.avgResponse}
                        alertColor={this.props.alertColor}
                        name="MLFQ"
                        prefilledType={this.props.prefilledType}
                        colorDeleteIcon={this.state.colorDeleteIcon}
                    />
                </div>
                <div className="wrapper-copy">
                    <div id="paste-wrapper">
                        <label id="label-simulate" data-toggle="tooltip" data-placement="top" title="When switching to other scheduler, general settings from this one, that don't apply, will be removed. Additional settings may be required.">
                            Simulate setup with a different scheduler: 
                            <br />
                        </label>
                        <select id="paste-setup" className="paste-setup-MLFQ"value={this.state.pasteSetup} onChange={this.pasteCurrentConf}>
                            <option defaultValue disabled></option> 
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
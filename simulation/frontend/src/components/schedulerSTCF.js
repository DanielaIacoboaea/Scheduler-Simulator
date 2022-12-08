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
            textarea: "",
            pasteSetup: "",
            pasteSlice: "",
            pasteSliceDisabled: true,
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true,
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745"
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
                playIcon: "pause_circle",
                arrivalDisabled: true,
                executionDisabled: true,
                colorDeleteIcon: "#6c757d",
                colorAddIcon: "#6c757d"
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
            textarea: "",
            pasteSetup: "",
            pasteSlice: "",
            pasteSliceDisabled: true,
            pasteBoost: "",
            pasteBoostDisabled: true,
            pasteQueues: "",
            pasteQueuesDisabled: true,
            colorDeleteIcon: "#dc3545",
            colorAddIcon: "#28a745"
        }));
        clearInterval(this.schedulerTimerId);
    }
    
    /* 
        get the user input for each process and update state:
        - arrival time, execute time
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
    deleteProc = (procId) => {
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

                let sortProcList = sortProcs(this.state.procs, 2, {"1": "arrivalTime", "2": "executionTime"});
                this.state.procs.splice(0, this.state.procs.length, ...sortProcList);

                this.schedulerTimerId = setInterval(() => this.runSchedulerInterrupt(), 1000);
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
                playIcon: "play_circle",
                timer: 0,
                avgTurnaround: avgT,
                avgResponse: avgR,
                count: 0,
                currentProcessIdx: 0,
                arrivalDisabled: false,
                executionDisabled: false,
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
    pasteCurrentConf = (event) => {
        /*
            Check if we have a setup copied in the textarea.
        */
        this.copyCurrentConf();
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
        const currentName = "STCF";

        if(name === "RR" && slice !== ""){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);

        }else if (name === "MLFQ" && slice !== "" && boost !== "" && queues !== ""){

            this.props.pastePrefill(currentName, name, setup, slice, queues, boost);

        }else if (name === "FIFO" || name === "SJF"){

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
                            <button type="submit" value="submit" id="submit-btn"><span class="material-symbols-outlined icon-add" style={{color: this.state.colorAddIcon}}>add_circle</span></button>
                            <button type="buton" id="button-play"><span class="material-symbols-outlined icon-play" id="play" onClick={this.handleClickStart}>{this.state.playIcon}</span></button>
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
                        name="STCF"
                        prefilledType={this.props.prefilledType}
                        colorDeleteIcon={this.state.colorDeleteIcon}
                    />
                </div>
                <div className="wrapper-copy">
                    <div id="paste-wrapper">
                        <label data-toggle="tooltip" data-placement="top" title="When switching to other scheduler, general settings from this one, that don't apply, will be removed. Additional settings may be required.">
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
                            <Input title="Amount of time a process runs when scheduled."
                                    label="Time slice: "
                                    name="pasteSlice"
                                    id="pasteSlice"
                                    handleChange={this.handleChange}
                                    value={this.state.pasteSlice}
                                    disabled={this.state.pasteSliceDisabled}
                                    min="1"
                                    max="50"
                            />
                        </div>
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
import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./scheduleNoTimeSlice";
import RenderProgressBarsMLFQ from "./renderProgressBarsMLFQ";


export default class MLFQ extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            procs: [],
            numQueues: "",
            queues: [],
            count: 0,
            running: false,
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
            queuesDisabled: false

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runSchedulerTimeSlice = this.runSchedulerTimeSlice.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
    }
    
    deleteProc(procId){
        if(!this.state.running){
            let idxToDelete;
            let execTime;
            const deleteProc = this.state.procs.slice();
            for (let i = 0; i < deleteProc.length; i++){
                if (deleteProc[i].id === parseInt(procId)){
                    idxToDelete = i;
                    execTime = deleteProc[i].executionTime;
                }
            }
            deleteProc.splice(idxToDelete, 1);
            if (this.state.totalExecutionTime !== 0){
                this.setState(state => ({
                    procs: deleteProc,
                    totalExecutionTime: state.totalExecutionTime - parseInt(execTime)
                }));
            }else{
                this.setState(state => ({
                    procs: deleteProc
                }));
            }
        }
    }

    runSchedulerTimeSlice(){
        const quantumSlice = parseInt(this.state.quantum);
        const boost = parseInt(this.state.boost);
        const numQueues = parseInt(this.state.numQueues);


        if(this.state.timer < this.state.totalExecutionTime){

            if (this.state.boostTicks === boost){
                let get_queues = [];
                let get_procs = this.state.procs.slice();

                //console.log("QUEUES: ", get_queues);
                //console.log("PROCS: ", get_procs);
                
                for (let i = 0; i < numQueues; i++){
                    get_queues[i] = [];
                }

                for (let i = 0; i < get_procs.length; i++){
                    if(get_procs[i].executed < get_procs[i].executionTime){
                        get_procs[i].queueIdx = 0;
                        get_queues[0].push(get_procs[i]);
                    }else{
                        let currentQueue = get_procs[i].queueIdx;
                        get_queues[currentQueue].push(get_procs[i]);
                    }
                }

                for (let i = 0; i < numQueues; i++){
                    get_queues[i].sort((a, b) => {
                        return a.queueIdx - b.queueIdx;
                    });
                }

                this.setState(state => ({
                    procs: get_procs,
                    queues: get_queues,
                    boostTicks: 0
                }));

            }

            if(this.state.quantumTicks === quantumSlice){

                let currentProcIdx = this.state.currentProcessIdx;
                let currentProc = this.state.procs[currentProcIdx];

                if (this.state.procs[currentProcIdx].executed < this.state.procs[currentProcIdx].executionTime){
                    if (this.state.procs[currentProcIdx].queueIdx + 1 < numQueues){
                        const procOnQueue = this.state.procs[currentProcIdx].queueIdx;
                        const updateProcs = this.state.procs.slice();
                        updateProcs[currentProcIdx].queueIdx += 1;

                        const updateQueue = this.state.queues.slice();
                        let idxOfProc = updateQueue[procOnQueue].indexOf(this.state.procs[currentProcIdx]);
                        updateQueue[procOnQueue].splice(idxOfProc, 1);

                        updateQueue[procOnQueue + 1].push(this.state.procs[currentProcIdx]);
                        //console.log("QUANTUM procs: ", updateProcs);
                       // console.log("QUANTUM queues: ", updateQueue);
                        this.setState(state => ({
                            procs: updateProcs,
                            queues: updateQueue
                        }));
                    }
                }

                let queue = this.state.currentQueueIdx;
                let newProc;
                let newQueue;
                let getNewProc;

                for (let i = 0; i < this.state.queues.length; i++){
                    for (let j = 0; j < this.state.queues[i].length; j++){
                        if (this.state.queues[i][j].executed < this.state.queues[i][j].executionTime){
                            newQueue = i;
                            getNewProc = this.state.queues[i][j];
                            break;
                        }
                    }
                }

                newProc = this.state.procs.indexOf(getNewProc);
                console.log("newProc: ", newProc);
                this.setState(state => ({
                    currentProcessIdx: newProc,
                    currentQueueIdx: newQueue,
                    quantumTicks: 0
                }));
            }

            const schedule = scheduleNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            
            if(schedule){
                if (schedule.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1,
                        timer: state.timer + 1,
                        boostTicks: state.boostTicks + 1
                    }));
                }else {
                    if(schedule.procDone){
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
                            quantumTicks: quantumSlice
                        }));
                    }else{
                        this.setState(state => ({
                            procs: schedule.updateProcs,
                            timer: state.timer + 1,
                            boostTicks: state.boostTicks + 1,
                            quantumTicks: state.quantumTicks + 1
                        }));
                        }
                    }
                }

        }else if(this.state.timer === this.state.totalExecutionTime){
            
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
                avgResponse: avgR,
                quantumTicks: 0,
                boostTicks: 0
            }));
        }
    }

    handleSubmit(event){
        event.preventDefault();
        if (this.state.arrivalTime && this.state.executionTime){
            const addProc = this.state.procs.slice();
            const addToQueue = this.state.queues.slice();

            const newProc =  {
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
            };

            //console.log("newProc: ", newProc);

           // console.log("addProc: ", addProc);
           // console.log("addToQueue: ", addToQueue);
           // console.log(" addToQueue[0]: ",  addToQueue[0]);

            addProc.push(newProc);
            addToQueue[newProc.queueIdx].push(newProc);

            this.setState((state) => ({
                procs: addProc,
                queues: addToQueue,
                count: state.count + 1,
                totalExecutionTime: state.totalExecutionTime + parseInt(this.state.executionTime),
                avgTurnaround: 0,
                avgResponse: 0,
                arrivalTime: "",
                executionTime: ""
            }));
        }
    }

    handleChange(event){
        if (event.target.name === "quantum"){
            this.setState((state) => ({
                [event.target.name]: event.target.value,
                quantumDisabled: false
            }));
        }else if (event.target.name === "numQueues"){
            let initialize_queues = [];
            for (let i = 0; i < parseInt(event.target.value); i++){
                initialize_queues[i] = [];
            }
            this.setState((state) => ({
                [event.target.name]: event.target.value,
                queuesDisabled: false,
                queues: initialize_queues
            }));
        }else if(event.target.name === "boost"){
            this.setState((state) => ({
                [event.target.name]: event.target.value,
                boostDisabled: false
            }));
        }else{
            this.setState((state) => ({
                [event.target.name]: event.target.value
            }));
        }
    }

    handleClickStart(){
        if (this.state.procs.length !== 0){
            if (!this.state.running){
                this.setState(state => ({
                    running: true
                }));
                this.state.procs.sort((a, b) => {
                    return a.arrivalTime - b.arrivalTime;
                });
                this.state.queues[0].sort((a, b) => {
                    return a.arrivalTime - b.arrivalTime;
                });
                this.schedulerTimerId = setInterval(() => this.runSchedulerTimeSlice(), 1000);
            }
        }
    }
    render(){
        const processes = this.state.procs.slice();
        return(
            <div className="container-fluid">
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
                        <label>
                            Time slice:
                            <input
                                type="number"
                                name="quantum"
                                onChange={this.handleChange}
                                value={this.state.quantum}
                                min="1"
                                max="20"
                                disabled={this.state.quantumDisabled}
                                required
                            />
                        </label>
                        <label>
                            Priority Boost:
                            <input
                                type="number"
                                name="boost"
                                onChange={this.handleChange}
                                value={this.state.boost}
                                min="1"
                                max="20"
                                disabled={this.state.boostDisabled}
                                required
                            />
                        </label>
                        <label>
                            Queues:
                            <input
                                type="number"
                                name="numQueues"
                                onChange={this.handleChange}
                                value={this.state.numQueues}
                                min="1"
                                max="20"
                                disabled={this.state.queuesDisabled}
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
                <RenderProgressBarsMLFQ
                    procs={processes.sort((a, b) => a.id - b.id)}
                    queues={this.state.queues}
                    deleteBar={this.deleteProc}
                    avgTurnaround={this.state.avgTurnaround}
                    avgResponse={this.state.avgResponse}
                    alertColor={this.props.alertColor}
                />
            </div>
        );
    }
}
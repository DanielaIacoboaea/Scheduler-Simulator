import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import scheduleNoTimeSlice from "./components/scheduleNoTimeSlice";

export default class SchedulerFIFOandSJF extends React.Component{
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
            avgResponse: 0

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runScheduler = this.runScheduler.bind(this);
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
                    totalExecutionTime: state.totalExecutionTime - parseInt(execTime) - 1 
                }));
            }else{
                this.setState(state => ({
                    procs: deleteProc
                }));
            }
        }
    }

    runScheduler(){
        if(this.state.timer < this.state.totalExecutionTime){
            const scheduler = scheduleNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            if (scheduler){
                if (scheduler.noProcToRun){
                    this.setState(state => ({
                        totalExecutionTime: state.totalExecutionTime + 1
                    }));
                } 
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
                avgResponse: avgR
            }));
        }
    }

    handleSubmit(event){
        event.preventDefault();
        if (this.state.arrivalTime && this.state.executionTime){
            const addProc = this.state.procs.slice();
            addProc.push(
                {
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
                    timeLeft: parseInt(this.state.executionTime)
                }
            )
            this.setState((state) => ({
                procs: addProc,
                count: state.count + 1,
                totalExecutionTime: state.totalExecutionTime + parseInt(this.state.executionTime) + 1,
                avgTurnaround: 0,
                avgResponse: 0
            }));
        }
    }

    handleChange(event){
        this.setState((state) => ({
            [event.target.name]: event.target.value
        }));
    }

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
                    </form>
                    <span class="material-symbols-outlined icon-play" onClick={this.handleClickStart}>play_circle</span>
                    <div className="results-desc">
                    <button type="button" className="btn btn-secondary" dataToggle="tooltip" dataPlacement="top" title="Turnaround and Response Time">Time
                    </button>
                    </div>
                </div>
                <RenderProgressBars 
                    procs={processes.sort((a, b) => a.id - b.id)}
                    deleteBar={this.deleteProc}
                    avgTurnaround={this.state.avgTurnaround}
                    avgResponse={this.state.avgResponse}
                />
            </div>
        );
    }
}
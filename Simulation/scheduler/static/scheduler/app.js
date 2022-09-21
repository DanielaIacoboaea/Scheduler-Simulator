
const colors = [
    "#009374",
    "#C13470",
    "#007EDD",
    "#E19894",
    "#98BEAD",
    "#4C7D93",
    "#93B725",
    "#FFC0FF",
    "#6960F9",
    "#009249",
    "#FFC47B",
    "#574240",
    "#DC3545",
    "#6c757d",
    "#17a2b8",
    "#31BB82",
    "#343a40",
    "#FFAB95",
    "#FF8E8F",
    "#FA8E73",
    "#007053",
    "#FD8F3B",
    "#28A745",
    "#9999CC",
    "#0094FF",
    "#00EDFF",
    "#6DE27B",
    "#4C323E",
    "#00BAFF",
    "#DBAFC3",
    "#8DAFCE",
    "#97DF1A"
]

class ProgressBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            style: {
                width: "0%",
                ariaValuenow: "0",
                ariaValuemin: "0",
                ariaValuemax: "100",
                backgroundColor: "",
            }
        };
    }

    componentDidMount(){
        const updateWidth = `${this.props.barWidth}%`;
        this.setState((state, props) => ({
            style: {
                width: updateWidth,
                ariaValuenow: this.props.ariaValuenow,
                backgroundColor: this.props.barColor
            }
        }));
    }

    componentDidUpdate(prevProps){
        const updateWidth = `${this.props.barWidth}%`;
        if(this.props.barWidth != prevProps.barWidth){
            this.setState((state, props) => ({
                style: {
                    width: updateWidth,
                    ariaValuenow: this.props.ariaValuenow,
                    backgroundColor: this.props.barColor
                }
            }));
        }
    }

    render(){
        return (
            <div className="progress w-100">
                <div className="progress-bar" role="progressbar" style={this.state.style}>{this.state.style.width}</div>
            </div>
        );
    };
}

class Buttons extends React.Component{
    constructor(props){
        super(props);
        this.startScheduler = this.startScheduler.bind(this);
    }

    startScheduler(event){
        this.props.handleRenderClick(event.target.id);
    }

    render(){
        return(
            <div className={this.props.wrapperBtnsClass}>
                <button type="button" className="btn btn-outline-secondary btn-lg" id="FIFO" onClick={this.startScheduler}>FIFO</button>
                <button type="button" className="btn btn-outline-info btn-lg" id="SJF" onClick={this.startScheduler}>SJF</button>
                <button type="button" className="btn btn-outline-dark btn-lg" id="STCF" onClick={this.startScheduler}>STCF</button>
                <button type="button" className="btn btn-outline-success btn-lg" id="RR" onClick={this.startScheduler}>RR</button>
                <button type="button" className="btn btn-outline-danger btn-lg" id="MLFQ" onClick={this.startScheduler}>MLFQ</button>
            </div>
        );
    }
}

class RenderProgressBars extends React.Component{
    constructor(props){
        super(props);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
    }
    handleDeleteClick(event){
        this.props.deleteBar(event.target.id);
    }
    render(){
        return(
            <React.Fragment>
            {this.props.procs.map((proc) =>
                <div className="process">
                    <div className="results">
                            <p>A: <span style={{color: proc.color}}>{proc.arrivalTime}</span> </p>
                            <p>E: <span style={{color: proc.color}}>{proc.executionTime}</span> </p>
                    </div>
                    <div>
                        <span class="material-symbols-outlined icon-delete" id={proc.id} onClick={this.handleDeleteClick}>delete</span>
                    </div>
                    <ProgressBar
                        barWidth={proc.executedPercentage.toFixed()}
                        ariaValuenow={proc.executed.toString()}
                        barColor={proc.color}
                    />
                    {proc.turnaround? 
                        <div className="results">
                            <p>T: <span style={{color: proc.color}}>{proc.turnaround}</span> </p>
                            <p>R: <span style={{color: proc.color}}>{proc.response}</span> </p>
                        </div>:
                        <div className="results">
                        </div>
                    }
                </div>
                )
            }
            {this.props.avgTurnaround?
                <div className="results avgs">
                    <span style={{color: "#6c757d"}}><p>Avg T: {this.props.avgTurnaround} </p></span>
                    <span style={{color: "#343a40"}}><p>Avg R: {this.props.avgResponse} </p></span>
                </div>:
                <div className="results avgs">
                </div>
            }
            </React.Fragment>
        );
    }
}


function schedulerNoTimeSlice(timer, allProcs, idx){
    if(idx < allProcs.length){

        const procs = allProcs.slice();

        const proc = procs[idx];
        const executed = proc.executed;
        let procDone = false;
        let noProcToRun = false;
        if(proc.arrivalTime > timer){
            noProcToRun = true;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
        
        if(executed === 0){
            proc.startRunning = timer;
            const percentInc = 100 / proc.executionTime;
            proc.percentage = percentInc;
            proc.executedPercentage = proc.percentage;
            proc.executed += 1;
            proc.timeLeft = proc.executionTime;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else if (executed < proc.executionTime){
            proc.executedPercentage += proc.percentage;
            proc.executed += 1;
            proc.timeLeft -= 1;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else if (executed === proc.executionTime){
            proc.turnaround = timer - proc.arrivalTime;
            proc.response = proc.startRunning - proc.arrivalTime;
            procDone = true;
            noProcToRun = false;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
    }
    return null;
}

class FIFO extends React.Component{
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
                if (deleteProc[i].id === procId){
                    idxToDelete = i;
                    execTime = deleteProc[i].executionTime;
                }
            }
            deleteProc.splice(idxToDelete, 1);
            if (this.state.totalExecutionTime !== 0){
                this.setState(state => ({
                    procs: deleteProc,
                    totalExecutionTime: state.totalExecutionTime - execTime
                }));
            }else{
                this.setState(state => ({
                    procs: deleteProc
                }));
            }
        }
    }

    runScheduler(){
        if (this.state.timer === 0){
            this.setState(state => ({
                running: true
            }));
            const scheduler = schedulerNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
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
        }else if(this.state.timer < this.state.totalExecutionTime){
            const scheduler = schedulerNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
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
                totalExecutionTime: 0,
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
                totalExecutionTime: state.totalExecutionTime + parseInt(this.state.executionTime) + 1
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
                this.state.procs.sort((a, b) => a.arrivalTime - b.arrivalTime);
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

class SJF extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
                barWidth="50%"
                ariaValuenow="50"
            />
        );
    }
}


class STCF extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
                barWidth="70%"
                ariaValuenow="70"
            />
        );
    }
}


class RR extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
            barWidth="90%"
            ariaValuenow="90"
        />
        );
    }
}


class MLFQ extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
                barWidth="100%"
                ariaValuenow="100"
            />
        );
    }
}

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            scheduler: ""
        };
        this.renderScheduler = this.renderScheduler.bind(this);
    }

    renderScheduler(name){
        this.setState((state) => ({
            scheduler: name
        }));
    }

    render(){

       const btnsSched = <Buttons handleRenderClick={this.renderScheduler} wrapperBtnsClass="wrapper-btns"/>;
       const btns = <Buttons handleRenderClick={this.renderScheduler} wrapperBtnsClass="wrapper-btns-single"/>;
       const btnsWrapperSched = "wrapper";
       const btnsWrapper = "wrapper btns-single";

        return(
            <React.Fragment>
           {
            this.state.scheduler === "FIFO"? <div className={btnsWrapperSched}>{btnsSched}<FIFO /></div>: 
            this.state.scheduler === "SJF"? <div className={btnsWrapperSched}>{btnsSched}<SJF /></div>:
            this.state.scheduler === "STCF"? <div className={btnsWrapperSched}>{btnsSched}<STCF /></div>:
            this.state.scheduler === "RR"? <div className={btnsWrapperSched}>{btnsSched}<RR /></div>: 
            this.state.scheduler === "MLFQ"? <div className={btnsWrapperSched}>{btnsSched}<MLFQ /></div>:
            <div className={btnsWrapper}>{btns}</div>
          }
          </React.Fragment>
        );
    }
}


ReactDOM.render(<App />, document.querySelector("#app"))
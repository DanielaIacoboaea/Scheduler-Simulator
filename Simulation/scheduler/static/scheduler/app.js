
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
                        barWidth={proc.executedPercentage.toString()}
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
            </React.Fragment>
        );
    }
}

function printSomething(parent){
    console.log("this gets executed with parameter: ", parent);
    return {"lala": "land"};
}


function schedulerNoTimeSlice(timer, allProcs, idx){
    if(idx < allProcs.length){

        const procs = allProcs.slice();

        // update parent timer
        const proc = procs[idx];
        const executed = proc.executed;
        let procDone = false;
        //console.log("procs: ", procs);
       // console.log("idx: ", idx);
       // console.log("proc: ", proc);
       // console.log("proc.executed: ", proc.executed);
        if(executed === 0){
            proc.startRunning = timer;
            const percentInc = (100 / proc.executionTime).toFixed(2);
            console.log("percentInc: ", percentInc);
            proc.percentage = parseFloat(percentInc);
            console.log("tyepe proc.percentage: ", typeof(proc.percentage));
            proc.executedPercentage = proc.percentage;
            console.log("executedPercentage: ", proc.executedPercentage);
            proc.executed = 1;
            proc.timeLeft = proc.executionTime;
            return {
                "updateProcs": procs,
                "procDone": procDone
            }
        }else{
            if (executed < proc.executionTime){
                proc.executedPercentage += proc.percentage;
                console.log("executedPercentage: ", proc.executedPercentage);
                proc.executed += 1;
                proc.timeLeft -= 1;
                return {
                    "updateProcs": procs,
                    "procDone": procDone
                }
            }else{
                proc.turnaround = timer - proc.arrivalTime;
                proc.response = proc.startRunning - proc.arrivalTime;
                proc.executedPercentage += proc.percentage;
                console.log("executedPercentage: ", proc.executedPercentage);
                procDone = true;
                return {
                    "updateProcs": procs,
                    "procDone": procDone
                }
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
            executionTime: ""

        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.runScheduler = this.runScheduler.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClickStart = this.handleClickStart.bind(this);
        this.deleteProc = this.deleteProc.bind(this);
    }
    
    deleteProc(procId){
        if(!this.state.running){
            const deleteProc = this.state.procs.slice();
            deleteProc.splice(procId, 1);
            this.setState(state => ({
                procs: deleteProc
            }));
        }
    }

    runScheduler(totalExecutionTime){

        if (this.state.timer === 0){
            this.setState(state => ({
                running: true
            }));
        }

        if(this.state.timer < totalExecutionTime){
            const scheduler = schedulerNoTimeSlice(this.state.timer, this.state.procs, this.state.currentProcessIdx);
            if (scheduler){
                console.log("scheduler: ", scheduler);
                console.log("scheduler.done: ", scheduler.procDone);
                if (scheduler.procDone){
                    this.setState(state => ({
                        procs: scheduler.updateProcs,
                        currentProcessIdx: state.currentProcessIdx + 1
                    }));
                }else{
                    this.setState(state => ({
                        procs: scheduler.updateProcs
                    }));
                }
            }else{
                if(this.state.timer === totalExecutionTime){
                    clearInterval(this.schedulerTimerId);
                    this.setState(state => ({
                        running: false,
                        timer: 0
                    }));
                }
            }
        }
    }

/*
    runScheduler(totalTime){
        if (this.state.schedulerTimer <= totalTime + 1){
            this.setState(state => ({
                schedulerTimer: state.schedulerTimer + 1
            }));
            const currentProcess = parseInt(this.state.currentProcessIdx);
            const executed = parseInt(this.state.allProcesses[currentProcess].executed);
            if (!executed){
                const updateAllProcesses = this.state.allProcesses.slice();
                updateAllProcesses[currentProcess].startRunning = (parseInt(this.state.schedulerTimer) - 1).toString();
                const percentageIncrease = (100 /  updateAllProcesses[currentProcess].executionTime).toFixed(2);
                updateAllProcesses[currentProcess].percentage= percentageIncrease.toString();
                updateAllProcesses[currentProcess].executed = "1";
                this.setState(state => ({
                    allProcesses: updateAllProcesses
                }));
            }else{
                if (executed < parseInt(this.state.allProcesses[currentProcess].executionTime)){
                    const updateAllProcessesCount = this.state.allProcesses.slice();
                    updateAllProcessesCount[currentProcess].executed = (parseInt(updateAllProcessesCount[currentProcess].executed) + 1).toString();
                    const updatePercentage = parseFloat(updateAllProcessesCount[currentProcess].executedPercentage) + parseFloat(updateAllProcessesCount[currentProcess].percentage);
                    updateAllProcessesCount[currentProcess].executedPercentage = updatePercentage.toString();
                    this.setState(state => ({
                        allProcesses: updateAllProcessesCount
                    }));
                }else if (executed === parseInt(this.state.allProcesses[currentProcess].executionTime)){
                    const endCurrentProc = this.state.allProcesses.slice();
                    const turnaroundProc = this.state.schedulerTimer - parseInt(endCurrentProc[currentProcess].arrivalTime);
                    const responseProc = parseInt(endCurrentProc[currentProcess].startRunning) - parseInt(endCurrentProc[currentProcess].arrivalTime);
                    endCurrentProc[currentProcess].turnaround = turnaroundProc.toString();
                    endCurrentProc[currentProcess].response = responseProc.toString();
                    endCurrentProc[currentProcess].executedPercentage = (parseFloat( endCurrentProc[currentProcess].executedPercentage) + parseFloat(endCurrentProc[currentProcess].percentage)).toString();
                    this.setState(state => ({
                        allProcesses: endCurrentProc,
                        currentProcessIdx: (parseInt(state.currentProcessIdx) + 1).toString()
                    }));
                }
            }
        }else{
            clearInterval(this.schedulerTimerId);
            this.setState(state => ({
                running: false,
                schedulerTimer: 0
            }));
        }
    }
*/
    handleSubmit(event){
        event.preventDefault();
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
            count: state.count + 1
        }));
    }

    handleChange(event){
        this.setState((state) => ({
            [event.target.name]: event.target.value
        }));
    }

    handleClickStart(){
        if (!this.state.running){
            this.setState(state => ({
                running: true
            }));
            this.state.procs.sort((a, b) => a.arrivalTime - b.arrivalTime);
            let totalExecutionTime = 0;
            for (let i = 0; i < this.state.procs.length; i++){
                totalExecutionTime += this.state.procs[i].executionTime;
            }
            this.schedulerTimerId = setInterval(() => this.runScheduler(totalExecutionTime), 1000);
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
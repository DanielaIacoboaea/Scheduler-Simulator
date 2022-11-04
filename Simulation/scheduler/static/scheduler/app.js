import Buttons from "./components/buttons";
import STCF from "./components/schedulerSTCF";
import RR from "./components/schedulerRR";
import MLFQ from "./components/schedulerMLFQ";
import SchedulerFIFOandSJF from "./components/schedulerRunToCompletion";
import ButtonsDefault from "./components/buttonsDefault";


/*
    Render the scheduler selected by user.
    Common parameters:
    - Arrival Time -> when the process should start (e.g: 0)
    - Execute Time -> how long the process should take (e.g: 10)
    - Quantum -> the time slice that a process can run (e.g: 3), only for RR and MLFQ
    - Boost -> time slice after which all the processes are moved to the top most queue(0) (e.g 5), only for MLFQ
    - Queues -> number of queues inside the scheduler (e.g 4), only for MLFQ
    - Turnaround Time -> Time Completion - Time Arrival 
    - Response Time -> Time First Run - Time Arrival
 */


class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            scheduler: "",
            prefilled: ""
        };
        this.renderScheduler = this.renderScheduler.bind(this);
        this.renderDefaultScheduler = this.renderDefaultScheduler.bind(this);
    }

    renderScheduler(name){
        this.setState((state) => ({
            scheduler: name
        }));
    }

    renderDefaultScheduler(name){
        const regSchedulers = ["FIFO", "SJF", "STCF", "RR", "MLFQ"];
        let prefillScheduler;
        let prefillType;

        for (let i = 0; i < regSchedulers.length; i++){
            if (name.match(regSchedulers[i])){
                prefillScheduler = name.match(regSchedulers[i]);
                if (name.match("Good")){
                    prefillType = 1;
                }else if(name.match("Bad")){
                    prefillType = 0;
                }
                break;
            }
        }
        
        this.setState((state) => ({
            scheduler: prefillScheduler[0],
            prefilled: ""
        }));
    }

    render(){
       
       const btnsSched = <Buttons handleRenderClick={this.renderScheduler} wrapperBtnsClass="wrapper-btns" schedulerId={this.state.scheduler}/>;
       const btns = <Buttons handleRenderClick={this.renderScheduler} wrapperBtnsClass="wrapper-btns-single"/>;
       const btnsWrapperSched = "wrapper";
       const btnsWrapper = "wrapper btns-single";

        return(
            <React.Fragment>
            <div>
                <h1>Scheduler Simulator</h1>
            </div>
           {
            this.state.scheduler === "FIFO"? <section className={btnsWrapperSched}>{btnsSched}<SchedulerFIFOandSJF sortBy="FIFO" alertColor="#6c757d" prefilled={this.state.prefilled} /></section>: 
            this.state.scheduler === "SJF"? <section className={btnsWrapperSched}>{btnsSched}<SchedulerFIFOandSJF sortBy="SJF" alertColor="#17a2b8" prefilled={this.state.prefilled} /></section>:
            this.state.scheduler === "STCF"? <section className={btnsWrapperSched}>{btnsSched}<STCF alertColor="#343a40" prefilled={this.state.prefilled} /></section>:
            this.state.scheduler === "RR"? <section className={btnsWrapperSched}>{btnsSched}<RR alertColor="#28a745" prefilled={this.state.prefilled} /></section>: 
            this.state.scheduler === "MLFQ"? <section className={btnsWrapperSched}>{btnsSched}<MLFQ alertColor="#dc3545" prefilled={this.state.prefilled} /></section>:
            <section className={btnsWrapper}>
                <h4 className="run-header">Learn how each scheduler works by getting the <span className="best-color">best</span> and <span className="worst-color">worst</span> case scenarios with <span className="prefilled-color">pre-filled</span> settings :</h4>
                <ButtonsDefault handleDefaultClick={this.renderDefaultScheduler}/>
                <h4 className="run-header">Run any scheduler with your own settings :</h4>{btns}
            </section>
          }
          </React.Fragment>
        );
    }
}


ReactDOM.render(<App />, document.querySelector("#app"))
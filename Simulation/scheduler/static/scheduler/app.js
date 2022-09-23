import Buttons from "./components/buttons";
import STCF from "./components/schedulerSTCF";
import RR from "./components/schedulerRR";
import MLFQ from "./components/schedulerMLFQ";
import SchedulerFIFOandSJF from "./components/schedulerRunToCompletion";


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
            this.state.scheduler === "FIFO"? <div className={btnsWrapperSched}>{btnsSched}<SchedulerFIFOandSJF sortBy="FIFO"/></div>: 
            this.state.scheduler === "SJF"? <div className={btnsWrapperSched}>{btnsSched}<SchedulerFIFOandSJF sortBy="SJF"/></div>:
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
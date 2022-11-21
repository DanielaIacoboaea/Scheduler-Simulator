import Buttons from "./components/buttons";
import STCF from "./components/schedulerSTCF";
import RR from "./components/schedulerRR";
import MLFQ from "./components/schedulerMLFQ";
import SchedulerFIFOandSJF from "./components/schedulerRunToCompletion";
import ButtonsDefault from "./components/buttonsDefault";
import ButtonsInfo from "./components/buttonsInfo";


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
            prefilled: "",
            subtitle: ""
        };
        this.renderScheduler = this.renderScheduler.bind(this);
        this.renderDefaultScheduler = this.renderDefaultScheduler.bind(this);
        this.returnToMainPage = this.returnToMainPage.bind(this);
        this.updateSubtitle = this.updateSubtitle.bind(this);
        this.activateTooltip = this.activateTooltip.bind(this);
        this.renderPasteScheduler = this.renderPasteScheduler.bind(this);
    }

    /*
        Render scheduler with custom settings
    */
    renderScheduler(name){
        this.setState((state) => ({
            scheduler: name,
            prefilled: "",
            subtitle: `Custom settings ${name}`
        }));
    }
    
    /*
        Render scheduler with default settings
    */
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

        fetch(`prefilled/${prefillScheduler[0]}/${prefillType}`)
        .then(res => res.json())
        .then(
          (result) => {
            if(prefillType === 1){
                this.setState((state) => ({
                    scheduler: prefillScheduler[0],
                    prefilled: result.default,
                    subtitle: `Best ${prefillScheduler[0]}`
                }));
            }else{
                this.setState((state) => ({
                    scheduler: prefillScheduler[0],
                    prefilled: result.default,
                    subtitle: `Worst ${prefillScheduler[0]}`
                }));
            }
          },
          (error) => {
            console.log("error: ", error);
          }
        )
    }

    /*
        Clear state and render the home page
     */
    returnToMainPage(){
        this.setState((state) => ({
            scheduler: "",
            prefilled: "",
            subtitle: ""
        }));
    }

    /*
        Change subtitle based on scheduler name and 
        type of settings:
         - prefilled
         - custom
     */
    updateSubtitle(){
        this.setState((state) => ({
            subtitle: `Custom settings ${state.scheduler}`
        }));
    }

    /*
        Add tooltip for input labels 
    */
    activateTooltip(){
        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();   
        });
    }

    /*
        Create prefilled settings and render the selected new scheduler,
        after the user copied the setup for a scheduler.
    */
    renderPasteScheduler(old_name, new_name, procs, slice, queues, boost){

        let processes = [];
        
        let procs_json = JSON.parse(procs);
        let procs_list = procs_json["Procs"];

        /*
            If the current scheduler has fewer general settings than the new scheduler,
            use the extra settings needed from input.
            If the current scheduler has more general settings than the new scheduler,
            remove them.
        */
        let pasteSlice;
        let pasteQueues;
        let pasteBoost;

        if(old_name === "RR"){

            pasteSlice = procs_json["Slice"];
            pasteQueues = queues;
            pasteBoost = boost;

        }else if (old_name === "MLFQ"){

            pasteSlice = procs_json["Slice"];
            pasteQueues = procs_json["Queues"];
            pasteBoost = procs_json["Boost"];
        }else{
            pasteSlice = slice;
            pasteQueues = queues;
            pasteBoost = boost;
        }

        /*
            Build list of prefilled processes.
        */
        for (let i = 0; i < procs_list.length; i++){

            processes.push({
                "id": procs_list[i].id,
                "arrivalTime": procs_list[i].Arrival,
                "executeTime": procs_list[i].Execute,
                "quantum": pasteSlice,
                "boost": pasteBoost,
                "queues": pasteQueues
            })
        }

        this.setState((state) => ({
            scheduler: new_name,
            prefilled: processes,
            subtitle: `Custom settings ${new_name}`
        }));
    }

    render(){

       /*
            Render buttons with different style:
            - buttons for each scheduler for home page 
            - butons for each scheduler, after 1 scheduler is rendered
        */
       const btnsSched = <Buttons 
                            handleRenderClick={this.renderScheduler} 
                            wrapperBtnsClass="wrapper-btns" 
                            schedulerId={this.state.scheduler} 
                            returnToMainPage={this.returnToMainPage}
                        />;

       const btns = <Buttons 
                        handleRenderClick={this.renderScheduler} 
                        wrapperBtnsClass="wrapper-btns-single"
                    />;

       const btnsWrapperSched = "wrapper";
       const btnsWrapper = "wrapper btns-single";
       const subtitleColors = {
            "FIFO": "#6c757d",
            "SJF": "#17a2b8",
            "STCF": "#343a40",
            "RR": "#28a745",
            "MLFQ": "#dc3545"
       }

        return(
            <React.Fragment>
                <header>
                    <h1 id="page-title">Scheduler Simulator</h1>
                    <h4 id="page-subtitle" style={{color: subtitleColors[this.state.scheduler]}} >{this.state.subtitle}</h4>
                </header>
                {
                    this.state.scheduler === "FIFO"? <section className={btnsWrapperSched}>
                                                        {btnsSched}
                                                        <SchedulerFIFOandSJF 
                                                        sortBy="FIFO" 
                                                        alertColor={subtitleColors[this.state.scheduler]}
                                                        prefilled={this.state.prefilled} 
                                                        updateSubtitle={this.updateSubtitle}
                                                        activateTooltip={this.activateTooltip}
                                                        pastePrefill={this.renderPasteScheduler}
                                                        key={this.state.scheduler}
                                                        />
                                                    </section>:
                    this.state.scheduler === "SJF"? <section className={btnsWrapperSched}>
                                                        {btnsSched}
                                                        <SchedulerFIFOandSJF 
                                                        sortBy="SJF" 
                                                        alertColor={subtitleColors[this.state.scheduler]}
                                                        prefilled={this.state.prefilled} 
                                                        updateSubtitle={this.updateSubtitle}
                                                        activateTooltip={this.activateTooltip}
                                                        pastePrefill={this.renderPasteScheduler}
                                                        />
                                                    </section>:
                    this.state.scheduler === "STCF"? <section className={btnsWrapperSched}>
                                                        {btnsSched}
                                                        <STCF 
                                                            alertColor={subtitleColors[this.state.scheduler]}
                                                            prefilled={this.state.prefilled} 
                                                            updateSubtitle={this.updateSubtitle}
                                                            activateTooltip={this.activateTooltip}
                                                            pastePrefill={this.renderPasteScheduler}
                                                        />
                                                    </section>:
                    this.state.scheduler === "RR"? <section className={btnsWrapperSched}>
                                                        {btnsSched}
                                                        <RR 
                                                            alertColor={subtitleColors[this.state.scheduler]}
                                                            prefilled={this.state.prefilled}
                                                            updateSubtitle={this.updateSubtitle} 
                                                            activateTooltip={this.activateTooltip}
                                                            pastePrefill={this.renderPasteScheduler}
                                                        />
                                                    </section>: 
                    this.state.scheduler === "MLFQ"? <section className={btnsWrapperSched}>
                                                        {btnsSched}
                                                        <MLFQ 
                                                            alertColor={subtitleColors[this.state.scheduler]}
                                                            prefilled={this.state.prefilled} 
                                                            updateSubtitle={this.updateSubtitle}
                                                            activateTooltip={this.activateTooltip}
                                                            pastePrefill={this.renderPasteScheduler}
                                                        />
                                                    </section>:
                    <section className={btnsWrapper}>
                        <h4 className="guide-header">
                            Learn how each scheduler works. <br /> 
                            Practice exemples with pre-filled settings for best and worst case scenarios to see them in action: 
                        </h4>
                        <ButtonsDefault handleDefaultClick={this.renderDefaultScheduler}/>
                        <h4 className="guide-header">
                            Now that you've got the hang of it, go ahead and run any scheduler with your own custom settings:
                        </h4>
                        {btns}
                        <p id="credits">
                            <p>Information based on the book: Operating Systems, Three easy pieces. </p>
                            <p>Author: Remzi Arpaci Dusseau.</p>
                            <p>If you want to learn more, check it out for further reference.</p>
                        </p>
                    </section>
                }
          </React.Fragment>
        );
    }
}


ReactDOM.render(<App />, document.querySelector("#app"))
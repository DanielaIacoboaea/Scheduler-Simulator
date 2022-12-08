import React from "react";

/*
    Buttons are used to navigate between schedulers and trigger 
    the render of the scheduler in their parent component
*/


export default class Buttons extends React.Component{
    constructor(props){
        super(props);
    }

    startScheduler = (event) => {
        this.props.handleRenderClick(event.target.id);
    }

    startDefaultScheduler = (event) => {
        this.props.handleDefaultClick(event.target.id);
    }

    render(){
        const btnsClass = [
            {
                "name": "FIFO",
                "class": "btn btn-outline-secondary btn-lg"
            },
            {
                "name": "SJF",
                "class": "btn btn-outline-info btn-lg"
            },
            {
                "name": "STCF",
                "class": "btn btn-outline-dark btn-lg"
            },
            {
                "name": "RR",
                "class": "btn btn-outline-success btn-lg"
            },
            {
                "name": "MLFQ",
                "class": "btn btn-outline-danger btn-lg"
            }
        ];

        const btnsClassGood =  {
            "FIFO": "btn btn-outline-secondary btn-lg",
            "SJF": "btn btn-outline-info btn-lg",
            "STCF": "btn btn-outline-dark btn-lg",
            "RR": "btn btn-outline-success btn-lg",
            "MLFQ": "btn btn-outline-danger btn-lg"
        }

        const btnsClassBad =  {
            "FIFO": "btn btn-outline-secondary btn-lg",
            "SJF": "btn btn-outline-info btn-lg",
            "STCF": "btn btn-outline-dark btn-lg",
            "RR": "btn btn-outline-success btn-lg",
            "MLFQ": "btn btn-outline-danger btn-lg"
        }

        /*
            Change button style to reflect the active scheduler
        */
        if (this.props.wrapperBtnsClass === "wrapper-btns"){
            let activeScheduler = this.props.schedulerId;
            let prefilled = this.props.prefilledType;

            if (prefilled !== ""){

                if (prefilled === "Good"){
                    btnsClassGood[activeScheduler] = btnsClassGood[activeScheduler].replace("-outline", "");
                }else{
                    btnsClassBad[activeScheduler] = btnsClassBad[activeScheduler].replace("-outline", "");
                }

            }else{

                for(let i = 0; i < btnsClass.length; i++){
                    if(btnsClass[i].name === activeScheduler){
                        btnsClass[i].class = btnsClass[i].class.replace("-outline", "");
                    }
                }
            }
        }

        if(this.props.wrapperBtnsClass === "wrapper-btns"){
            return(
                <div className={this.props.wrapperBtnsClass}>
                    <nav className="navigation-sched-page">
                        <a role="button" onClick={this.props.returnToMainPage}>
                            <span class="material-symbols-outlined icon-back">arrow_back_ios</span>
                        </a>
                        {btnsClass.map((btnClass) => 
                            <React.Fragment>
                                <button
                                    type="button" 
                                    className={btnClass.class} 
                                    id={btnClass.name} 
                                    onClick={this.startScheduler}>
                                    {btnClass.name}
                                </button>
                                <div className="prefilled-sched-btns">
                                    <button 
                                    type="button" 
                                    className={btnsClassGood[btnClass.name]} 
                                    id={`${btnClass.name}Good`} 
                                    onClick={this.startDefaultScheduler}>
                                        Best 
                                    </button>
                                    <button
                                        type="button" 
                                        className={btnsClassBad[btnClass.name]} 
                                        id={`${btnClass.name}Bad`} 
                                        onClick={this.startDefaultScheduler}>
                                            Worst 
                                    </button>
                                </div>
                            </React.Fragment>
                        )}
                    </nav>
                </div>
            );
        }else{
            return(
                <nav className={this.props.wrapperBtnsClass}>
                    {btnsClass.map((btnClass) => 
                        <button 
                            type="button" 
                            className={btnClass.class} 
                            id={btnClass.name} 
                            onClick={this.startScheduler}>
                            {btnClass.name}
                        </button>
                    )}
                </nav>
            );
        }
    }
}
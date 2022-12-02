import React from "react";

/*
    Buttons are used to navigate between schedulers and trigger 
    the render of the scheduler in their parent component
*/


export default class Buttons extends React.Component{
    constructor(props){
        super(props);
        this.startScheduler = this.startScheduler.bind(this);
    }

    startScheduler(event){
        this.props.handleRenderClick(event.target.id);
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

        /*
            Change button style to reflect the active scheduler
        */
        if (this.props.wrapperBtnsClass === "wrapper-btns"){
            let activeScheduler = this.props.schedulerId;

            for(let i = 0; i < btnsClass.length; i++){
                if(btnsClass[i].name === activeScheduler){
                    btnsClass[i].class = btnsClass[i].class.replace("-outline", "");
                }
            }
        }

        return(
            <nav className={this.props.wrapperBtnsClass}>
                {this.props.wrapperBtnsClass === "wrapper-btns" &&
                    <a role="button" onClick={this.props.returnToMainPage}>
                        <span class="material-symbols-outlined icon-back">arrow_back_ios</span>
                    </a>
                }
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
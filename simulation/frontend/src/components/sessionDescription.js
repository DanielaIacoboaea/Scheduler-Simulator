import React from "react";

/*
    Buttons are used to navigate to scheduler with pre-filled settings
 */


export default class Description extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        
        const descriptions ={
            "FIFO": {
                "Good": "Good",
                "Bad": "Bad"
            },
            "SJF": {
                "Good": "Good",
                "Bad": "Bad"
            },
            "STCF": {
                "Good": "Good",
                "Bad": "Bad"
            },
            "RR": {
                "Good": "Good",
                "Bad": "Bad"
            },
            "MLFQ": {
                "Good": "Good",
                "Bad": "Bad"
            }
        };

        return(
            <article className="card card-body sessionDescription">
                <p className="scheduler-info">
                    {descriptions[this.props.sched][this.props.type]}
                </p>
            </article>
        );
    }
}
import React from "react";
import ProgressBar from "./progressBar";
import Description from "./sessionDescription";

/*
    Render all progress bars for the FIFO, SJF, STCF and RR Schedulers.
    Show averages running times for each process and per session, 
    when they are available.
 */

export default class RenderProgressBars extends React.Component{
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
            {/* Render progress bars and process information */}
            {this.props.procs.map((proc) =>
                <React.Fragment>
                <div className="results">
                    <p style={{color: proc.color}}>P{proc.id} </p>
                    <p>A: <span style={{color: proc.color}}>{proc.arrivalTime}</span> </p>
                    <p>E: <span style={{color: proc.color}}>{proc.executionTime}</span> </p>
                </div>
                <div className="process">
                    <div>
                        <span class="material-symbols-outlined icon-delete" style={{color: this.props.colorDeleteIcon}} id={proc.id} onClick={this.handleDeleteClick}>delete</span>
                    </div>
                    <ProgressBar
                        barWidth={proc.executedPercentage.toFixed()}
                        ariaValuenow={proc.executed.toString()}
                        barColor={proc.color}
                        procId={proc.id}
                    />
                    {proc.turnaround || proc.turnaround === 0? 
                        <div className="results">
                            {/* Render results if the process ran to completion */}
                            <p>T: <span style={{color: proc.color}}>{proc.turnaround}</span> </p>
                            <p>R: <span style={{color: proc.color}}>{proc.response}</span> </p>
                        </div>:
                        <div className="results">
                        </div>
                    }
                </div>
                </React.Fragment>
                )
            }
            {/* Render avg session results if we have them */}
            {this.props.prefilledType?
                <Description sched={this.props.name}
                            type={this.props.prefilledType}
                />:
                <div className="results avgs">
                </div>
            }
            {this.props.avgTurnaround?
                <div className="results avgs" style={{backgroundColor: this.props.alertColor}}>
                    <p>Average Turnaround Time : {this.props.avgTurnaround.toFixed(2)} </p>
                    <p>Average Response Time : {this.props.avgResponse.toFixed(2)} </p>
                </div>:
                <div className="results avgs">
                </div>
            }
            </React.Fragment>
        );
    }
}
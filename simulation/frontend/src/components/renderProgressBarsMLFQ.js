import React from "react";
import ProgressBar from "./progressBar";
import Description from "./sessionDescription";

/*
    Render all progress bars for the MLFQ Scheduler.
    Difference between this component and the renderProgressBars:
    - this component reflects how each progress bar progresses within its queue
*/

export default class RenderProgressBarsMLFQ extends React.Component{
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
            {/* Render each progress bar inside the queue that it belongs to*/}
            {this.props.queues.map((queue, index) => {
                return(
                    <React.Fragment>
                    <p>Q {index}</p>
                    <div className="process mlfq-process">
                    {queue.map((proc) =>
                            <ProgressBar
                            barWidth={proc.executedPercentage.toFixed()}
                            ariaValuenow={proc.executed.toString()}
                            barColor={proc.color}
                            procId={proc.id}
                            />
                    )}
                    </div>
                    </React.Fragment>
                    )
                })
            }
            {/* Render process information */}
            {this.props.procs.map((proc) =>
                <div className="process">
                    <div>
                        <span class="material-symbols-outlined icon-delete" style={{color: this.props.colorDeleteIcon}} id={proc.id} onClick={this.handleDeleteClick}>delete</span>
                    </div>
                    <div className="results">
                            <p style={{color: proc.color}}>P{proc.id} </p>
                            <p>A: <span style={{color: proc.color}}>{proc.arrivalTime}</span> </p>
                            <p>E: <span style={{color: proc.color}}>{proc.executionTime}</span> </p>
                    </div>
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
import ProgressBar from "./components/progressBar";

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
                    {proc.turnaround || proc.turnaround === 0? 
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
                    <span style={{color: "#6c757d"}}><p>Avg T: {this.props.avgTurnaround.toFixed(2)} </p></span>
                    <span style={{color: "#343a40"}}><p>Avg R: {this.props.avgResponse.toFixed(2)} </p></span>
                </div>:
                <div className="results avgs">
                </div>
            }
            </React.Fragment>
        );
    }
}
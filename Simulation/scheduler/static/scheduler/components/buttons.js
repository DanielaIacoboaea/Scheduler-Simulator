
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
        return(
            <nav className={this.props.wrapperBtnsClass}>
                {this.props.wrapperBtnsClass === "wrapper-btns" &&
                    <a href="" role="button"><span class="material-symbols-outlined icon-back">arrow_back_ios</span></a>
                }
                <button type="button" className="btn btn-outline-secondary btn-lg" id="FIFO" onClick={this.startScheduler}>FIFO</button>
                <button type="button" className="btn btn-outline-info btn-lg" id="SJF" onClick={this.startScheduler}>SJF</button>
                <button type="button" className="btn btn-outline-dark btn-lg" id="STCF" onClick={this.startScheduler}>STCF</button>
                <button type="button" className="btn btn-outline-success btn-lg" id="RR" onClick={this.startScheduler}>RR</button>
                <button type="button" className="btn btn-outline-danger btn-lg" id="MLFQ" onClick={this.startScheduler}>MLFQ</button>
            </nav>
        );
    }
}
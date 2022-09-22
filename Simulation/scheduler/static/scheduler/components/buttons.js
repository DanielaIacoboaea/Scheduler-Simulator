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
            <div className={this.props.wrapperBtnsClass}>
                <button type="button" className="btn btn-outline-secondary btn-lg" id="FIFO" onClick={this.startScheduler}>FIFO</button>
                <button type="button" className="btn btn-outline-info btn-lg" id="SJF" onClick={this.startScheduler}>SJF</button>
                <button type="button" className="btn btn-outline-dark btn-lg" id="STCF" onClick={this.startScheduler}>STCF</button>
                <button type="button" className="btn btn-outline-success btn-lg" id="RR" onClick={this.startScheduler}>RR</button>
                <button type="button" className="btn btn-outline-danger btn-lg" id="MLFQ" onClick={this.startScheduler}>MLFQ</button>
            </div>
        );
    }
}
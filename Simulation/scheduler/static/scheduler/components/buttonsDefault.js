
/*
    Buttons are used to navigate between schedulers and trigger 
    the render of the scheduler in their parent component
 */


export default class ButtonsDefault extends React.Component{
    constructor(props){
        super(props);
        this.startDefaultScheduler = this.startDefaultScheduler.bind(this);
    }

    startDefaultScheduler(event){
        this.props.handleDefaultClick(event.target.id);
    }

    render(){
        return(
            <div className="wrapper-btns-default">
                <div className="btns-default">
                    <button type="button" className="btn btn-secondary" id="FIFODefaultGood" onClick={this.startDefaultScheduler}>Best FIFO</button>
                    <button type="button" className="btn btn-secondary" id="FIFODefaultBad" onClick={this.startDefaultScheduler}>Worst FIFO</button>
                </div>
                <div className="btns-default">
                    <button type="button" className="btn btn-info" id="SJFDefaultGood" onClick={this.startDefaultScheduler}>Best SJF</button>
                    <button type="button" className="btn btn-info" id="SJFDefaultBad" onClick={this.startDefaultScheduler}>Worst SJF</button>
                </div>
                <div className="btns-default">
                    <button type="button" className="btn btn-dark" id="STCFDefaultGood" onClick={this.startDefaultScheduler}>Best STCF</button>
                    <button type="button" className="btn btn-dark" id="STCFDefaultBad" onClick={this.startDefaultScheduler}>Worst STCF</button>
                </div>
                <div className="btns-default">
                    <button type="button" className="btn btn-success" id="RRDefaultGood" onClick={this.startDefaultScheduler}>Best RR</button>
                    <button type="button" className="btn btn-success" id="RRDefaultBad" onClick={this.startDefaultScheduler}>Worst RR</button>
                </div>
                <div className="btns-default">
                    <button type="button" className="btn btn-danger" id="MLFQDefaultGood" onClick={this.startDefaultScheduler}>Best MLFQ</button>
                    <button type="button" className="btn btn-danger" id="MLFQDefaultBad" onClick={this.startDefaultScheduler}>Worst MLFQ</button>
                </div>
            </div>
        );
    }
}

/*
    Buttons are used to navigate to scheduler with pre-filled settings
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

        const btnsDefaultClass = [
            {
                "name": "FIFO",
                "class": "btn btn-secondary"
            },
            {
                "name": "SJF",
                "class": "btn btn-info"
            },
            {
                "name": "STCF",
                "class": "btn btn-dark"
            },
            {
                "name": "RR",
                "class": "btn btn-success"
            },
            {
                "name": "MLFQ",
                "class": "btn btn-danger"
            }
        ];

        return(
            <section className="wrapper-btns-default">
                {btnsDefaultClass.map((btnDefault) => 
                    <div className="btns-default">
                        <button 
                            type="button" 
                            className={btnDefault.class} 
                            id={`${btnDefault.name}Good`} 
                            onClick={this.startDefaultScheduler}>
                                Best {btnDefault.name}
                        </button>
                        <button 
                            type="button" 
                            className={btnDefault.class} 
                            id={`${btnDefault.name}Bad`} 
                            onClick={this.startDefaultScheduler}>
                                Worst {btnDefault.name}
                        </button>
                    </div>
                )}
            </section>
        );
    }
}
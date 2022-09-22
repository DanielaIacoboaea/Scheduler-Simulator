export default class ProgressBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            style: {
                width: "0%",
                ariaValuenow: "0",
                ariaValuemin: "0",
                ariaValuemax: "100",
                backgroundColor: "",
            }
        };
    }

    componentDidMount(){
        const updateWidth = `${this.props.barWidth}%`;
        this.setState((state, props) => ({
            style: {
                width: updateWidth,
                ariaValuenow: this.props.ariaValuenow,
                backgroundColor: this.props.barColor
            }
        }));
    }

    componentDidUpdate(prevProps){
        const updateWidth = `${this.props.barWidth}%`;
        if(this.props.barWidth != prevProps.barWidth){
            this.setState((state, props) => ({
                style: {
                    width: updateWidth,
                    ariaValuenow: this.props.ariaValuenow,
                    backgroundColor: this.props.barColor
                }
            }));
        }
    }

    render(){
        return (
            <div className="progress w-100">
                <div className="progress-bar" role="progressbar" style={this.state.style}>{this.state.style.width}</div>
            </div>
        );
    };
}
import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import schedulerNoTimeSlice from "./components/schedulerNoTimeSlice";

export default class RR extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
            barWidth="90%"
            ariaValuenow="90"
        />
        );
    }
}
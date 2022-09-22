import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import schedulerNoTimeSlice from "./components/schedulerNoTimeSlice";

export default class MLFQ extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
                barWidth="100%"
                ariaValuenow="100"
            />
        );
    }
}
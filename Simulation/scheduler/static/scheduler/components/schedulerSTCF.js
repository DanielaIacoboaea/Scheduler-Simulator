import colors from "./components/colors";
import RenderProgressBars from "./components/renderProgressBars";
import schedulerNoTimeSlice from "./components/schedulerNoTimeSlice";

export default class STCF extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        };
    }
    render(){
        return(
            <ProgressBar  
                barWidth="70%"
                ariaValuenow="70"
            />
        );
    }
}
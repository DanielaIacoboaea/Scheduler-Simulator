import React from "react";

export default class TimeTooltip extends React.Component{
    render(){
        return (
            <div className="results-desc">
                <button 
                    id="icon-time" 
                    type="button" 
                    className="btn btn-secondary" 
                    data-toggle="tooltip" 
                    data-placement="top" 
                    data-html="true" 
                    title="<em>Turnaround Time: </em> <br /><strong>T</strong>=T<sub>arrival</sub> - T<sub>completion</sub> <br /> <em>Response Time: <em> <br /><strong>R</strong>=T<sub>arrival</sub> - T<sub>first run</sub>">
                        Time
                </button>
            </div>
        );
    }
}
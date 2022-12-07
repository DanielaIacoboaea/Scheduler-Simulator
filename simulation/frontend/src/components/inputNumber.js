import React from "react";

export default class Input extends React.Component{
    constructor(props){
        super(props);
    }
   
    render(){
        return(
            <React.Fragment>
                <label data-toggle="tooltip" data-placement="top" title={this.props.title}>
                    {this.props.label} 
                </label>
                <input
                    type="number"
                    name={this.props.name}
                    id={this.props.id}
                    onChange={this.props.handleChange}
                    value={this.props.value}
                    disabled={this.props.disabled}
                    min={this.props.min}
                    max={this.props.max}
                    autocomplete="off"
                    required
                />
            </React.Fragment>
        );
    }

}
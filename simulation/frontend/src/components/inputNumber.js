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
                    onInput={this.props.handleChange}
                    value={this.props.value}
                    disabled={this.props.disabled}
                    min={this.props.min}
                    max={this.props.max}
                    valid={this.va}
                    autocomplete="off"
                    required
                />
            </React.Fragment>
        );
    }

}
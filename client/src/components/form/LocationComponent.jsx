import React from "react";

class LocationComponent extends React.Component {
    render(){
        return (
            <React.Fragment>
                <input
                    className="input"
                    type="text"
                    placeholder="Location of the job"
                    value={this.props.location}
                    onChange={e => this.props.onChange(e, "location")}
                    required={!this.props.remote}
                />
                <label className="checkbox-container">
                    <input type="checkbox" checked={this.props.remote} onChange={e => this.props.toggle("remote")} />
                    <span className="checkmark" />
                    <p>{this.props.location ? "Or Remote/anywhere" : "Remote/anywhere"}</p>
                </label>
            </React.Fragment>
        )
    }
}

export default LocationComponent;
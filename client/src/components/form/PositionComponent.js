import React from "react";

class PositionComponent extends React.Component {
    render(){
        return (
            <label className="create-job__input--label"><span className="create-job__input--span">Position</span>
                <input
                    className="input"
                    type="text"
                    required
                    placeholder="Software engineer, mobile application developer..."
                    value={this.props.position}
                    onChange={e => this.props.onChange(e, "position")}
                />
            </label>
        )
    }
}

export default PositionComponent;
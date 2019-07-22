import React from "react";

class ApplyUrlComponent extends React.Component {
    render(){
        return (
            <label className="create-job__input--label"><span className="create-job__input--span">Apply url</span>
                <input onChange={e => this.props.onChange(e, "apply_url")} value={this.props.apply_url} required className="input" type="text" placeholder="Where people can apply" />
            </label>
        )
    }
}

export default ApplyUrlComponent;
import React from "react";

class JobTypeComponent extends React.Component {
    render(){
        return (
            <React.Fragment>
                <label className="create-job__input--label less-margin"><span className="create-job__input--span">Job type</span></label>
                <div className="create-job__checkbox">
                    <label className="radio-container">
                        <input value="FULL_TIME" onChange={e => this.props.onChange(e, "job_types")} checked={this.props.job_types.includes("FULL_TIME")} type="checkbox" />
                        <span className="checkmarked">
                            <p>Full time</p>
                        </span>
                    </label>
                    <label className="radio-container">
                        <input value="PART_TIME" onChange={e => this.props.onChange(e, "job_types")} checked={this.props.job_types.includes("PART_TIME")} type="checkbox" />
                        <span className="checkmarked">
                            <p>Part-time</p>
                        </span>
                    </label>
                    <label className="radio-container">
                        <input value="FREELANCE" onChange={e => this.props.onChange(e, "job_types")} checked={this.props.job_types.includes("FREELANCE")} type="checkbox" />
                        <span className="checkmarked">
                            <p>Freelance</p>
                        </span>
                    </label>
                    <label className="radio-container">
                        <input value="CONTRACT" onChange={e => this.props.onChange(e, "job_types")} checked={this.props.job_types.includes("CONTRACT")} type="checkbox" />
                        <span className="checkmarked">
                            <p>Contract</p>
                        </span>
                    </label>
                    <label className="radio-container">
                        <input value="UNSPECIFIED" onChange={e => this.props.onChange(e, "job_types")} checked={this.props.job_types.includes("UNSPECIFIED")} type="checkbox" />
                        <span className="checkmarked">
                            <p>Unspecified</p>
                        </span>
                    </label>
                </div>
            </React.Fragment>
        )
    }
}

export default JobTypeComponent;
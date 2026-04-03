import React from "react";

class SelectCategoryComponent extends React.Component {
    render(){
        return (
            <React.Fragment>
                <label className="create-job__input--label"><span className="create-job__input--span">Category</span></label>
                <select value={this.props.category} onChange={e => this.props.onChange(e, "category")}>
                    <option value={"DATA_SCIENTIST"}>Data scientist</option>
                    <option value={"AI_RESEARCHER"}>AI Researcher</option>
                    <option value={"INTELLIGENCE_SPECIALIST"}>Intelligence specialist</option>
                    <option value={"AI_DATA_ANALYST"}>AI Data Analyst</option>
                    <option value={"MACHINE_LEARNING_ENGINEER"}>Machine Learning Engineer</option>
                    <option value={"SOFTWARE_ENGINEER"}>Software Engineer</option>
                </select>
            </React.Fragment>
        )
    }
}

export default SelectCategoryComponent;
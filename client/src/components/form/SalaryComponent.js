import React from "react";

class SalaryComponent extends React.Component {
    render(){
        return (
            <label className="create-job__input--label"><span className="create-job__input--span">Salary</span> 
                    Switch to range: <input type="checkbox" checked={this.props.isRange} onChange={this.props.rangeOnChange}/>
                
                <input className="input" type="text" type="number" placeholder={this.props.isRange ? "Type the minimum salary" : "Type the salary here"} 
                    onChange={e => this.props.onChange(e,"min_salary")}
                    disabled={this.props.salaryInputDisabled}
                    value={this.props.min_salary}
                    required
                />
                {
                    !this.props.isRange ? null
                    : <input className="input" type="text" type="number" placeholder="Type the maximum salary"
                        onChange={e => this.props.onChange(e, "max_salary")}
                        disabled={this.props.salaryInputDisabled}
                        value={this.props.max_salary}
                        required
                    /> 
                }
                <select value={this.props.salary_currency} onChange={e => this.setState({salary_currency: e.target.value})} disabled={this.props.salaryInputDisabled}>
                    <option value="DOLLAR">Dollar</option>
                    <option value="EURO">Euro</option>
                </select>
                <label className="checkbox-container">
                    <input type="checkbox" checked={this.props.salaryInputDisabled} onChange={() => this.props.toggle("salaryInputDisabled")}/>
                    <span className="checkmark" />
                        <p className="checkmark-text">Do not show salary
                    </p>
                </label>						
            </label>
        )
    }
}

export default SalaryComponent;
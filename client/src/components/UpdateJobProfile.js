import React from "react";
import { withApollo, Mutation, Query } from "react-apollo";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { JOB_QUERY, UPDATE_JOB_MUTATION } from "../Queries";
import RichEditor from "./RichEditor";
import { convertToHTML } from "draft-convert";
import LoadingAnimation from "./LoadingAnimation";

class _UpdateJobProfile extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            position: "123",
            editorState: undefined,
            location: "",
            salaryInputDisabled: false,
            min_salary: undefined,
            max_salary: undefined,
            remote: false,
            salary_currency: "",
            job_types: [],
            apply_url: "",
            loading: false,
            job: undefined,
            loading_all: true
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
	onChange(e,key){
		if (key.indexOf("salary") !== -1 && Number(e.target.value) < 0) e.target.value = 0
		if (key === "job_types"){
			e.persist()
			this.setState(prevState => {
				let val = e.target.value
				if (prevState.job_types.includes(val)){
					prevState.job_types = prevState.job_types.filter(x => x !== val)
				} else {
					prevState.job_types.push(val)
				}
				return prevState
			})
		} else {
			this.setState({
				[key]: e.target.value
			})
		}
	}
    async componentDidMount(){
        let res = await this.props.client.query({
            query: JOB_QUERY,
            variables:{
                id: this.props.match.params.id
            }
        })
        let job = res.data.job;
        console.log(job,55555);
        this.setState({
            position: job.position,
            location: job.location,
            min_salary: job.min_salary,
            max_salary: job.max_salary,
            salary_currency: job.salary_currency, 
            salaryInputDisabled: !job.min_salary,
            job_types: job.job_types,
            remote: job.remote,
            apply_url: job.apply_url,
            htmlContent: job.description,
            loading_all: false,
            isRange: Boolean(job.max_salary)
        },console.log)
        console.log(job, 11, job.position,1234);
    }
    async onSubmit(e){
        e.preventDefault();
        this.setState({
            loading: true
        })
        let variables = {
            id: this.props.match.params.id,
            position: this.state.position,
            remote: this.state.remote,
            location: this.state.location,
			min_salary: this.state.salaryInputDisabled ? null : Number(this.state.min_salary),
            max_salary: this.state.salaryInputDisabled ? null : Number(this.state.max_salary),
            salary_currency: this.state.salary_currency,
            job_types: this.state.job_types,
            apply_url: this.state.apply_url
        }
        if (this.state.editorState) variables.description = convertToHTML(this.state.editorState.getCurrentContent())
        console.log(variables);
        let res = await this.props.client.mutate({
            mutation: UPDATE_JOB_MUTATION,
            variables
        })
        this.props.history.push(`/job/${res.data.updateJob.id}`);
        console.log(res,555);
    }
    render(){
        console.log(this.state.salary,555,this.state);
        return (
                <div className="create-job__layout">
                    <form onSubmit={this.onSubmit}>
                        <h4>Create job</h4>
                        <div className="create-job">
                            <h5>{window.__PUBLIC_DATA__.above_job_position_text}</h5>
                            <center style={{display: this.state.loading_all ? "block" : "none"}}><LoadingAnimation loading_type={2}/></center>
                            <div style={{display: this.state.loading_all ? "none" : "block"}}>
                                <div>
                                    <div className="create-job__input">
                                        <label className="create-job__input--label"><span className="create-job__input--span">Position</span>
                                            <input
                                                className="input"
                                                type="text"
                                                required
                                                placeholder="Software engineer, mobile application developer..."
                                                value={this.state.position}
                                                onChange={e => this.onChange(e, "position")}
                                            />
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">JOB DESCRIPTION</span>
                                        
                                            {
                                                this.state.htmlContent && <RichEditor htmlContent={this.state.htmlContent} onChangeParentApp={editorState => this.setState({ editorState })} />
                                            }
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Location</span>
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Location of the job"
                                                value={this.state.location}
                                                onChange={e => this.onChange(e, "location")}
                                                required={!this.state.remote}
                                            />
                                            <label className="checkbox-container">
                                                <input type="checkbox" checked={this.state.remote} onChange={e => {
                                                    this.setState(prevState => {
                                                        prevState.remote = !prevState.remote;
                                                        return prevState;
                                                    })
                                                }} />
                                                <span className="checkmark" />
                                                <p>{this.state.location ? "Or Remote/anywhere" : "Remote/anywhere"}</p>
                                            </label>
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
                                            Switch to range: <input type="checkbox" checked={this.state.isRange} onChange={e => {
                                                this.setState(prevState => {
                                                    prevState.isRange = !prevState.isRange
                                                    prevState.max_salary = undefined;
                                                    return prevState;
                                                })
                                            }} />

                                            <input className="input" type="text" type="number" placeholder={this.state.isRange ? "Type the minimum salary" : "Type the salary here"}
                                                onChange={e => this.onChange(e, "min_salary")}
                                                disabled={this.state.salaryInputDisabled}
                                                value={this.state.min_salary}
                                                required
                                            />
                                            {
                                                !this.state.isRange ? null
                                                    : <input className="input" type="text" type="number" placeholder="Type the maximum salary"
                                                        onChange={e => this.onChange(e, "max_salary")}
                                                        disabled={this.state.salaryInputDisabled}
                                                        value={this.state.max_salary}
                                                        required
                                                    />
                                            }
                                            <select value={this.state.salary_currency} onChange={e => this.onChange(e, "salary_currency")} disabled={this.state.salaryInputDisabled}>
                                                <option value="DOLLAR">Dollar</option>
                                                <option value="EURO">Euro</option>
                                            </select>
                                            <label className="checkbox-container">
                                                <input type="checkbox" checked={this.state.salaryInputDisabled} onChange={e => this.setState(nextState => {
                                                    nextState.salaryInputDisabled = !nextState.salaryInputDisabled
                                                    return nextState;
                                                })} />
                                                <span className="checkmark" />
                                                <p className="checkmark-text">Do not show salary
                                                </p>
                                            </label>
                                        </label>
                                        <label className="create-job__input--label less-margin"><span className="create-job__input--span">Job type</span></label>
                                        <div className="create-job__checkbox">
                                            <label className="radio-container">
                                                <input value="FULL_TIME" onChange={e => this.onChange(e, "job_types")} checked={this.state.job_types.includes("FULL_TIME")} type="checkbox" />
                                                <span className="checkmarked">
                                                    <p>Full time</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="PART_TIME" onChange={e => this.onChange(e, "job_types")} checked={this.state.job_types.includes("PART_TIME")} type="checkbox" />
                                                <span className="checkmarked">
                                                    <p>Part-time</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="FREELANCE" onChange={e => this.onChange(e, "job_types")} checked={this.state.job_types.includes("FREELANCE")} type="checkbox" />
                                                <span className="checkmarked">
                                                    <p>Freelance</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="CONTRACT" onChange={e => this.onChange(e, "job_types")} checked={this.state.job_types.includes("CONTRACT")} type="checkbox" />
                                                <span className="checkmarked">
                                                    <p>Contract</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="UNSPECIFIED" onChange={e => this.onChange(e, "job_types")} checked={this.state.job_types.includes("UNSPECIFIED")} type="checkbox" />
                                                <span className="checkmarked">
                                                    <p>Unspecified</p>
                                                </span>
                                            </label>
                                        </div>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Apply url</span>
                                            <input onChange={e => this.onChange(e, "apply_url")} value={this.state.apply_url} required className="input" type="text" placeholder="Where people can apply" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="company-info">
                                <div className="text-center">
                                    {
                                        this.state.loading ? <LoadingAnimation loading_type={2}/>
                                            : <button style={{ width: "100%" }} type="submit" className="button blue">Update job posting</button>
                                    }
                                </div>
                            </div>
                            </div>
                    </form>
                </div>
        );
    }
}

export default compose(withApollo,withRouter)(_UpdateJobProfile);
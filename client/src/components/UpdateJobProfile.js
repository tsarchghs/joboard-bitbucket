import React from "react";
import { withApollo, Mutation, Query } from "react-apollo";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { JOB_QUERY, UPDATE_JOB_QUERY } from "../Queries";
import RichEditor from "./RichEditor";
import { convertToHTML } from "draft-convert";

class _UpdateJobProfile extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            position: "123",
            editorState: undefined,
            location: "",
            locationInputDisabled: true,
            salary: undefined,
            job_type: "",
            apply_url: "",
            loading: false,
            job: undefined,
            loading_all: true
        }
        this.toggleLocationInput = this.toggleLocationInput.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    toggleLocationInput() {
        if (this.state.locationInputDisabled) {
            this.setState({
                locationInputDisabled: false,
                location: ""
            })
        } else {
            this.setState({
                locationInputDisabled: true,
                location: ""
            })
        }
    }
    onChange(e, key) {
        if (key === "salary" && Number(e.target.value) < 0) e.target.value = 0
        this.setState({
            [key]: e.target.value
        })
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
            salary: job.salary,
            job_type: job.job_type,
            apply_url: job.apply_url,
            htmlContent: job.description,
            loading_all: false,
            locationInputDisabled: job.location === "remote/everywhere"
        },console.log)
        console.log(job, 11, job.position,1234);
    }
    async onSubmit(e){
        e.preventDefault();
        this.setState({
            loading: true
        })
        let job_description_html_output;
        if (!this.state.editorState) job_description_html_output = `<h3>No description</h3`
        else job_description_html_output = convertToHTML(this.state.editorState.getCurrentContent())
        console.log(this.state.job_type,5599);
        let res = await this.props.client.mutate({
            mutation: UPDATE_JOB_QUERY,
            variables: {
                id: this.props.match.params.id,
                position: this.state.position,
                description: job_description_html_output,
                location: this.state.location,
                salary: Number(this.state.salary),
                job_type: this.state.job_type,
                apply_url: this.state.apply_url
            }
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
                            <h5>Hire the flutters. Share your job post with many of job seekers.</h5>
                            <center style={{display: this.state.loading_all ? "block" : "none"}}><img alt="" src="/assets/toolkit/images/loading_blue.gif" /></center>
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
                                                disabled={this.state.locationInputDisabled}
                                            />
                                            <label className="checkbox-container">
                                                <input type="checkbox" defaultChecked="checked" checked={this.state.location} onChange={this.toggleLocationInput} />
                                                <span className="checkmark" />
                                                <p>Remote/anywhere</p>
                                            </label>
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
                                            <input className="input" type="text" type="number" placeholder="Type the salary here"
                                                onChange={e => this.onChange(e, "salary")}
                                                value={this.state.salary}
                                                required
                                            />
                                        </label>
                                        <label className="create-job__input--label less-margin"><span className="create-job__input--span">Job type</span></label>
                                        <div className="create-job__checkbox">
                                            <label className="radio-container">
                                                <input value="FULL_TIME" onChange={e => this.onChange(e, "job_type")} checked={this.state.job_type === "FULL_TIME"} type="radio" name="radio" />
                                                <span className="checkmarked">
                                                    <p>Full time</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="PART_TIME" onChange={e => this.onChange(e, "job_type")} checked={this.state.job_type === "PART_TIME"} type="radio" name="radio" />
                                                <span className="checkmarked">
                                                    <p>Part-time</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="FREELANCE" onChange={e => this.onChange(e, "job_type")} checked={this.state.job_type === "FREELANCE"} type="radio" name="radio" />
                                                <span className="checkmarked">
                                                    <p>Freelance</p>
                                                </span>
                                            </label>
                                            <label className="radio-container">
                                                <input value="CONTRACT" onChange={e => this.onChange(e, "job_type")} checked={this.state.job_type === "CONTRACT"} type="radio" name="radio" />
                                                <span className="checkmarked">
                                                    <p>Contract</p>
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
                                        this.state.loading ? <img alt="" src="/assets/toolkit/images/loading_blue.gif" />
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
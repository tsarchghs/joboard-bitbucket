import React from "react";
import { CardElement, injectStripe } from 'react-stripe-elements';
import RichEditor from "./RichEditor";
import "../richEditor.css"
import { convertToHTML } from "draft-convert";
import { withApollo } from 'react-apollo';
import { compose } from "recompose"
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { GET_LOGGED_IN_USER } from "../Queries";
import { cloneDeep } from "lodash";
import { handleUploadPhotoInput } from "../helpers";
import { CREATE_JOB_MUTATION } from "../Queries";

class _CreateJob extends React.Component {
	constructor(props){
		super(props)
		this.onSubmit = this.onSubmit.bind(this)
		this.state = {
			position: "",
			editorState: undefined,
			location: "",
			locationInputDisabled: true,
			salary: "",
			job_type: "FULL_TIME",
			apply_url: "",
			company_logo: undefined,
			company_name: "",
			company_email: "",
			company_website: "",
			featured: false,
			loading: false,
			job: undefined
		}
		this.onChange = this.onChange.bind(this)
		this.toggleLocationInput = this.toggleLocationInput.bind(this)
		this.companyLogoInput = undefined; //ref
		this.companyLogoDiv = undefined; //ref
	}
	async onSubmit(e){
		e.preventDefault()
		this.setState({
			loading: true
		})
		let job_description_html_output;	
		if (!this.state.editorState) job_description_html_output = `<h3>No description</h3`
		else job_description_html_output = convertToHTML(this.state.editorState.getCurrentContent())
		console.log(this.state, job_description_html_output)

		let variables = { ...this.state};
		variables.description = job_description_html_output
		if (this.state.locationInputDisabled){
			variables.location = "remote/everywhere"
		}
		if (this.props.user){
			variables.company = this.props.user.company.id
		}
		variables.salary = this.state.salaryInputDisabled ? null : Number(this.state.salary);
		variables.status = this.state.featured ? "FEATURED" : "NEW"
		console.log(variables);
		let res;
		if (this.companyLogoInput && this.companyLogoInput.base64){
			variables.company_logo = this.companyLogoInput.base64;
        }
		variables.bp = true;
		try {
			let res = await this.props.client.mutate({
                mutation: CREATE_JOB_MUTATION,
				variables
			})
			this.setState({
				job_id: res.data.createJob.id,
				company_logo: this.companyLogoInput && this.companyLogoInput.base64 ? this.companyLogoInput.base64 : undefined
            })
            this.props.history.push(`/job/${res.data.createJob.id}`)
		} catch (e) {
            console.log(e)
		}
		console.log(res)
		this.setState({
			loading: false
		})
	}
	onChange(e,key){
		if (key === "salary" && Number(e.target.value) < 0) e.target.value = 0
		this.setState({
			[key]: e.target.value
		})
	}
	toggleLocationInput(){
		if (this.state.locationInputDisabled){
			this.setState({
				locationInputDisabled: false,
				location: ""
			})
		} else {
			this.setState({
				locationInputDisabled: true,
				location:""
			})
		}
	}
	render(){
		return (
			<div className="create-job__layout">
				<form onSubmit={this.onSubmit}>
					<h4>Create job</h4>
					<div className="create-job">
					<h5>Hire the flutters. Share your job post with many of job seekers.</h5>
					<div className="create-job__input">
						<label className="create-job__input--label"><span className="create-job__input--span">Position</span>
						<input 
							className="input" 
							type="text"
							required 
							placeholder="Software engineer, mobile application developer..." 
							value={this.state.posititon}
							onChange={e => this.onChange(e,"position")}	
						/>
						</label>
						<label className="create-job__input--label"><span className="create-job__input--span">JOB DESCRIPTION</span>
							<RichEditor onChangeParentApp={editorState => this.setState({editorState})} />
						</label>
						<label className="create-job__input--label"><span className="create-job__input--span">Location</span>
						<input 
							className="input" 
							type="text" 
							placeholder="Location of the job" 
							value={this.state.location}
							onChange={e => this.onChange(e,"location")}
							disabled={this.state.locationInputDisabled}
						/>
						<label className="checkbox-container">
							<input type="checkbox" checked={this.state.locationInputDisabled} onChange={this.toggleLocationInput}/>
							<span className="checkmark" />
							<p>Remote/anywhere</p>
						</label>
						</label>
						<label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
							<input className="input" type="text" type="number" placeholder="Type the salary here" 
								onChange={e => this.onChange(e,"salary")}
								value={this.state.salary}
								disabled={this.state.salaryInputDisabled}
								required
							/>
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
							<input value="FULL_TIME" onChange={e => this.onChange(e,"job_type")} checked={this.state.job_type === "FULL_TIME"} type="radio" name="radio" />
							<span className="checkmarked">
							<p>Full time</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="PART_TIME" onChange={e => this.onChange(e,"job_type")} checked={this.state.job_type === "PART_TIME"} type="radio" name="radio" />
							<span className="checkmarked">
							<p>Part-time</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="FREELANCE" onChange={e => this.onChange(e,"job_type")} checked={this.state.job_type === "FREELANCE"} type="radio" name="radio" />
							<span className="checkmarked">
							<p>Freelance</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="CONTRACT" onChange={e => this.onChange(e,"job_type")} checked={this.state.job_type === "CONTRACT"} type="radio" name="radio" />
							<span className="checkmarked">
							<p>Contract</p>
							</span>
						</label>
						</div>
						<label className="create-job__input--label"><span className="create-job__input--span">Apply url</span>
						<input onChange={e => this.onChange(e,"apply_url")} value={this.state.apply_url} required className="input" type="text" placeholder="Where people can apply" />
						</label>
					</div>
					</div>
					{
						!this.props.user && <span className="line" />	
					}
					<div className="company-info">
						<h5>Company info</h5>
						<div>
							<div className="upload-image">
								<div ref={node => this.companyLogoDiv = node} style={{display:"inline"}} className="upload-image__img" style={{
									backgroundSize: "cover",
									backgroundRepeat:"no-repeat"
								}} />
								<div style={{display:"inline"}} style={{
											position: "relative",
											overflow: "hidden",
											display: "inline-block"
								}}>
									<button style={{
											border: "2px solid #00FFFF",
											color: "#00FFFF",
											backgroundColor: "white",
											padding: "8px 20px",
											borderRadius: "8px",
											fontSize: "20px",
											fontWeight: "bold",
											marginTop: 5
									}}>Upload a file</button>
									<input style={{
										fontSize: "100px",
										position: "absolute",
										left: 0,
										top: 0,
										opacity: 0
									  }} 
										ref={node => this.companyLogoInput = node}
										onChange={e => {
											e.persist();
											handleUploadPhotoInput(e.target, this.companyLogoDiv);
										}}
									  type="file" name="myfile" />
								</div>
							</div>
							<label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
								<input 
									className="input" 
									type="text" 
									placeholder="Type your company name" 
									onChange={e => this.onChange(e,"company_name")}	
									value={this.state.company_name}
									required
								/>
							</label>
							<label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
								<input 
									className="input" 
									type="email" 
									placeholder="Your Email here" 
									value={this.state.company_email}
									onChange={e => this.onChange(e,"company_email")}	
									required
								/>
							</label>
							<label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
								<input 
									className="input" 
									type="text"
									placeholder="Company website" 
									value={this.state.company_website}
									onChange={e => this.onChange(e,"company_website")}	
									required
								/>
							</label>
						</div>
						<label className="checkbox-container">
							<input type="checkbox" checked={this.state.featured} onChange={e => this.onChange({target:{value:!this.state.featured}},"featured")}/>
							<span className="checkmark" />
							<p className="checkmark-text">Make my job vacancy featured for 7 days ( +50$) <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt />Featured</span></p>
						</label>
					<div className="text-center">
					{
						this.state.loading ? <img alt="" src="/assets/toolkit/images/loading_blue.gif"/>
						: <button style={{width:"100%"}} type="submit" className="button blue">Post this job ({this.state.featured ? "249" : "199"}$)</button>
					}
					</div>
					</div>
				</form>
			</div>
		)
	}
}

export default compose(withApollo,withRouter)(_CreateJob);
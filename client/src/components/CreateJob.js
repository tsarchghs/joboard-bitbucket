import React from "react";
import { CardElement, injectStripe } from 'react-stripe-elements';
import RichEditor from "./RichEditor";
import "../richEditor.css"
import { convertToHTML } from "draft-convert";
import { withApollo } from 'react-apollo';
import { compose } from "recompose"
import gql from "graphql-tag";
import CreateAccountQuestionModal from "./CreateAccountQuestionModal";
import TypePasswordModal from "./TypePasswordModal";
import { withRouter } from "react-router";
import { GET_LOGGED_IN_USER } from "../Queries";
import { cloneDeep } from "lodash";

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
			company_name: "",
			company_email: "",
			company_website: "",
			featured: true,
			card_error: "",
			loading: false,
			currentModal: null,
			job: undefined
		}
		this.onChange = this.onChange.bind(this)
		this.toggleLocationInput = this.toggleLocationInput.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.openModal = this.openModal.bind(this)
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
		let stripe_res = await this.props.stripe.createToken({ name: "Job Posting" });
		if (stripe_res.error){
			this.setState({
				card_error: stripe_res.error.message,
				loading: false
			})
			return;
		} else {
			this.setState({
				card_error: ""
			})
		}
		let variables = { ...this.state};
		variables.description = job_description_html_output
		if (this.state.locationInputDisabled){
			variables.location = "remote/everywhere"
		}
		if (this.props.user){
			variables.company = this.props.user.company.id
		}
		variables.salary = Number(variables.salary)
		variables.status = this.state.featured ? "FEATURED" : "NEW"
		variables.stripe_token = stripe_res.token.id
		console.log(variables);
		let res;
		try {
			let res = await this.props.client.mutate({
				mutation: gql`
					mutation CreateJob(
						$position: String!
						$location: String!
						$salary: Int!
						$job_type: JOB_TYPE!
						$status: STATUS_TYPE!
						$apply_url: String!
						$description: String
						$company: ID
						$company_name: String
						$company_email: String
						$company_website: String
						$stripe_token: String!
					) {
						createJob(
							position: $position
							location: $location
							salary: $salary
							job_type: $job_type
							status: $status
							apply_url: $apply_url
							description: $description
							company: $company
							company_name: $company_name
							company_email: $company_email
							company_website: $company_website
							stripe_token: $stripe_token
						){
							id
							location
							position
							status
							job_type
							expiresAt
						}
					}
				`,
				variables
			})
			if (this.props.user){
				try {
					let data = cloneDeep(this.props.client.readQuery({
						query: GET_LOGGED_IN_USER
					}))
					data.getLoggedInUser.company.jobs.push(res.data.createJob)
					this.props.client.writeQuery({
						query: GET_LOGGED_IN_USER,
						data: data
					})
				} catch (e) {
					console.log(e)
				}
				this.props.history.push(`/job/${res.data.createJob.id}`)
				return;
			}
			console.log(res)
			this.setState({
				job: res.data.createJob,
				currentModal: "CreateAccountQuestionModal"
			})
		} catch (e) {
			if (e.message.indexOf("CardError") !== -1){
				this.setState({
					card_error: e.message.split(":")[2]
				})
			}
		}
		console.log(res)
		this.setState({
			loading: false
		})
	}
	onChange(e,key){
		console.log(12321,e.target)
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
	closeModal() {
		this.setState({
			currentModal: undefined
		})
		this.props.history.push(`/job/${this.state.job_id}`)
	}
	openModal(modalName) {
		this.setState({ currentModal: modalName })
	}
	render(){
		return (
			<div className="create-job__layout">
				<CreateAccountQuestionModal 
					closeModal={this.closeModal} 
					onYes={() => this.openModal("TypePasswordModal")} 
					modalIsOpen={this.state.currentModal === "CreateAccountQuestionModal"}	
				/>
				<TypePasswordModal
					closeModal={this.closeModal}
					email={this.state.company_email}
					parent_state={this.state}
					refetchApp={this.props.refetchApp}
					modalIsOpen={this.state.currentModal === "TypePasswordModal"}
				/>
				<form onSubmit={this.onSubmit}>
					<h4>Create job</h4>
					<div className="create-job">
					<h5>Your position</h5>
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
							<input type="checkbox" defaultChecked="checked" onChange={this.toggleLocationInput}/>
							<span className="checkmark" />
							<p>Remote/anywhere</p>
						</label>
						</label>
						<label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
						<input className="input" type="text" type="number" placeholder="Type the salary here" 
							onChange={e => this.onChange(e,"salary")}
							value={this.state.salary}
							required
						/>
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
						<label className="checkbox-container">
							<input type="checkbox" checked={this.state.featured} onChange={e => this.onChange({target:{value:!this.state.featured}},"featured")}/>
							<span className="checkmark" />
							<p className="checkmark-text">Make my job vacancy featured for 7 days ( +99$) <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt />Featured</span></p>
						</label>
						</label>
					</div>
					</div>
					{
						!this.props.user && <span className="line" />	
					}
					<div className="company-info">
					{
						!this.props.user && <h5>Company info</h5>
					}
					{
						this.props.user ? null 
						: 
						<div>
							<div className="upload-image">
								<div className="upload-image__img" style={{backgroundImage: 'url("../../assets/toolkit/images/014-company.svg")'}} />
							</div>
							<label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
								<input 
									className="input" 
									type="text" 
									placeholder="Type your company name" 
									value={this.state.company_name}
									onChange={e => this.onChange(e,"company_name")}	
									required
								/>
							</label>
							<label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
								<input 
									className="input" 
									type="text" 
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
					}
					<label className="create-job__input--label"><span className="create-job__input--span">Company card</span>   
						<CardElement />
						<p style={{ "color": "red", margin:10 }}>{this.state.card_error}</p>
					</label>
					<div className="text-center">
					{
						this.state.loading ? <img alt="" src="http://localhost:3000/assets/toolkit/images/loading_blue.gif"/>
						: <button style={{width:"100%"}} type="submit" className="button blue">Post this job ({this.state.featured ? "249" : "199"}$)</button>
					}
					</div>
					</div>
				</form>
			</div>
		)
	}
}

export default compose(injectStripe,withApollo,withRouter)(_CreateJob);
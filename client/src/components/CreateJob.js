import React from "react";
import { CardElement, injectStripe } from 'react-stripe-elements';
import RichEditor from "./RichEditor";
import "../richEditor.css"
import { convertToHTML } from "draft-convert";
import { withApollo, Query } from 'react-apollo';
import { compose } from "recompose"
import CreateAccountQuestionModal from "./CreateAccountQuestionModal";
import TypePasswordModal from "./TypePasswordModal";
import { withRouter } from "react-router";
import { GET_LOGGED_IN_USER } from "../Queries";
import { cloneDeep } from "lodash";
import { handleUploadPhotoInput } from "../helpers";
import { CREATE_JOB_MUTATION, CREATE_JOB_AND_LOGIN_MUTATION } from "../Queries";
import Cookies from 'js-cookie';
import LoadingAnimation from "./LoadingAnimation";
import { COUNTRIES_QUERY } from "../Queries";

class _CreateJob extends React.Component {
	constructor(props){
		super(props)
		this.onSubmitNoAccount = this.onSubmitNoAccount.bind(this);
		this.createStripeToken = this.createStripeToken.bind(this);
		this.onSubmitWithAccount = this.onSubmitWithAccount.bind(this);
		this.state = {
			position: "",
			editorState: undefined,
			location: "",
			salaryInputDisabled: false,
			min_salary: undefined,
			max_salary: undefined,
			remote: false,
			salary_currency: "DOLLAR",
			job_types: ["FULL_TIME"],
			apply_url: "",
			company_logo: undefined,
			company_name: "",
			company_email: "",
			company_website: "",
			featured: false,
			card_error: "",
			loading: false,
			currentModal: null,
			job: undefined,
			hasAccount: false,
			email: "",
			password: "",
			under_company_info_error: "",
			city: window.__PUBLIC_DATA__.use_predefined_location ? "cjxx5ieu1kfxx0b3677nbsntq" : false
		}
		this.onChange = this.onChange.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.openModal = this.openModal.bind(this)
		this.companyLogoInput = undefined; //ref
		this.companyLogoDiv = undefined; //ref
	}
	async createStripeToken(){
		let stripe_res = await this.props.stripe.createToken({ name: "Job Posting" });
		if (stripe_res.error) {
			console.log(stripe_res.error.message,123);
			this.setState({
				card_error: stripe_res.error.message,
				loading: false
			})
			return false;
		} else {
			this.setState({
				card_error: ""
			})
			console.log(stripe_res);
			return stripe_res.token.id;
		}
	}
	async onSubmitWithAccount(e){
		e.preventDefault()
		this.setState({
			loading: true
		})
		let job_description_html_output;
		if (!this.state.editorState) job_description_html_output = `<h3>No description</h3>`
		else job_description_html_output = convertToHTML(this.state.editorState.getCurrentContent())

		let stripe_token = await this.createStripeToken();
		if (!stripe_token) return;

		let variables = {
			email: this.state.email,
			password: this.state.password,
			position: this.state.position,
			location: this.state.location,
			remote: this.state.remote,
			city: this.state.city ? this.state.city : undefined,
			min_salary: this.state.salaryInputDisabled ? null : Number(this.state.min_salary),
			max_salary: this.state.salaryInputDisabled ? null : Number(this.state.max_salary),
			salary_currency: this.state.salary_currency,
			job_types: this.state.job_types,
			status: this.state.featured ? "FEATURED" : "TODAY",
			apply_url: this.state.apply_url,
			description: job_description_html_output,
			stripe_token: stripe_token,
		}
		console.log(variables, this.state.city)

		let res;
		try {
			res = await this.props.client.mutate({
				mutation: CREATE_JOB_AND_LOGIN_MUTATION,
				variables
			})
			console.log(res)
		} catch (e) {
			console.log(e);
			if (e.message.indexOf("CardError") !== -1) {
				this.setState({
					card_error: e.message.split(":")[2],
					loading: false
				})
				console.log(1);
			} else {
				this.setState({
					under_company_info_error: e.message.split(":")[1],
					loading: false
				})
				console.log(e.message);
			}
			return;
		}
		Cookies.set("token", res.data.createJobAndLogin.auth_data.token);
		await this.props.refetchApp();
		this.props.history.push("/dashboard")

		this.setState({
			loading: false
		})
	}
	async onSubmitNoAccount(e){
		e.preventDefault()
		this.setState({
			loading: true
		})
		let job_description_html_output;	
		if (!this.state.editorState) job_description_html_output = `<h3>No description</h3`
		else job_description_html_output = convertToHTML(this.state.editorState.getCurrentContent())
		console.log(this.state, job_description_html_output)
		
		let stripe_token = await this.createStripeToken();
		if (!stripe_token) return;

		let variables = { ...this.state};
		variables.description = job_description_html_output
		variables.remote = this.state.remote
		if (this.props.user){
			variables.company = this.props.user.company.id
		}
		
		variables.min_salary =  this.state.salaryInputDisabled ? null : Number(this.state.min_salary)
		variables.max_salary =  this.state.salaryInputDisabled ? null : Number(this.state.max_salary)
		variables.salary_currency =  this.state.salary_currency
		
		variables.status = this.state.featured ? "FEATURED" : "TODAY"
		variables.stripe_token = stripe_token
		variables.city = this.state.city ? this.state.city : undefined;
		console.log(variables);
		let res;
		if (this.companyLogoInput && this.companyLogoInput.base64){
			variables.company_logo = this.companyLogoInput.base64;
		}
		variables.bp = false;
		try {
			let res = await this.props.client.mutate({
				mutation: CREATE_JOB_MUTATION,
				variables
			})
			this.setState({
				job_id: res.data.createJob.id,
				company_logo: this.companyLogoInput && this.companyLogoInput.base64 ? this.companyLogoInput.base64 : undefined
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
				console.log(res,123,res.data,345);
				this.props.history.push(`/job/${res.data.createJob.id}`)
				return;
			}
			console.log(res)
			this.setState({
				job: res.data.createJob,
				currentModal: "CreateAccountQuestionModal"
			})
		} catch (e) {
			console.log(e);
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
	closeModal() {
		this.setState({
			currentModal: undefined
		})
		this.props.history.push(`/job/${this.state.job_id}`)
	}
	openModal(modalName,e) {
		if (e){
			e.preventDefault();
		}
		this.setState({ currentModal: modalName })
	}
	render(){
		return (
			<div className="create-job__layout">
				<CreateAccountQuestionModal 
					closeModal={this.closeModal} 
					onYes={(e) => this.openModal("TypePasswordModal",e)} 
					modalIsOpen={this.state.currentModal === "CreateAccountQuestionModal"}	
				/>
				<TypePasswordModal
					closeModal={this.closeModal}
					email={this.state.company_email}
					parent_state={this.state}
					refetchApp={this.props.refetchApp}
					modalIsOpen={this.state.currentModal === "TypePasswordModal"}
				/>
				<form onSubmit={this.state.hasAccount ? this.onSubmitWithAccount : this.onSubmitNoAccount}>
					<h4>Create job</h4>
					<div className="create-job">
					<h5>{window.__PUBLIC_DATA__.above_job_position_text}</h5>
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
						{
							window.__PUBLIC_DATA__.use_predefined_location &&
							<Query 
								query={COUNTRIES_QUERY}
							>
								{({loading,error,data}) => {
									if (error) return error.message;
									if (loading) return "Loading";
									console.log(data)
									let countries = data.countries;
									let cities = countries.map(country => country.cities).flat();

									return (
										<div className="create-job__checkbox">
										{
											cities.map(city => (
												<label className="radio-container">
													<input value={city.id} onChange={e => this.onChange(e, "city")} checked={this.state.city === city.id} type="checkbox" name="radio" />
													<span className="checkmarked">
														<p>{city.name}</p>
													</span>
												</label>
											))
										}
											
										</div>
									)
								}}
							</Query>
						}
						{
							!window.__PUBLIC_DATA__.use_predefined_location
							&&
							<React.Fragment>
								<input 
									className="input" 
									type="text" 
									placeholder="Location of the job" 
									value={this.state.location}
									onChange={e => this.onChange(e,"location")}
									required={!this.state.remote}
								/>
								<label className="checkbox-container">
									<input type="checkbox" checked={this.state.remote} onChange={e => {
										this.setState(prevState => {
											prevState.remote = !prevState.remote;
											return prevState; 
										})
									}}/>
									<span className="checkmark" />
									<p>{this.state.location ? "Or Remote/anywhere" : "Remote/anywhere"}</p>
								</label>
							</React.Fragment>
						}
						</label>
						<label className="create-job__input--label"><span className="create-job__input--span">Salary</span> 
							Switch to range: <input type="checkbox" checked={this.state.isRange} onChange={e => {
								this.setState(prevState => {
									prevState.isRange = !prevState.isRange
									prevState.max_salary = undefined;
									return prevState;
								})
							}}/>
							
							<input className="input" type="text" type="number" placeholder={this.state.isRange ? "Type the minimum salary" : "Type the salary here"} 
								onChange={e => this.onChange(e,"min_salary")}
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
							<select value={this.state.salary_currency} onChange={e => this.setState({salary_currency: e.target.value})} disabled={this.state.salaryInputDisabled}>
								<option value="DOLLAR">Dollar</option>
								<option value="EURO">Euro</option>
							</select>
							<label className="checkbox-container">
								<input type="checkbox" checked={this.state.salaryInputDisabled} onChange={e => this.setState(nextState => { 
									nextState.salaryInputDisabled = !nextState.salaryInputDisabled 
									return nextState;
								})}/>
								<span className="checkmark" />
									<p className="checkmark-text">Do not show salary
								</p>
							</label>						
						</label>
						<label className="create-job__input--label less-margin"><span className="create-job__input--span">Job type</span></label>
						<div className="create-job__checkbox">
						<label className="radio-container">
							<input value="FULL_TIME" onChange={e => this.onChange(e,"job_types")} checked={this.state.job_types.includes("FULL_TIME")} type="checkbox" />
							<span className="checkmarked">
							<p>Full time</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="PART_TIME" onChange={e => this.onChange(e,"job_types")} checked={this.state.job_types.includes("PART_TIME")} type="checkbox" />
							<span className="checkmarked">
							<p>Part-time</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="FREELANCE" onChange={e => this.onChange(e,"job_types")} checked={this.state.job_types.includes("FREELANCE")} type="checkbox" />
							<span className="checkmarked">
							<p>Freelance</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="CONTRACT" onChange={e => this.onChange(e,"job_types")} checked={this.state.job_types.includes("CONTRACT")} type="checkbox" />
							<span className="checkmarked">
							<p>Contract</p>
							</span>
						</label>
						<label className="radio-container">
							<input value="UNSPECIFIED" onChange={e => this.onChange(e,"job_types")} checked={this.state.job_types.includes("UNSPECIFIED")} type="checkbox" />
							<span className="checkmarked">
							<p>Unspecified</p>
							</span>
						</label>
						</div>
						<label className="create-job__input--label"><span className="create-job__input--span">Apply url</span>
						<input onChange={e => this.onChange(e,"apply_url")} value={this.state.apply_url} required className="input" type="text" placeholder="Where people can apply" />
						</label>
					</div>
						<label className="checkbox-container" 
							style={{ marginTop: '40px', marginBottom: '60px' }}>
							<input type="checkbox" checked={this.state.featured} onChange={e => this.onChange({ target: { value: !this.state.featured } }, "featured")}/>
							<span className="checkmark" />
								<p className="checkmark-text">Make my job vacancy featured for 7 days ( +50$) 
							<span className="new blue">
							<img src="/assets/toolkit/images/blue-star.svg" />Featured
							</span>
							</p>
						</label>
					</div>
					{
						!this.props.user && <span className="line" />	
					}
					<div className="company-info">
					{
							!this.props.user && 
							(
								<div className="company-info__avatar">
									<h5>Company info</h5>
									
									<a onClick={e => {
										e.preventDefault()
										this.setState(nextState =>{
											nextState.hasAccount = !nextState.hasAccount;
											return nextState
										})
									}}>{this.state.hasAccount ? "Create new company?" : "Do you have an account?"}</a>
								</div>
							)
					}
					<h1>{this.state.under_company_info_error}</h1>
					{
						this.props.user ? null 
						: 
						<div>
							{
								this.state.hasAccount && 
								(
									<div>
										<label style={{marginTop:35}} className="create-job__input--label"><span className="create-job__input--span">Email</span>
											<input 
												className="input" 
												type="email" 
												placeholder="Your email here" 
												onChange={e => this.onChange(e,"email")}	
												value={this.state.email}
												required
											/>
										</label>
										<label className="create-job__input--label"><span className="create-job__input--span">Password</span>
											<input 
												className="input" 
												type="password" 
												placeholder="Your password here" 
												value={this.state.password}
												onChange={e => this.onChange(e,"password")}	
												required
											/>
										</label>
									</div>
								)
							}
							{
								!this.state.hasAccount && 
								(
									<div>
												<div className="upload-image">
													<div ref={node => this.companyLogoDiv = node} style={{ display: "inline" }} className="upload-image__img" style={{
														backgroundImage: 'url("")',
														backgroundSize: "cover",
														backgroundRepeat: "no-repeat"
													}} />
													<div style={{ display: "inline" }} style={{
														position: "relative",
														overflow: "hidden",
														display: "inline-block"
													}}>
														<button style={{
															border: "1px solid #007CFF",
															color: "#007CFF",
															backgroundColor: "white",
															padding: "8px 10px",
															borderRadius: "8px",
															fontSize: "14px",
															fontWeight: "bold",
															marginTop: 10,
															marginLeft: 11
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
								)
							}
						</div>
					}
					<label style={{marginTop: this.state.hasAccount ? 0 : 0}} className="create-job__input--label"><span className="create-job__input--span">Company card</span>   
						<CardElement hidePostalCode={true} />
						<p style={{ "color": "red", margin:10 }}>{this.state.card_error}</p>
					</label>
					<div className="text-center">
					{
						this.state.loading ? <LoadingAnimation loading_type={2}/>
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
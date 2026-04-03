import React from "react";
import { convertToHTML } from "draft-convert";
import { withApollo } from "../lib/apolloCompat";
import compose from "../lib/compose";
import CreateAccountQuestionModal from "./CreateAccountQuestionModal";
import TypePasswordModal from "./TypePasswordModal";
import { withRouter } from "../lib/routerCompat";
import { GET_LOGGED_IN_USER } from "../Queries";
import { cloneDeep } from "lodash";
import { CREATE_JOB_MUTATION, CREATE_JOB_AND_LOGIN_MUTATION } from "../Queries";
import Cookies from 'js-cookie';
import JobForm from "./form/JobForm";
import { CardElement, injectStripe } from "../lib/stripeCompat";
import PostJobButton from "./form/PostJobButton";

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
			category: "DATA_SCIENTIST",
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
			city: window.__PUBLIC_DATA__.use_predefined_location ? window.__PUBLIC_DATA__.default_predefined_location : undefined
		}
		this.onChange = this.onChange.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.openModal = this.openModal.bind(this)
		this.companyLogoInput = undefined; //ref
		this.defaultCategory = undefined;
		this.toggle = this.toggle.bind(this)
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
			category: this.state.category,
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
		
		variables.category = this.state.category

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
			console.log(123)
			this.setState({
				[key]: e.target.value
			},() => {
				console.log(this.state)
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
		if (e) e.preventDefault();
		this.setState({ currentModal: modalName })
	}
	toggle(val){
		this.setState(prevState => {
			prevState[val] = !prevState[val]
			return prevState;
		})
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
							<JobForm
								user={this.props.user}
								category={this.state.category}
								onChangeParentApp={editorState => this.setState({editorState})}
								position={this.state.position}
								city={this.state.city}
								location={this.state.location}
								remote={this.state.remote}
								isRange={this.state.isRange}
								salaryInputDisabled={this.state.salaryInputDisabled}
								min_salary={this.state.min_salary}
								max_salary={this.state.max_salary}
								salary_currency={this.state.salary_currency}
								onChange={this.onChange}
								rangeOnChange={e => {
									this.setState(prevState => {
										prevState.isRange = !prevState.isRange
										prevState.max_salary = undefined;
										return prevState;
									})
								}}
								apply_url={this.state.apply_url}
								job_types={this.state.job_types}
								toggle={this.toggle}
								under_company_info_error={this.state.under_company_info_error}
								hasAccount={this.state.hasAccount}
								email={this.state.email}
								password={this.state.password}
								company_name={this.state.company_name}
								company_email={this.state.company_email}
								company_website={this.state.company_website}
								card_error={this.state.card_error}
								loading={this.state.loading}
								featured={this.state.featured}
								companyLogoInput={this.companyLogoInput}
								assignNodeToLogo={node => this.companyLogoInput = node}
							/>
							<label style={{ marginTop: this.state.hasAccount ? 0 : 0 }} className="create-job__input--label"><span className="create-job__input--span">Company card</span>
								<CardElement hidePostalCode={true} />
								<p style={{ "color": "red", margin: 10 }}>{this.state.card_error}</p>
							</label>
							<PostJobButton
								loading={this.state.loading}
								featured={this.state.featured}
							/>
						</div>
					</div>
				</form>
			</div>
		)
	}
}

export default compose(injectStripe,withApollo,withRouter)(_CreateJob);

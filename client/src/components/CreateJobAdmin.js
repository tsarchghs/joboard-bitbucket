import React from "react";
import { convertToHTML } from "draft-convert";
import { withApollo } from 'react-apollo';
import { compose } from "recompose"
import { withRouter } from "react-router";
import { CREATE_JOB_MUTATION } from "../Queries";
import JobForm from "./form/JobForm";
import PostJobButton from "./form/PostJobButton";

class _CreateJob extends React.Component {
	constructor(props){
		super(props)
		this.onSubmit = this.onSubmit.bind(this)
		this.state = {
			position: "",
			editorState: undefined,
			location: "",
			min_salary: undefined,
			max_salary: undefined,
			salary_currency: "DOLLAR",
			remote: false,
			job_types: ["FULL_TIME"],
			apply_url: "",
			company_logo: undefined,
			company_name: "",
			company_email: "",
			company_website: "",
			featured: false,
			loading: false,
			job: undefined,
			city: window.__PUBLIC_DATA__.use_predefined_location ? window.__PUBLIC_DATA__.default_predefined_location : false
		}
		this.onChange = this.onChange.bind(this)
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
		if (this.props.user){
			variables.company = this.props.user.company.id
		}
		variables.min_salary = this.state.salaryInputDisabled ? null : Number(this.state.min_salary)
		variables.max_salary = this.state.salaryInputDisabled ? null : Number(this.state.max_salary)
		variables.salary_currency = this.state.salary_currency
		
		variables.remote = this.state.remote

		variables.status = this.state.featured ? "FEATURED" : "TODAY"
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
	render(){
		return (
			<div className="create-job__layout">
				<form onSubmit={this.onSubmit}>
					<h4>Create job</h4>
					<div className="create-job">
					<h5>{window.__PUBLIC_DATA__.above_job_position_text}</h5>
					<div className="create-job__input">
						<JobForm
							user={false}
							category={this.state.category}
							onChangeParentApp={editorState => this.setState({ editorState })}
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
							renderCard={false}
							companyLogoInput={this.companyLogoInput}
							assignNodeToLogo={node => this.companyLogoInput = node}
						/>
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

export default compose(withApollo, withRouter)(_CreateJob);
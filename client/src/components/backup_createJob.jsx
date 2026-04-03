import React from "react";
import { Mutation } from "react-apollo";
import { Redirect } from "react-router-dom";
import SignUpQuestionModal from "./SignUpQuestionModal";
import EnterPasswordModal from "./EnterPasswordModal";
import ReactDOM from 'react-dom';
import { loadToolKit } from "../helpers";
import CardForm from "./CardForm";
import { Elements, injectStripe } from "react-stripe-elements";

// ReactDOM.render(<EnterPasswordModal/>,document.getElementById("EnterPasswordModal"));
// ReactDOM.render(<SignUpQuestionModal/>,document.getElementById("SignUpQuestionModal"));

class _CreateJob extends React.Component {
	constructor(props){
		super(props);
		this.job_type = "CONTRACT"
		this.featured = true;
		this.remote = true	
		this.state = {
			company_email: undefined,
			description: undefined,
			errors: []
		}
		this.createJob = undefined;
		this.position = undefined;
		this.description = undefined;
		this.location = undefined;
		this.salary = undefined;
		this.job_type = undefined;
		this.status = undefined;
		this.apply_url = undefined;
		this.company = undefined;
		this.company_name = undefined;
		this.company_email = undefined;
		this.company_website = undefined;
		this.postModalButton = undefined;
		this.postJob_onSubmit = this.postJob_onSubmit.bind(this);
		this.validateForm = this.validateForm.bind(this);
	}
	async jobOnSubmit(e,createJob) {
		e.preventDefault();
		var tokenData = await this.props.stripe.createToken({currency:"usd",amount:500})
		if (!tokenData.token || !tokenData.token.id){
			return;
		}
		let variables = {
			position:this.position.value ,	
			description:this.description.value ,	
			location: this.remote ? "remote/anywhere" : this.location.value,	
			salary: Number(this.salary.value),	
			job_type: this.job_type,	
			status: this.featured ? "FEATURED" : "NEW",	
			apply_url:this.apply_url.value,
			stripe_token: (await this.props.stripe.createToken({currency:"usd",amount:500})).token.id
		}
		if (!this.props.user){
			console.log(this.company_name,this.company_email,this.company_website)
			variables["company_name"] = this.company_name.value
			variables["company_email"] = this.company_email.value
			variables["company_website"] = this.company_website.value
		} else {
			variables["company"] = this.props.user.company.id
		}
		console.log(variables);
		try {
			let data = await createJob({variables},() => window.location.href = `/job/${data.data.createJob.id}`)
		} catch (e) {
			console.log(e.message);
			if (e.message === "GraphQL error: Your card was declined."){
				document.querySelector('body > div:nth-child(17)').click() // background modal to close
				this.setState({
					card_denied: true
				})
			}
		}
	}
	async validateForm(){
		var fields = [this.position,this.description,this.salary,this.apply_url]
		if (!this.props.user){
			fields = fields.concat([this.company_name,this.company_email,this.company_website])
		}

		let errors = []
		console.log(fields);
		for (var x in fields){
			console.log(fields[x]);
			if (!fields[x].value){
				errors.push("Please make sure to fill all the fields");
				break;
			}
		}
		var tokenData = await this.props.stripe.createToken({currency:"usd"});
		console.log(tokenData);
		if (tokenData.error){
			errors.push(tokenData.error.message);
		}
		this.setState({
			errors:errors
		})
		if (errors.length){
			return false
		}
		return true
	}
	async postJob_onSubmit(e) {
		e.preventDefault();
		console.log(1234);
		let valid = await this.validateForm();
		console.log(valid);
		if (valid){
			this.postModalButton.click()
		}	
	} 
	render(){
		return (
			<div>
			   <div className="create-job__layout">
					<form id="post_job" onSubmit={this.postJob_onSubmit}>
				        <h4>Create job</h4>
				   		{
				   			this.state.errors.map(error => {
				   				return (
				   					<h4>{error}</h4>
				   				)
				   			})
				   		}
				        <div className="create-job">
				          <h5>Your position</h5>
				          <div className="create-job__input">
				            <label className="create-job__input--label"><span className="create-job__input--span">Position</span>
				              <input id="position" ref={node => this.position = node} className="input" type="ema" placeholder="Software engineer, mobile application developer..." />
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">JOB DESCRIPTION</span>
				              <textarea onChange={e => this.setState({description:e.target.value})} ref={node => this.description = node} name id cols={30} rows={10} style={{height: '134px', width: '422px'}} defaultValue={""} />
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">Location</span>
				              <input id="location" readOnly ref={node => this.location = node} className="input" type="ema" placeholder="Location of the job" />
				              <label className="checkbox-container">
				                <input onChange={(e) => {
				                	this.remote ? this.location.removeAttribute("readonly") : this.location.setAttribute("readonly",this.remote);
				                	this.remote = !this.remote
				                }}  type="checkbox" defaultChecked="checked" />
				                <span className="checkmark" />
				                <p>Remote/anywhere</p>
				              </label>
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
				              <input id="salary" ref={node => this.salary = node} className="input" type="ema" placeholder="Type the salary here" />
				            </label>
				            <label className="create-job__input--label less-margin"><span className="create-job__input--span">Job type</span></label>
				            <div className="create-job__checkbox">
				              <label className="radio-container">
				                <input type="radio" defaultChecked="checked" name="radio" />
				                <span onClick={() => this.job_type="FULL_TIME"} className="checkmarked">
				                  <p>Full time</p>
				                </span>
				              </label>
				              <label className="radio-container">
				                <input type="radio" defaultChecked="checked" name="radio" />
				                <span onClick={() => this.job_type="PART_TIME"} className="checkmarked">
				                  <p>Part-time</p>
				                </span>
				              </label>
				              <label className="radio-container">
				                <input type="radio" defaultChecked="checked" name="radio" />
				                <span onClick={() => this.job_type="FREELANCE"} className="checkmarked">
				                  <p>Freelance</p>
				                </span>
				              </label>
				              <label className="radio-container">
				                <input type="radio" defaultChecked="checked" name="radio" />
				                <span onClick={() => this.job_type="CONTRACT"} className="checkmarked">
				                  <p>Contract</p>
				                </span>
				              </label>
				            </div>
				            <label className="create-job__input--label"><span className="create-job__input--span">Apply url</span>
				              <input id="apply_url" ref={node => this.apply_url = node} className="input" type="ema" placeholder="Where people can apply" />
				              <label className="checkbox-container">
				                <input type="checkbox" defaultChecked="checked" />
				                <span onClick={() => {
				              	this.featured = !this.featured
				              }}  className="checkmark" />
				                <p onClick={() => {
					              	this.featured = !this.featured
					              }} className="checkmark-text">Make my job vacancy featured for 7 days ( +99$) <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt />Featured</span></p>
				              </label>
				            </label>
				          </div>
				        </div>
				        <span className="line" />
				        {
				        	this.props.user ? ""
				        	: 			        <div className="company-info">
				          <h5>Company info</h5>
				          <div className="upload-image">
				            <div className="upload-image__img" style={{backgroundImage: 'url("/assets/toolkit/images/014-company.svg")'}} />
				          </div>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
				            <input id="company_name" ref={node => this.company_name = node} className="input" type="ema" placeholder="Type your company name" />
				          </label>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
				            <input 
				            	onChange={e => this.setState({company_email:e.target.value})} 
				            	ref={node => this.company_email = node} 
				            	id="job_company_email" 
				            	className="input" 
				            	type="ema" 
				            	placeholder="Your Email here" />
				          </label>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
				            <input id="company_website" ref={node => this.company_website = node} className="input" type="ema" placeholder="Company website" />
				          </label>
								<CardForm card_denied={this.state.card_denied}/>
				        </div> 
				        }
						<SignUpQuestionModal variables={this.state.variables} />
						<EnterPasswordModal email={this.state.company_email}/>
				          <div className="text-center">
				          {
				          	this.props.user 
				          	? <button className="button blue">Post this job</button>
				          	: <button onClick={this.postJob_onSubmit} type="button" className="button blue">Post this job</button>
				          }
				          	<button id="bbb" ref={node => this.postModalButton = node} style={{display:"none"}} data-open="modal1" type="button" className="button blue">Post this job</button>

				          </div>
				     </form>
			   		}
		      </div>
		   </div>

		);
	}
}

const CreateJob = injectStripe(_CreateJob);

export default CreateJob;
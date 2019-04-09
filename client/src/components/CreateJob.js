import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
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
			description: undefined
		}
		this.once = false
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
	}
	componentDidUpdate(){
		loadToolKit();
	}
	componentDidMount(){
		loadToolKit();
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

	render(){
		return (
			<div>
			   <div className="create-job__layout">
			   	<Mutation mutation={gql`
			   		mutation CreateJob(
			   			$position: String!,$location: String!,$description: String!,
			   			$job_type: JOB_TYPE!, $status: STATUS_TYPE!,$salary: Int!,
			   			$apply_url: String!,$company: ID,$company_name: String,
			   			$company_email: String, $company_website: String, $stripe_token: String!
			   		){
						createJob(
						    position: $position
						    location: $location
						    description: $description
						    job_type: $job_type
						    status: $status
						    salary: $salary
						    apply_url: $apply_url
						    company: $company
							company_name: $company_name
							company_email: $company_email
							company_website: $company_website
							stripe_token: $stripe_token
						  ) {
							    id
							    position
							    location
							    company {
							    	createdBy {
							    		id
							    	}
							    }
							    description
							    apply_url
								company_name
								company_email
								company_website
						  }
						}
			   	`}
			   	>
			   	{(createJob,{loading,error,data}) => {
			   		this.createJob = createJob;
					if (data) {
						return <Redirect to={`/job/${data.createJob.id}`}/>
					}
					if (loading){
						return <p>Loading</p>
					}
					return (
						<form id="post_job" onSubmit={(e) => this.	jobOnSubmit(e,createJob)}>
				        <h4>Create job</h4>
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
						<SignUpQuestionModal noOnClick={(e) => this.jobOnSubmit(e,createJob)}/>
						<EnterPasswordModal email={this.state.company_email}/>
				          <div className="text-center">
				          {
				          	this.props.user 
				          	? <button className="button blue">Post this job</button>
				          	: <button onClick={async (e) => {
				          		e.preventDefault();
								var tokenData = await this.props.stripe.createToken({currency:"usd",amount:500})
								if (!tokenData.token || !tokenData.token.id){
									return;
								}
								console.log(this.postModalButton);
								this.postModalButton.click();
				          	}} type="button" className="button blue">Post this job</button>
				          }
				          	<button id="bbb" ref={node => this.postModalButton = node} style={{display:"none"}} data-open="modal1" type="button" className="button blue">Post this job</button>

				          </div>
				     </form>
				     )
			   	}}
			   	</Mutation>
		      </div>
		   </div>
		);
	}
}

const CreateJob = injectStripe(_CreateJob);

export default injectStripe(CreateJob);
import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";
import SignUpQuestionModal from "./SignUpQuestionModal";
import EnterPasswordModal from "./EnterPasswordModal";
import ReactDOM from 'react-dom';


// ReactDOM.render(<EnterPasswordModal/>,document.getElementById("EnterPasswordModal"));
// ReactDOM.render(<SignUpQuestionModal/>,document.getElementById("SignUpQuestionModal"));

class CreateJob extends React.Component {
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
	}
	render(){
		let position;
		let description;
		let location;
		let salary;
		let job_type;
		let status;
		let apply_url;
		let company;
		let company_name;
		let company_email;
		let company_website;
		if (!this.once){
			window.setInterval(() => {
				if (document.getElementById("post_job")){
					document.getElementById("post_job").submitJob = async () => {
						console.log(99);
						console.log(this.job_type);
						console.log(this.featured);
						let variables = {
							position:document.getElementById("position").value ,	
							description: this.state.description,
							location: this.remote ? "remote/anywhere" : document.getElementById("location").value,	
							salary: Number(document.getElementById("salary").value),	
							job_type: this.job_type,	
							status: this.featured ? "FEATURED" : "NEW",	
							apply_url:document.getElementById("apply_url").value
						}
						console.log(variables);
						if (!this.props.user){
							variables["company_name"] = document.getElementById("company_name").value
							variables["company_email"] = document.getElementById("job_company_email").value
							variables["company_website"] = document.getElementById("company_website").value
						}
						let data = await this.createJob({variables})
						return data.data.createJob;
					}
				}
			},500)
			this.once = true;
		}
		return (
			<div>
			   <div className="create-job__layout">
			   	<Mutation mutation={gql`
			   		mutation CreateJob(
			   			$position: String!,$location: String!,$description: String!,
			   			$job_type: JOB_TYPE!, $status: STATUS_TYPE!,$salary: Int!,
			   			$apply_url: String!,$company: ID,$company_name: String,
			   			$company_email: String, $company_website: String
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
					console.log(this.state.company_email,111);
					return (
						<form id="post_job" onSubmit={async (e) => {
							console.log(99);
							e.preventDefault();
							console.log(this.job_type);
							console.log(this.featured);
							let data = await createJob({variables:{
								position:position.value ,	
								description:description.value ,	
								location: this.remote ? "remote/anywhere" : location.value,	
								salary: Number(salary.value),	
								job_type: this.job_type,	
								status: this.featured ? "FEATURED" : "NEW",	
								apply_url:apply_url.value ,	
								company:this.props.user.company.id
							}})
						}}>
				        <h4>Create job</h4>
				        <div className="create-job">
				          <h5>Your position</h5>
				          <div className="create-job__input">
				            <label className="create-job__input--label"><span className="create-job__input--span">Position</span>
				              <input id="position" ref={node => position = node} className="input" type="ema" placeholder="Software engineer, mobile application developer..." />
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">JOB DESCRIPTION</span>
				              <textarea onChange={e => this.setState({description:e.target.value})} ref={node => description = node} name id cols={30} rows={10} style={{height: '134px', width: '422px'}} defaultValue={""} />
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">Location</span>
				              <input id="location" readOnly ref={node => location = node} className="input" type="ema" placeholder="Location of the job" />
				              <label className="checkbox-container">
				                <input onChange={(e) => {
				                	this.remote ? location.removeAttribute("readonly") : location.setAttribute("readonly",this.remote);
				                	this.remote = !this.remote
				                }}  type="checkbox" defaultChecked="checked" />
				                <span className="checkmark" />
				                <p>Remote/anywhere</p>
				              </label>
				            </label>
				            <label className="create-job__input--label"><span className="create-job__input--span">Salary</span>
				              <input id="salary" ref={node => salary = node} className="input" type="ema" placeholder="Type the salary here" />
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
				              <input id="apply_url" ref={node => apply_url = node} className="input" type="ema" placeholder="Where people can apply" />
				              <label className="checkbox-container">
				                <input type="checkbox" defaultChecked="checked" />
				                <span onClick={() => {
				              	this.featured = !this.featured
				              	console.log(this.featured)
				              }}  className="checkmark" />
				                <p onClick={() => {
					              	this.featured = !this.featured
					              	console.log(this.featured)
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
				            <input id="company_name" ref={node => company_name = node} className="input" type="ema" placeholder="Type your company name" />
				          </label>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
				            <input 
				            	onChange={e => this.setState({company_email:e.target.value})} 
				            	ref={node => company_email = node} 
				            	id="job_company_email" 
				            	className="input" 
				            	type="ema" 
				            	placeholder="Your Email here" />
				          </label>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
				            <input id="company_website" ref={node => company_website = node} className="input" type="ema" placeholder="Company website" />
				          </label>
				          <label className="create-job__input--label"><span className="create-job__input--span">Company card</span>   
				            <form action="/charge" method="post" id="payment-form">
				              <div className="form-row">
				                <div id="card-element">
				                  {/* A Stripe Element will be inserted here. */}
				                </div>
				                {/* Used to display form errors. */}
				                <div id="card-errors" role="alert" />
				              </div>
				            </form>
				          </label>
				        </div> 
				        }
						<SignUpQuestionModal/>
						<EnterPasswordModal email={this.state.company_email}/>
				          <div className="text-center">
				          {
				          	this.props.user 
				          	? <button className="button blue">Post this job</button>
				          	: <button data-open="modal1" type="button" className="button blue">Post this job</button>
				          }
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

export default CreateJob;
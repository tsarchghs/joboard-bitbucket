import React from "react";
import ReactDOM from 'react-dom';
import { Redirect } from "react-router-dom";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

/*<Mutation mutation={gql`
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
*/

class SignUpQuestionModal extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			redirect: false
		}
		this.job = undefined
	}
	render(){
		return (
			ReactDOM.createPortal(
				<div className="reveal open-modal" id="modal1" data-reveal>
				{
					this.state.redirect && <Redirect to={`/job/${this.job}`}/>
				}
			        <div className="modal__header">
			          <img src="/assets/toolkit/images/small-company.svg" alt=""/>
			          <h4>Do you want to create an account ?</h4>
			          <p className="gray">You have already filled the informations of your company, so we can create you an account. But why do you need an account?</p>
			        </div>
			        <div className="modal__hero">
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal1.svg" alt=""/>
			            <p className="gray">See how much time is left for your job vacancy.</p>
			          </div>
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal2.svg" alt=""/>
			            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
			          </div>
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal3.svg" alt=""/>
			            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
			          </div>
			        </div>
			        <div className="modal__footer">
			          <div className="modal__footer-buttons">
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
				            	return (
				            		<a onClick={(e) => createJob(e,this.props.variables)} href="#" className="button gray" data-close aria-label="Close modal">No I don’t want</a>
								);
				           }}
			           </Mutation>
			            <a onClick={() => console.log(1)} data-open="modal2" href="#" className="button blue">Yes, I want to create account</a>
			          </div>
			          <p className="gray">*By not creating account you will not be able to edit the job listing.</p>
			        </div>
		      </div>
		      ,document.body
			)
		)
	}
}

export default SignUpQuestionModal;
import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

class CompanySettings extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			success: undefined,
			name: this.props.company.name,
			email: this.props.company.email,
			website: this.props.company.website
		}
	}
	render(){
		return (
 			<div>
		       	<DashboardSidebar/>
		        <div className="dashboard-layout">
		          <div className="company-info company-settings">
				  <Mutation
				  	mutation={gql`
					  mutation UpdateCompany(
						$name: String!
						$email: String!
						$website: String!
					  ) {
						  updateCompany(
							name: $name
							email: $email
							website: $website
						  ){
							  success
						  }
					  }
					`}>
						{(updateCompany,{loading,error,data}) => {
							return (
								<form onSubmit={async e => {
									e.preventDefault()
									this.setState({
										success: undefined
									})
									let res = await updateCompany({
										variables:{
											email: this.state.email,
											name: this.state.name,
											website: this.state.website
										}
									})
									if (res.data.updateCompany.success){
										this.setState({success: true})
									}
								}}>
									<h5>Company settings</h5>
									<div className="upload-image">
										<div className="upload-image__img" style={{
											backgroundImage:
												this.props.company.logo
													? this.props.company.logo.url
													: 'url("/assets/toolkit/images/014-company.svg")'
										}} />
									</div>
									{
										this.state.success && <h3>Changed company settings!</h3>
									}
									<label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
										<input className="input" type="text" value={this.state.name} onChange={e => this.setState({"name":e.target.value})} placeholder="Type your company name" />
									</label>
									<label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
										<input className="input" type="email" value={this.state.email} onChange={e => this.setState({"email":e.target.value})} placeholder="Your Email here" />
									</label>
									<label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
										<input className="input" type="text" value={this.state.website} onChange={e => this.setState({"website":e.target.value})} placeholder="Company website" />
									</label>
									<div>
										<button type="submit" className="button blue">Save changes</button>
									</div>
								</form>
							)
						}}
				  </Mutation>
		          </div>
		        </div>
	      </div>
		);
	}
}

export default CompanySettings;
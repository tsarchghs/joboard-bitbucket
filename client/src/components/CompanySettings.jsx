import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { gql, Mutation, withApollo } from "../lib/apolloCompat";
import { handleUploadPhotoInput } from "../helpers";
import { GET_LOGGED_IN_USER } from "../Queries";
import LoadingAnimation from "./LoadingAnimation";

class CompanySettings extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			success: undefined,
			name: this.props.company.name,
			email: this.props.company.email,
			website: this.props.company.website
		}
		this.companyLogoDiv = undefined;
		this.companyLogoInput = undefined;
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
						$logo: String
					  ) {
						  updateCompany(
							name: $name
							email: $email
							website: $website
							logo: $logo
						  ){
								id
								name
								website
								email
								logo {
									id
									url
								}
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
									console.log({
										variables: {
											email: this.state.email,
											name: this.state.name,
											website: this.state.website,
											logo: this.companyLogoInput.base64
										}
									},33);
									let res = await updateCompany({
										variables:{
											email: this.state.email,
											name: this.state.name,
											website: this.state.website,
											logo: this.companyLogoInput.base64
										}
									})
									try {
										let cached = this.props.client.readQuery({
											query: GET_LOGGED_IN_USER
										})
										let cached_user = cached.getLoggedInUser;

										let updated_company = res.data.updateCompany;

										cached_user.company = {
											jobs: cached_user.company.jobs,
											...updated_company
										}
										this.props.client.writeQuery({
											query: GET_LOGGED_IN_USER,
											data: cached
										})
									} catch (e) {
										console.log(e);
									}
									this.setState({success: true})
								}}>
									<h5>Company settings</h5>
									<div className="upload-image">
										<div className="upload-image__img" ref={node => this.companyLogoDiv = node} style={{
											backgroundImage:
												this.props.company.logo
													? `url("${this.props.company.logo.url}")`
													: 'url("/assets/toolkit/images/014-comany.svg")'
											,
											backgroundSize: "cover"
									}} />
										<div className="upload-image">
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
									</div>
									{
										this.state.success && <h3>Changed company settings!</h3>
									}
									{
										error && error.message === "GraphQL error: Email is taken"
										? <h3>Email is already taken</h3>
										: null
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
									{
										loading
										? <LoadingAnimation loading_type={2} width={"15%"}/>
										: <button type="submit" className="button blue">Save changes</button>
									}
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

export default withApollo(CompanySettings);

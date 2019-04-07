import React from "react";
import DashboardSidebar from "./DashboardSidebar";

class CompanySettings extends React.Component {
	render(){
		return (
 			<div>
		       	<DashboardSidebar/>
		        <div className="dashboard-layout">
		          <div className="company-info company-settings">
		            <h5>Company settings</h5>
		            <div className="upload-image">
		              <div className="upload-image__img" style={{
	              		backgroundImage: 
	              			this.props.company.logo 
	              			? this.props.company.logo.url 
	              			: 'url("/assets/toolkit/images/014-company.svg")'
		              }} />
		            </div>
		            <label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
		              <input className="input" type="email" value={this.props.company.name} placeholder="Type your company name" />
		            </label>
		            <label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
		              <input className="input" type="email" value={this.props.company.email}  placeholder="Your Email here" />
		            </label>
		            <label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
		              <input className="input" type="email" value={this.props.company.website} placeholder="Company website" />
		            </label>
		            <div>
		              <button className="button blue">Save changes</button>
		            </div>
		          </div>
		        </div>
	      </div>
		);
	}
}

export default CompanySettings;
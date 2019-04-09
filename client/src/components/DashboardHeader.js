import React from "react";
import Cookies from 'js-cookie';
import { loadToolKit } from "../helpers";

class DashboardHeader extends React.Component {
	constructor(props){
		super(props);
		this.logout = this.logout.bind(this);
	}
	logout() {
		Cookies.set("token",undefined);
		this.props.refetchApp();
	}
	componentDidMount(){
		loadToolKit();
	}
	componentDidUpdate(){
		loadToolKit();
	}
	render(){
		return (
			<div className="dashboard-header">
	          <p className="dashboard-header__title">Dashboard</p>
	          <div className="dashboard-header__settings">
	            <div className="dashboard-header__login">
	              <div 
	              	className="dashboard-header__profile" 
	              	style={{
	              		backgroundImage: 
	              			this.props.user.company.logo 
	              			? this.props.user.company.logo.url 
	              			: 'url("/assets/toolkit/images/014-company.svg")'
	              	}} />
	              <img src="/assets/toolkit/images/gray-arrow.svg" alt=""/>
	            </div>
	            <div className="dashboard-header__dropdown">
	              <a href="#" onClick={this.logout}>Logout</a>
	            </div>
	          </div>
	        </div>
		);
	}
}

export default DashboardHeader;
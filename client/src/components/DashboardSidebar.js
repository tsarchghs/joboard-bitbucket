import React from "react";
import {Link} from "react-router-dom";

class DashboardSidebar extends React.Component {
	render() {
		var url = window.location.href.split("/")
		var url = url[url.length-1];
		if (url[url.length-1] === "#"){
			url = url.slice(0,url.length-1);
		}
		console.log(url);
		return (
	        <div className="sidebar">
	          <h3 className="sidebar__title">Flutter.jobs</h3>
	          <div className="sidebar__ul">
	            <Link to="/dashboard" className={url === "dashboard" ? "active" : ""}>
	            	<img src="/assets/toolkit/images/listing.svg" alt /><span>Job listing</span>
	            </Link>
	            <Link to="/payments" className={url === "payments" ? "active" : ""}>
	            	<img src="/assets/toolkit/images/payment.svg" alt /><span>Payments</span>
	            </Link>
	            <Link to="/settings" className={url === "settings" ? "active" : ""}>
		            <img src="/assets/toolkit/images/settings.svg" alt /><span>Company Settings</span>
		        </Link>
	          </div>
	        </div>
		);
	}
}

export default DashboardSidebar;
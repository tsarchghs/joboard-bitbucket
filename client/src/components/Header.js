import React from "react";
import { Link } from "react-router-dom";

class Header extends React.Component {
	render(){
		return (
	        <div className="header">
	          <div className="header__container">
	            <div className="header__content">
		          <Link to="/">
		            <div className="header__logo"><a href="#">Flutter.jobs</a></div>
		          </Link>
	              <div className="header__nav">
	              {
	              	!this.props.user 
	              	? <Link to="/login">
		                	<a href="#" className="header__nav-login">Login</a>
		                </Link>
		            : <Link to="/dashboard">
		                	<a href="#" className="header__nav-login">Dashboard</a>
		                </Link>
	              }
	                <Link to="/create_job">
	                	<a href="#" className="button black">Post a job</a>
	                </Link>
	              </div>
	              <div className="menu menu-1">
	                <span className="menu-item" />
	                <span className="menu-item" />
	                <span className="menu-item" />
	              </div>
	              <div className="header__nav-mobie">
	                <a href="#" className="header__nav-login">Login</a>
	                <a href="#" className="button black">Post a job</a>
	              </div>
	            </div>
	          </div>
	        </div>	
		);
	}
}

export default Header;
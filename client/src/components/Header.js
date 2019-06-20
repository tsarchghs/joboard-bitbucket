import React from "react";
import { Link } from "react-router-dom";

class Header extends React.Component {
	render(){
		return (
	        <div className="header">
	          <div className="header__container">
	            <div className="header__content">
		          <Link to="/">
		            <div className="header__logo"><Link to="/">Flutter.jobs</Link></div>
		          </Link>
	              <div className="header__nav">
	              {
	              	!this.props.user 
	              	? <Link to="/login">
		                	<a href="/login" className="header__nav-login">Login</a>
		                </Link>
		            : <Link to="/dashboard">
		                	<a href="/dashboard" className="header__nav-login">Dashboard</a>
		                </Link>
	              }
	                <Link to="/create_job">
	                	<a href="/create_job" className="button black">Post a job</a>
	                </Link>
	              </div>
	              <div className="menu menu-1">
	                <span className="menu-item" />
	                <span className="menu-item" />
	                <span className="menu-item" />
	              </div>
	              <div className="header__nav-mobie">
				  <Link to="/login">
	                <a href="/login" className="header__nav-login">Login</a>
				  </Link>
				  <Link to="/create_job">
	                <a href="/create_job" className="button black">Post a job</a>
				  </Link>
	              </div>
	            </div>
	          </div>
	        </div>	
		);
	}
}

export default Header;
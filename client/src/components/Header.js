import React from "react";
import { Link } from "react-router-dom";

class Header extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			navMobile: false
		}
	}
	render(){
		return (
	        <div className="header">
	          <div className="header__container">
	            <div className="header__content">
		          <Link to="/">
		            <div className="header__logo"><Link to="/"><img src="/assets/flutterjobs.svg"/></Link></div>
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
	              <div onClick={() => this.setState(nextState => {
					  nextState.navMobile = !nextState.navMobile;
					  return nextState; 
				  })} className={`menu menu-1 ${this.state.navMobile ? "open" : ""}`}>
	                <span className="menu-item" />
	                <span className="menu-item" />
	                <span className="menu-item" />
	              </div>
	              <div className={`header__nav-mobie ${this.state.navMobile ? "open" : ""}`}>
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
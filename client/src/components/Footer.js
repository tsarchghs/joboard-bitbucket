import React from "react";
import { Link } from "react-router-dom";

class Footer extends React.Component {
	// constructor(props){
	// 	super(props)
	// 	this.state = {
	// 		navMobile: false
	// 	}
	// }
	render(){
		return (
	        <div className="footer">
                <div className="footer__title">
                    <Link to="/"><img src="../../assets/toolkit/images/fl-logo.svg" alt="" /></Link>
                    <div>
                        <Link to="/"><img src="../../assets/toolkit/images/flutterjobs-io.svg" alt=""/></Link>
                        <p>Find only Flutter jobs!</p>
                    </div>
                </div>
                <div className="footer__contact">
                    <p>Find us on  <a href="http://www.twitter.com">Twitter!</a></p>
                    <p>Contact us at <a href="#">info@flutterjobs.io</a></p>
                </div>
            </div>
		);
	}
}

export default Footer;
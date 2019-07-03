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
                    <Link to="/"><img style={{width:54}} src={window.__PUBLIC_DATA__.favicon_path} alt="" /></Link>
                    <div>
                        <Link to="/"><img className="domain-svg-footer" src={window.__PUBLIC_DATA__.domain_svg} alt=""/></Link>
                        <p>{window.__PUBLIC_DATA__.find_only_text}</p>
                    </div>
                </div>
                <div className="footer__contact">
                    <p>Find us on  <a href={window.__PUBLIC_DATA__.twitter}>Twitter!</a></p>
                    <p>Contact us at <a href="#">{window.__PUBLIC_DATA__.email}</a></p>
                </div>
            </div>
		);
	}
}

export default Footer;
import React from "react";
import ReactDOM from 'react-dom';

const EnterPasswordModal = (props) => {
	console.log(props);
	return ReactDOM.createPortal(
	      <div className="reveal open-modal reset" id="modal2" data-reveal>
	        <div className="modal__header">
	          <img src="/assets/toolkit/images/small-company.svg" alt />
	          <h4>We are happy to have you inside?</h4>
	          <p className="gray">We just need a password for you.</p>
	        </div>
	        <div className="modal__hero">
	          <label className="create-job__input--label"><span className="create-job__input--span">Your email</span>
	            <p>{props.email}</p>
	          </label>
	          <label className="create-job__input--label"><span className="create-job__input--span">Password</span>
	            <input className="input" type="password" placeholder="Your password here" />
	          </label>
	          <a href="#" className="button blue">Let me in</a>
	        </div>
	      </div>
	      ,document.body
	);
} 

export default EnterPasswordModal;
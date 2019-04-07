import React from "react";
import ReactDOM from 'react-dom';
import { Redirect } from "react-router-dom";

class SignUpQuestionModal extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			redirect: false
		}
		this.job = undefined
	}
	render(){
		return (
			ReactDOM.createPortal(
				<div className="reveal open-modal" id="modal1" data-reveal>
				{
					this.state.redirect && <Redirect to={`/job/${this.job}`}/>
				}
			        <div className="modal__header">
			          <img src="/assets/toolkit/images/small-company.svg" alt />
			          <h4>Do you want to create an account ?</h4>
			          <p className="gray">You have already filled the informations of your company, so we can create you an account. But why do you need an account?</p>
			        </div>
			        <div className="modal__hero">
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal1.svg" alt />
			            <p className="gray">See how much time is left for your job vacancy.</p>
			          </div>
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal2.svg" alt />
			            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
			          </div>
			          <div className="modal__hero-info">
			            <img src="/assets/toolkit/images/modal3.svg" alt />
			            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
			          </div>
			        </div>
			        <div className="modal__footer">
			          <div className="modal__footer-buttons">
			            <a onClick={async (e) => {
			            	e.preventDefault();
			            	let job = await document.getElementById("post_job").submitJob()
			            	this.job = job.id
			            	console.log(job,2222);
			            	window.location.href = `/job/${job.id}`;

			            }} href="#" className="button gray" data-close aria-label="Close modal">No I don’t want</a>
			            <a onClick={() => console.log(1)} data-open="modal2" href="#" className="button blue">Yes, I want to create account</a>
			          </div>
			          <p className="gray">*By not creating account you will not be able to edit the job listing.</p>
			        </div>
		      </div>
		      ,document.body
			)
		)
	}
}

export default SignUpQuestionModal;
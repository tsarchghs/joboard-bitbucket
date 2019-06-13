import React from "react";
import Header from "./Header";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Cookies from 'js-cookie';

class Login extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			email: "",
			password: ""
		}
	}
	render(){
		return (
			<Mutation 
				mutation={gql`
				  mutation Login($email: String!, $password: String!) {
				    login(email: $email, password: $password) {
				      token
				    }
				  }
				`}
			>
			{ (login,{loading,error,data}) =>{
				 let email;
				 let password;
				 let alertMessage;
				 if (error){
				 	if (error.message === "GraphQL error: Invalid credentials"){
				 		alertMessage = "InvalidCredentials"
				 	}
				 	if (error.message === "GraphQL error: Please check that all of your arguments are not empty!"){
				 		alertMessage = "Please check that all of your arguments are not empty!"
				 	}
				 	if (!alertMessage){
				 		return <p>{error.message}</p>
				 	}
				 }
				 return (
				 	<form onSubmit={async (e) => {
				 		e.preventDefault();
				 		data = await login({variables:{email:this.state.email,password:this.state.password}})
						Cookies.set("token",data.data.login.token);
				 		this.props.refetchApp();
				 	}}>
			    	   <div className="login">
				        <Header/>
				        <div className="login__card">
				          <h4>Login</h4>
				          <div className="login__card-inputs">
				          {alertMessage ? alertMessage : ""}
				            {
				            	loading ? <center><img src="http://localhost:3000/assets/toolkit/images/loading_blue.gif"/></center>
				            	:
				            	<div>
					            	<label><span>Email</span>
						              <input value={this.state.email} onChange={(e) => this.setState({email:e.target.value})} className="input" type="text" placeholder="youremail@domain.com" />
						            </label>
						            <label><span>Password</span>
						              <input value={this.state.password} onChange={(e) => this.setState({password:e.target.value})} className="input" type="password" placeholder="Your password here" />
						            </label>
				          <button className="button blue">Sign in</button>
						         </div>
					        }
				          </div>
				          <p>By signing in to your account, you agree to <a href="#">Terms of Service.</a></p>
				        </div>
				        <p className="login__post">Do you want to post a job? <a href="#" className="button">Post a job</a></p>
				      </div>
			    	</form>
			    )
			}}
			</Mutation>
		);
	}
}

export default Login;
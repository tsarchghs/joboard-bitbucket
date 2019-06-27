import React from "react";
import Modal from 'react-modal';
import { Mutation } from 'react-apollo';
import gql from "graphql-tag";
import Cookies from 'js-cookie';
import { withRouter } from "react-router";
import LoadingAnimation from "./LoadingAnimation";

const customStyles = {
    overlay: {
        'backgroundColor': 'rgba(40, 70, 100, 0.7)',
        opacity: 2
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')


class TypePasswordModal extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            email: "", 
            password: "",
            new_email: false
        }
    }
    onChange(e, key) {
        this.setState({
            [key]: e.target.value
        })
    }
    render(){
        return (
            <div>
                <Modal
                    isOpen={this.props.modalIsOpen}
                    onRequestClose={this.props.closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    <div>
                        <div className="modal__header">
                            <img src="/assets/toolkit/images/small-company.svg" alt />
                            <h4>We are happy to have you inside?</h4>
                            <p className="gray">We just need a password for you.</p>
                        </div>
                        <div className="modal__hero">
                            <Mutation 
                                mutation={gql`
                                    mutation Register(
                                        $email: String!
                                        $password: String!
                                        $company: CreateCompanyInput!
                                        $job: ID!
                                    ) {
                                        register(
                                            email: $email
                                            password: $password
                                            company: $company
                                            job: $job
                                        ) {
                                            token
                                        }
                                    }
                                `}
                            >
                                { (signUp,{loading,error,data}) => {
                                    let onSubmit = async (e) => {
                                        e.preventDefault();
                                        this.setState({
                                            error: ""
                                        })
                                        let variables = {}
                                        variables.job = this.props.parent_state.job.id
                                        variables.email = this.state.new_email ? this.state.email : this.props.parent_state.company_email
                                        variables.password = this.state.password
                                        variables.company = {
                                            logo: this.props.parent_state.company_logo,
                                            email: this.state.new_email ? this.state.email : this.props.parent_state.company_email,
                                            website: this.props.parent_state.company_website,
                                            name: this.props.parent_state.company_name
                                        }
                                        console.log(variables,5521);
                                        let res;
                                        try {
                                            res = await signUp({variables})
                                        } catch (e) {
                                            console.log(e,1,e.message)
                                            if (e.message.indexOf("unique")){
                                                this.setState({
                                                    new_email: true,
                                                    error: "Email is already taken."
                                                })
                                            }
                                            return;
                                        }
                                        console.log(res)
                                        Cookies.set("token", res.data.register.token);
                                        await this.props.refetchApp();
                                        this.props.history.push("/dashboard")
                                    } 
                                    return (
                                        <form onSubmit={onSubmit}>
                                            {
                                                !this.state.new_email &&
                                                    <label className="create-job__input--label"><span className="create-job__input--span">Your email</span>
                                                        <p>{this.props.email}</p>
                                                    </label>
                                            }
                                            {
                                                this.state.error
                                            }
                                            {
                                                this.state.new_email &&
                                                    <label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
                                                        <input
                                                            className="input"
                                                            type="email"
                                                            placeholder="Your Email here"
                                                            value={this.state.email}
                                                            onChange={e => this.onChange(e, "email")}
                                                            required
                                                        />
                                                    </label>
                                            }
                                            <label className="create-job__input--label"><span className="create-job__input--span">Password</span>
                                                <input 
                                                    className="input" 
                                                    type="password" 
                                                    placeholder="Your password here" 
                                                    value={this.state.password} 
                                                    onChange={e => this.setState({password: e.target.value})}
                                                />
                                            </label>
                                            {
                                                loading ? 
                                                    <center><LoadingAnimation loading_type={2} width={65} /></center>
                                                :
                                                    <a href="#" className="button blue" onClick={onSubmit}>Let me in</a>
                                            }
                                            
                                        </form>
                                    )
                                }}
                            </Mutation>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(TypePasswordModal);
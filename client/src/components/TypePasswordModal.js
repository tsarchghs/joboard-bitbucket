import React from "react";
import Modal from 'react-modal';
import { Mutation } from 'react-apollo';
import gql from "graphql-tag";
import Cookies from 'js-cookie';
import { withRouter } from "react-router";

const customStyles = {
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
            password: ""
        }
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
                                    let onClick = async () => {
                                        let variables = {}
                                        variables.job = this.props.parent_state.job_id
                                        variables.email = this.props.parent_state.company_email
                                        variables.password = this.state.password
                                        variables.company = {
                                            email: this.props.parent_state.company_email,
                                            website: this.props.parent_state.company_website,
                                            name: this.props.parent_state.company_name
                                        }
                                        let res = await signUp({variables})
                                        console.log(res)
                                        Cookies.set("token", res.data.register.token);
                                        await this.props.refetchApp();
                                        this.props.history.push("/dashboard")
                                    } 
                                    return (
                                        <div>
                                            <label className="create-job__input--label"><span className="create-job__input--span">Your email</span>
                                                <p>{this.props.email}</p>
                                            </label>
                                            <label className="create-job__input--label"><span className="create-job__input--span">Password</span>
                                                <input 
                                                    className="input" 
                                                    type="password" 
                                                    placeholder="Your password here" 
                                                    value={this.state.password} 
                                                    onChange={e => this.setState({password: e.target.value})}
                                                />
                                            </label>
                                            <a href="#" className="button blue" onClick={onClick}>Let me in</a>
                                        </div>
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
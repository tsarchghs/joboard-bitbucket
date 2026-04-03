import React from "react";
import Modal from "react-modal";
import { gql, Mutation, withApollo } from "../lib/apolloCompat";
import compose from "../lib/compose";
import { CardElement, injectStripe } from "../lib/stripeCompat";
import { GET_LOGGED_IN_USER } from "../Queries";
import { cloneDeep } from "lodash";
import LoadingAnimation from "./LoadingAnimation";

const customStyles = {
    overlay: {
        'backgroundColor': 'rgba(40, 70, 100, 0.7)',
        opacity: 1
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: "50%",
        height: "35%"
    }
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')


class _RenewJobModal extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            card_error: "",
            featured: true,
            loading: false
        }
        this.onChange = this.onChange.bind(this)
    }
    onChange(e, key) {
        console.log(12321, e.target)
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
                    contentLabel="Renew job"
                >
                    <Mutation
                        mutation={gql`
                            mutation RenewJob(
                                $id: ID!
                                $stripe_token: String!
                                $featured: Boolean!
                            ){
                                renewJob(
                                    id: $id
                                    stripe_token: $stripe_token
                                    featured: $featured
                                ){
                                    id
                                    location
                                    position
                                    status
                                    job_type
                                    expiresAt
                                }
                            }
                        `}    
                    >
                        { (renewJob,{loading,error,data}) => {
                            return (
                                <form onSubmit={async e => {
                                    e.preventDefault()
                                    this.setState({
                                        loading: true
                                    })
                                    let stripe_res = await this.props.stripe.createToken({ name: "Job Posting" });
                                    if (stripe_res.error) {
                                        this.setState({
                                            card_error: stripe_res.error.message,
                                            loading: false
                                        })
                                        return;
                                    } else {
                                        this.setState({
                                            card_error: ""
                                        })
                                    }
                                    console.log(stripe_res.token.id)
                                    try {
                                        let res = await renewJob({
                                            variables: {
                                                id: this.props.job.id,
                                                stripe_token: stripe_res.token.id,
                                                featured: this.state.featured
                                            }
                                        })
                                        try {
                                            let data = cloneDeep(this.props.client.readQuery({
                                                query: GET_LOGGED_IN_USER
                                            }))
                                            let jobs = data.getLoggedInUser.company.jobs;
                                            jobs.map(job => job.id === this.props.job.id ? res.data.renewJob : job)
                                            this.props.client.writeQuery({
                                                query: GET_LOGGED_IN_USER,
                                                data: data
                                            })
                                        } catch (e) {
                                            console.log(e)
                                        }
                                        this.setState({
                                            loading: false
                                        })
                                        this.props.closeModal(undefined,true)
                                    } catch (e) {
                                        if (e.message.indexOf("CardError") !== -1) {
                                            this.setState({
                                                card_error: e.message.split(":")[2]
                                            })
                                        }
                                        console.log(e)
                                    }
                                }}>
                                    <h1>Renew job</h1>
                                    <label className="create-job__input--label" style={{marginTop:15}}>
                                        <CardElement hidePostalCode={true}/>
                                        <p style={{ "color": "red", margin: 10 }}>{this.state.card_error}</p>
                                    </label>
                                        <label className="checkbox-container">
                                            <input type="checkbox" checked={this.state.featured} onChange={e => this.onChange({ target: { value: !this.state.featured } }, "featured")} />
                                            <span className="checkmark" />
                                            <p className="checkmark-text">Make my job vacancy featured for 7 days (+99$) <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt />Featured</span></p>
                                        </label>
                                        {
                                            this.state.loading 
                                            ? <center><LoadingAnimation loading_type={2} width={"10%"} /></center>
                                            : <button style={{ width: "100%" }} type="submit" className="button blue">Renew this job for ({this.state.featured ? "249" : "199"}$)</button>
                                        }
                                </form>
                            )
                        }}
                    </Mutation>
                </Modal>
            </div>
        );
    }
}

export default compose(withApollo,injectStripe)(_RenewJobModal);

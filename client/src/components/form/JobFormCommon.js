import React from "react";

const JobFormCommon = WrappedComponent => {
    return class extends React.Component {
        constructor(props){
            super(props)
            this.state = {
                position: "",
                editorState: undefined,
                location: "",
                category: "DATA_SCIENTIST",
                salaryInputDisabled: false,
                min_salary: undefined,
                max_salary: undefined,
                remote: false,
                salary_currency: "DOLLAR",
                job_types: ["FULL_TIME"],
                apply_url: "",
                company_logo: undefined,
                company_name: "",
                company_email: "",
                company_website: "",
                featured: false,
                card_error: "",
                loading: false,
                currentModal: null,
                job: undefined,
                hasAccount: false,
                email: "",
                password: "",
                under_company_info_error: "",
                city: window.__PUBLIC_DATA__.use_predefined_location ? "cjxx5ieu1kfxx0b3677nbsntq" : false
            }
            this.onChange = this.onChange.bind(this)
            this.setLoading = this.setLoading.bind(this)
        }
        async createStripeToken() {
            let stripe_res = await this.props.stripe.createToken({ name: "Job Posting" });
            if (stripe_res.error) {
                console.log(stripe_res.error.message, 123);
                this.setState({
                    card_error: stripe_res.error.message,
                    loading: false
                })
                return false;
            } else {
                this.setState({
                    card_error: ""
                })
                console.log(stripe_res);
                return stripe_res.token.id;
            }
        }
        closeModal(e,to) {
            this.setState({
                currentModal: undefined
            })
            this.props.history.push(to ? to : `/job/${this.state.job_id}`)
        }
        openModal(modalName, e) {
            if (e) e.preventDefault();
            this.setState({ currentModal: modalName })
        }
        onChange(e, key) {
            if (key.indexOf("salary") !== -1 && Number(e.target.value) < 0) e.target.value = 0
            if (key === "job_types") {
                e.persist()
                this.setState(prevState => {
                    let val = e.target.value
                    if (prevState.job_types.includes(val)) {
                        prevState.job_types = prevState.job_types.filter(x => x !== val)
                    } else {
                        prevState.job_types.push(val)
                    }
                    return prevState
                })
            } else {
                console.log(123)
                this.setState({
                    [key]: e.target.value
                }, () => {
                    console.log(this.state)
                })
            }
        }
        toggle(val) {
            this.setState(prevState => {
                prevState[val] = !prevState[val]
                return prevState;
            })
        }
        setLoading(bool){
            this.setState({loading:bool})
        }
        render(){
            return (
                <WrappedComponent
                    onChange={this.onChange}
                    setLoading={this.setLoading}
                    {...this.state}
                    {...this.props}
                />
            )
        }
    }
}

export default JobFormCommon;
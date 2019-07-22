import React from "react";
import { withApollo, Mutation, Query } from "react-apollo";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { JOB_QUERY, UPDATE_JOB_MUTATION, COUNTRIES_QUERY } from "../Queries";
import RichEditor from "./RichEditor";
import { convertToHTML } from "draft-convert";
import LoadingAnimation from "./LoadingAnimation";
import PostJobButton from "./form/PostJobButton";
import JobForm from "./form/JobForm";

class _UpdateJobProfile extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            position: "123",
            editorState: undefined,
            location: "",
            salaryInputDisabled: false,
            min_salary: undefined,
            max_salary: undefined,
            remote: false,
            salary_currency: "",
            job_types: [],
            apply_url: "",
            loading: false,
            job: undefined,
            loading_all: true,
            category: undefined,
            city: undefined,
            isRange: false
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.toggle = this.toggle.bind(this)
    }
    toggle(val) {
        this.setState(prevState => {
            prevState[val] = !prevState[val]
            return prevState;
        })
    }
	onChange(e,key){
		if (key.indexOf("salary") !== -1 && Number(e.target.value) < 0) e.target.value = 0
		if (key === "job_types"){
			e.persist()
			this.setState(prevState => {
				let val = e.target.value
				if (prevState.job_types.includes(val)){
					prevState.job_types = prevState.job_types.filter(x => x !== val)
				} else {
					prevState.job_types.push(val)
				}
				return prevState
			})
		} else {
			this.setState({
				[key]: e.target.value
			})
		}
	}
    async componentDidMount(){
        let res = await this.props.client.query({
            query: JOB_QUERY,
            variables:{
                id: this.props.match.params.id
            }
        })
        let job = res.data.job;
        console.log(job,55555);
        this.setState({
            city: job.city ? job.city.id : undefined,
            category: job.category,
            position: job.position,
            location: job.location,
            min_salary: job.min_salary,
            max_salary: job.max_salary,
            salary_currency: job.salary_currency, 
            salaryInputDisabled: !job.min_salary,
            job_types: job.job_types,
            remote: job.remote,
            apply_url: job.apply_url,
            htmlContent: job.description,
            loading_all: false,
            isRange: Boolean(job.max_salary)
        },console.log)
        console.log(job, 11, job.position,1234);
    }
    async onSubmit(e){
        e.preventDefault();
        this.setState({
            loading: true
        })
        let variables = {
            id: this.props.match.params.id,
            city: this.state.city,
            position: this.state.position,
            remote: this.state.remote,
            location: this.state.location,
			min_salary: this.state.salaryInputDisabled ? null : Number(this.state.min_salary),
            max_salary: this.state.salaryInputDisabled ? null : Number(this.state.max_salary),
            salary_currency: this.state.salary_currency,
            job_types: this.state.job_types,
            apply_url: this.state.apply_url,
            category: this.state.category
        }
        if (this.state.editorState) variables.description = convertToHTML(this.state.editorState.getCurrentContent())
        console.log(variables);
        let res = await this.props.client.mutate({
            mutation: UPDATE_JOB_MUTATION,
            variables
        })
        this.props.history.push(`/job/${res.data.updateJob.id}`);
        console.log(res,555);
    }
    render(){
        console.log(this.state.salary,555,this.state);
        return (
                <div className="create-job__layout">
                    <form onSubmit={this.onSubmit}>
                        <h4>Create job</h4>
                        <div className="create-job">
                            <h5>{window.__PUBLIC_DATA__.above_job_position_text}</h5>
                            <center style={{display: this.state.loading_all ? "block" : "none"}}><LoadingAnimation loading_type={2}/></center>
                            <div style={{display: this.state.loading_all ? "none" : "block"}}>
                                <div>
                                    <div className="create-job__input">
                                        <JobForm
                                            user={this.props.user}
                                            category={this.state.category}
                                            onChangeParentApp={editorState => this.setState({ editorState })}
                                            position={this.state.position}
                                            city={this.state.city}
                                            location={this.state.location}
                                            remote={this.state.remote}
                                            isRange={this.state.isRange}
                                            salaryInputDisabled={this.state.salaryInputDisabled}
                                            min_salary={this.state.min_salary}
                                            max_salary={this.state.max_salary}
                                            salary_currency={this.state.salary_currency}
                                            onChange={this.onChange}
                                            rangeOnChange={e => {
                                                this.setState(prevState => {
                                                    prevState.isRange = !prevState.isRange
                                                    prevState.max_salary = undefined;
                                                    return prevState;
                                                })
                                            }}
                                            apply_url={this.state.apply_url}
                                            job_types={this.state.job_types}
                                            toggle={this.toggle}
                                            under_company_info_error={this.state.under_company_info_error}
                                            hasAccount={this.state.hasAccount}
                                            email={this.state.email}
                                            password={this.state.password}
                                            card_error={this.state.card_error}
                                            loading={this.state.loading}
                                            featured={this.state.featured}
                                            companyLogoInput={this.companyLogoInput}
                                            assignNodeToLogo={node => this.companyLogoInput = node}
                                            hideCompany={true}
                                        />
                                        <PostJobButton
                                            loading={this.state.loading}
                                            featured={this.state.featured}
                                            update={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>                    
        );
    }
}

export default compose(withApollo,withRouter)(_UpdateJobProfile);
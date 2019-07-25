import React from "react";
import { Query, Mutation } from "react-apollo";
import { JOB_QUERY } from "../Queries";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import {
	FacebookShareButton,
	TwitterShareButton
} from 'react-share';
import {
	convertToRaw,
} from 'draft-js';
import { stateFromHTML } from "draft-js-import-html";
import { getJobTypes, getAbsoluteUrl, formatSalary } from "../helpers";
import DeleteJobModal from "./DeleteJobModal";

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

class JobProfile extends React.Component {
	constructor(props){
		super(props);
		this.description = undefined
		this.state = {
			currentModal: undefined
		}
	}
	render() {
		console.log(this.props.user, this.props.user && this.props.user.role === "ADMIN")
		return (
			<React.Fragment>
				<Query
					query={JOB_QUERY}
					variables={{
						id: this.props.match.match.params.id
					}}
				>
				{({loading,error,data}) => {
					if (loading) { return <h4>Loading</h4> }
					if (error) { return <h4>{error.message}</h4> }
					let job = data.job;
					if (!this.description){
						let contentState = stateFromHTML(job.description)
						this.description = convertToRaw(contentState);
					}
					let backgroundImage;
					if (job.company) {
						if (job.company.logo && job.company.logo.url){
							backgroundImage = `url("${job.company.logo.url}")`
						} 
					} else if (job.company_logo && job.company_logo.url) {
						backgroundImage = `url("${job.company_logo.url}")`
					}
					return (
						<div>
							<DeleteJobModal
								closeModal={() => this.setState({ currentModal: undefined })}
								modalIsOpen={this.state.currentModal === "DeleteJobModal"}
								job={job}
							/>
							<div>
								</div>
								<div className="inside-page">
								<div className="inside-page__container">
									<div className="inside-page__content">
												<Link to="/" className="back-to"><img src="../../assets/toolkit/images/004-left-arrow.svg" alt=""/><p>Back to other jobs</p></Link>
									<div className="inside-page__card" >
										<div className="flex">
										<div className="card__logo" style={{backgroundImage,backgroundSize:"cover	"}} />
										<div className="card-data">
											<div className="card-data__title"><a href="#" className="card-data__title">{job.position}</a></div>
											<div className="card-data__subtitle"><a href="#" className="card-data__subtitle">{job.company ? job.company.name : job.company_name}</a></div>
											<div className="card-data__info">
														<div className="card-data__info--data">
														<p><img src="/assets/toolkit/images/gray-placeholder.svg" alt />{window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location} {job.remote ? "Or remote/anywhere" : ""}</p>
														<p><img src="/assets/toolkit/images/gray-portfolio.svg" alt />{getJobTypes(job.job_types)}</p>
														{
															!job.min_salary ? null :
															<p><img src="/assets/salary.svg" alt />
																{`${formatSalary(job.min_salary,job.salary_currency)}`}
																{job.max_salary ? `- ${formatSalary(job.max_salary,job.salary_currency)}` : null}
															</p>
														}
														</div>
											<a href={job.company ? getAbsoluteUrl(job.company.website) : getAbsoluteUrl(job.company_website) } target="_blank"><img src="/assets/toolkit/images/grid-world.svg" alt />Company Website</a>
											</div>
										</div>
										</div>
										<div className="card__button">
										<p className="gray">Posted {monthNames[new Date(job.createdAt).getMonth()]} {new Date(job.createdAt).toLocaleDateString().split("/")[1] }</p>
										<a target="_blank"  href={getAbsoluteUrl(job.apply_url)} className="button blue">Apply for this job</a>
										{
											this.props.user && this.props.user.role === "ADMIN" &&
											<React.Fragment>
												<Link to={`/job/update/${job.id}`}>
													<p href={getAbsoluteUrl(job.apply_url)} style={{backgroundColor:"orange"}} className="button blue">Update</p>
												</Link>	
												<p onClick={() => this.setState({ currentModal: "DeleteJobModal"})} style={{ backgroundColor: "red" }} className="button blue">Delete</p>
											</React.Fragment> 
										}
										</div>
									</div>
									<div className="inside-page__description">
										<div dangerouslySetInnerHTML={{
											__html:job.description
										}} style={{"whiteSpace":"pre-line"}} className="inside-page__description-part">
										</div>
													<a target="_blank" style={{marginBottom: "35px"}} href={getAbsoluteUrl(job.apply_url)} className="button blue">Apply for this job</a>													
									</div>
														<div class="socials with-border">
														<FacebookShareButton title={job.position} url={`${window.location.href.slice(0,-1)}${window.location.pathname}`}>
															<p class="button button--fb"><img src="../../assets/toolkit/images/fb.svg" alt=""/>Share on Facebook</p>
														</FacebookShareButton>
														<TwitterShareButton url={`${window.location.href.slice(0,-1)}${window.location.pathname}`}>
															<p class="button button--tw"><img src="../../assets/toolkit/images/tw.svg" alt=""/>Share on Twitter</p>
														</TwitterShareButton>
														</div>
									</div>
												<Footer/>
								</div>
							</div>
						</div>
						)
				}}
				</Query>
			</React.Fragment>
		);
	}
}

export default JobProfile;
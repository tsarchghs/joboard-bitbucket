import React from "react";
import { Query } from "react-apollo";
import { JOB_QUERY } from "../Queries";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import {
	FacebookShareButton,
	TwitterShareButton
} from 'react-share';
import MetaTags from 'react-meta-tags';
import {
	convertToRaw,
} from 'draft-js';
import { stateFromHTML } from "draft-js-import-html";
import { EditorState } from "draft-js"

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

class JobProfile extends React.Component {
	constructor(props){
		super(props);
		this.description = undefined;
	}
	getJobType(jobType){
		console.log(jobType);
		if (jobType === "FULL_TIME"){
			jobType = "Full Time";
		} else if (jobType === "PART_TIME"){
			jobType = "Part Time";
		} else if (jobType === "CONTRACT"){
			jobType = "Contract";
		} else if (jobType === "FREELANCNE"){
			jobType = "Freelance";
		}
		return jobType;
	}
	getAbsoluteUrl = (url) => {
		if (url.indexOf("http") === -1) {
			let tmp = `http://${url}`;
			return tmp;
		}
		return url;
	}
	render() {
		return (
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
				console.log(job);
				if (!this.description){
					let contentState = stateFromHTML(job.description)
					this.description = convertToRaw(contentState);
				}
				console.log(data);
				console.log(job,123)
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
						<meta property="og:title" content="your_link_title"/>
						<meta property="og:image" content="your_image_url"/>		
						<MetaTags>
							<title>Flutterjobs - {job.position}</title>
							<meta property="og:title" content={job.position} />
							<meta name="description" content={this.description} />
							<meta property="og:image" content={backgroundImage} />
						</MetaTags>
						<div>
					    	</div>
							
					        <div className="inside-page">
					          <div className="inside-page__container">
					            <div className="inside-page__content">
											<Link to="/" className="back-to"><img src="../../assets/toolkit/images/004-left-arrow.svg" alt=""/><p>Back to other jobs</p></Link>
					              <div className="inside-page__card" >
					                <div className="flex">
					                  <div className="card__logo" style={{backgroundImage}} />
					                  <div className="card-data">
					                    <div className="card-data__title"><a href="#" className="card-data__title">{job.position}</a></div>
					                    <div className="card-data__subtitle"><a href="#" className="card-data__subtitle">{job.company ? job.company.name : job.company_name}</a></div>
					                    <div className="card-data__info">
																<div className="card-data__info--data">
																	<p><img src="/assets/toolkit/images/gray-placeholder.svg" alt />{job.location}</p>
																	<p><img src="/assets/toolkit/images/gray-portfolio.svg" alt />{this.getJobType(job.job_type)}</p>
													{
														!job.salary ? null :
															<p><img src="/assets/salary.svg" alt />{job.salary}$</p>
													}
																</div>
					                      <a href={job.company ? this.getAbsoluteUrl(job.company.website) : this.getAbsoluteUrl(job.company_website) } target="_blank"><img src="/assets/toolkit/images/grid-world.svg" alt />Company Website</a>
					                    </div>
					                  </div>
					                </div>
					                <div className="card__button">
					                  <p className="gray">Posted {monthNames[new Date(job.createdAt).getMonth()]} {new Date(job.createdAt).toLocaleDateString().split("/")[1] }</p>
									  <a target="_blank"  href={this.getAbsoluteUrl(job.apply_url)} className="button blue">Apply for this job</a>
					                </div>
					              </div>
					              <div className="inside-page__description">
					                <div dangerouslySetInnerHTML={{
										__html:job.description
									}} style={{"whiteSpace":"pre-line"}} className="inside-page__description-part">
					                </div>
					              </div>
													<div class="socials with-border">
													<FacebookShareButton title={job.position} url={`https://www.flutterjobs.io${window.location.pathname}`}>
														<p class="button button--fb"><img src="../../assets/toolkit/images/fb.svg" alt=""/>Share on Facebook</p>
													</FacebookShareButton>
													<TwitterShareButton url={`https://www.flutterjobs.io${window.location.pathname}`}>
														<p style={{marginLeft:30}} class="button button--tw"><img src="../../assets/toolkit/images/tw.svg" alt=""/>Share on Twitter</p>
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

		);
	}
}

export default JobProfile;
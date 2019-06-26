import React from "react";
import { Query } from "react-apollo";
import { JOB_QUERY } from "../Queries";

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

class JobProfile extends React.Component {
	getUrl(s){
		var prefix = 'http://';
		if (s.substr(0, prefix.length) !== prefix) {
			s = prefix + s;
		}
		return s;
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
				console.log(data);
				let job = data.job;
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
						<div>
					        </div>
					        <div className="inside-page">
					          <div className="inside-page__container">
					            <div className="inside-page__content">
					              <div className="inside-page__card" style={{paddingLeft:0,paddingRight:0}}>
					                <div className="flex">
					                  <div className="card__logo" style={{backgroundImage}} />
					                  <div className="card-data">
					                    <div className="card-data__title"><a href="#" className="card-data__title">{job.position}</a></div>
					                    <div className="card-data__subtitle"><a href="#" className="card-data__subtitle">{job.company ? job.company.name : job.company_name}</a></div>
					                    <div className="card-data__info">
											<div  style={{display:'flex'}}>
												<p><img src="/assets/toolkit/images/gray-placeholder.svg" alt />{job.location}</p>
												<p><img src="/assets/toolkit/images/gray-portfolio.svg" alt />{this.getJobType(job.job_type)}</p>
												{
													!job.salary ? null : 
														<p><img src="/assets/salary.svg" alt />{job.salary}$</p>
												}
											</div>
					                      <a href={job.company ? this.getUrl(job.company.website) : this.getUrl(job.company_website) } target="_blank"><img src="/assets/toolkit/images/grid-world.svg" alt />{job.company ? job.company.website : job.company_website }</a>
					                    </div>
					                  </div>
					                </div>
					                <div className="card__button">
					                  <p style={{marginLeft:10}} className="gray"></p>
											{monthNames[new Date(job.createdAt).getMonth()]} {new Date(job.createdAt).getDay() }
									  <a target="_blank"  href={this.getUrl(job.apply_url)} className="button blue">Apply for this job</a>
					                </div>
					              </div>
					              <div className="inside-page__description">
					                <div dangerouslySetInnerHTML={{
										__html:job.description
									}} style={{"whiteSpace":"pre-line"}} className="inside-page__description-part">
					                </div>

					              </div>
					            </div>
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
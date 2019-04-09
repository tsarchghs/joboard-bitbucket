import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

class JobProfile extends React.Component {
	render() {
		return (
			<Query
				query={gql`
					query {
						job(id:"${this.props.match.match.params.id}") {
							id
							position
							company {
								id
								logo {
									id
									url
								}
								name
								website
								email
							}
							expiresIn
							description
							apply_url
							location
							company_name
							company_website
							company_email
							createdAt
						}
					}
				`}
			>
			{({loading,error,data}) => {
				if (loading) { return <h4>Loading</h4> }
				if (error) { return <h4>{error.message}</h4> }
				console.log(data);
				let job = data.job;
				return (
					<div>
						<div>
					        </div>
					        <div className="inside-page">
					          <div className="inside-page__container">
					            <div className="inside-page__content">
					              <div className="inside-page__card">
					                <div className="flex">
					                  <div className="card__logo" style={{
						              		backgroundImage: 
						              			job.company && job.company.logo 
						              			? job.company.logo.url 
						              			: 'url("http://www.courmayeur-montblanc.com/themes/funivie/img/gourmet/no_logo.jpg")'
					                  }} />
					                  <div className="card-data">
					                    <div className="card-data__title"><a href="#" className="card-data__title">{job.position}</a></div>
					                    <div className="card-data__subtitle"><a href="#" className="card-data__subtitle">{job.company ? job.company.name : job.company_name}</a></div>
					                    <div className="card-data__info">
					                      <p><img src="/assets/toolkit/images/gray-placeholder.svg" alt />{job.location}</p>
					                      <p><img src="/assets/toolkit/images/gray-portfolio.svg" alt />{job.company ? job.company.email : job.company_email }</p>
					                      <a href="#"><img src="/assets/toolkit/images/grid-world.svg" alt />{job.company ? job.company.website : job.company_website}</a>
					                    </div>
					                  </div>
					                </div>
					                <div className="card__button">
					                  <p style={{marginLeft:10}} className="gray">{new Date(job.createdAt).toLocaleDateString()} {new Date(job.expiresIn).toLocaleDateString()}</p>
					                  <a target="_blank"  href={job.apply_url} className="button blue">Apply for this job</a>
					                </div>
					              </div>
					              <div className="inside-page__description">
					                <div style={{"whiteSpace":"pre-line"}} className="inside-page__description-part">
					                  {job.description ? job.description : "No description"}
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
import React from "react";
import Header from "./Header";
import { loadToolKit, daysDifference } from "../helpers";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Cookies from 'js-cookie';
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { Link } from "react-router-dom";

class Dashboard extends React.Component {
	constructor(props){
		super(props);
	}
	componentDidMount(){
		loadToolKit();
	}
	componentDidUpdate(){
		loadToolKit();
	}
	render(){
		loadToolKit();
		console.log(232);
		return (
          <Query query={gql`
              query {
                getLoggedInUser{
                  id
                  company {
                    id
                    name
                    website
                    email
                    logo {
                      id
                      url
                    }
                    jobs {
                        id
                        location
                        position
                        status
                        status
                        job_type
                        expiresIn
                    }
                  }
                }
              }
          `}>
          {({loading,error,data}) => {
          		if (loading) {
          			return <p>Loading</p>
          		}
          		if (error) {
          			return <p>{error.message}</p>
          		}
          		let user = data.getLoggedInUser;
          		return (
					<div>
					<DashboardSidebar/>
			        <div className="dashboard-layout">
			          <div className="dashboard-layout__header dashboard-jl">
			            <div className="card">
			              <div className="card__logo" 
				              	style={{
				              		backgroundImage: 
				              			user.company.logo 
				              			? user.company.logo.url 
				              			: 'url("/assets/toolkit/images/014-company.svg")'
			              	}} />
			              <div className="card-data">
			                <div className="card-data__title">{user.company.name}</div>
			                <div className="card-data__info">
			                  <a href="#"><img src="/assets/toolkit/images/grid-world.svg" alt />{user.company.website}</a>
			                  <a href="#"><img src="/assets/toolkit/images/envelope.svg" alt />{user.company.email}</a>
			                </div>
			              </div>
			            </div>		<div className="jobs-card">
			              <div className="jobs-card__post">
			                <div className="jobs-card__number">
			                  <div className="jobs-card__icon"><img src="/assets/toolkit/images/listing.svg" alt /></div>
			                  <p>{user.company.jobs.length}</p>
			                </div>
			                <div className="jobs-card__title">Jobs posted</div>
			              </div>
			            </div>	</div>
			          <div className="dashboard-layout__hero">
			            <h4 className="job-listing-table__title">Job listings</h4>
						            
			            	{
			            		user.company.jobs.map(job => {
			            			return (
							            <div className="job-listing-table__list no-border">
							              <div className="job-listing-table__logo" style={{
						              		backgroundImage: 
						              			user.company.logo 
						              			? user.company.logo.url 
						              			: 'url("/assets/toolkit/images/014-company.svg")'
							              }} />
							              <div className="job-listing-table__info">
							                <h4>
							                	<Link to={`/job/${job.id}`}>
							                  		<p>{job.position}</p>
							                  	</Link>
							                </h4>
							                <h5>
								                <Link to={`/job/${job.id}`}>
								                  <p>{user.company.name}</p>
								                </Link>
							                </h5>
							              </div>
							              <div className="job-listing-table__time">
								              {
								              	new Date().getTime() < new Date(job.expiresIn).getTime() 
								              	? <h5 className><img src="/assets/toolkit/images/time-left.svg" alt />
								              		{`${daysDifference(new Date(),new Date(job.expiresIn))} days left`}
								              	  </h5>
								              	: ""
								              }
							                <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt />{job.location}</h5>
							              </div>
							              <div className="job-listing-table__more">
								              {
								              	new Date().getTime() < new Date(job.expiresIn).getTime() 
								              	? ""
								              	: <a href="#" class="button blue">Renew</a>
								              }
							                <a href="#"><img src="/assets/toolkit/images/more.svg" alt /></a>
							              </div>
							            </div>	
			            			);
			            		})
			            	}

			          </div>
			          </div>
				   </div>
				);
			}}
			</Query>
		);
	}
}
export default Dashboard;
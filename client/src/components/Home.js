import React from "react";
import { loadToolKit } from "../helpers";
import { debounce } from "lodash";
import { withApollo, Query } from 'react-apollo';
import gql from "graphql-tag";
import Footer from "./Footer";

import { Link } from "react-router-dom";
import { loadAfterHomeMount } from "../helpers"
import LoadingAnimation from "./LoadingAnimation";

class Home extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			search_value: undefined,
			job_type: undefined,
			featured_jobs: undefined,
			today_jobs: undefined,
			week_jobs: undefined,
			month_jobs: undefined
		}
		this.jobTypeRef = undefined;
		this.update = debounce(this.update.bind(this),250);
		this.updateFilter = this.updateFilter.bind(this)
		this.updateJobs = this.updateJobs.bind(this)
	}
	componentDidMount(){
		loadAfterHomeMount()
		this.jobTypeRef.onchange = this.update;
		this.update();
	}
	async updateJobs(to,id_not_in, status_not_in, status_type, createdAt_gte, createdAt_lte, first,skip,orderBy){
		let variables = {
			jobFilter: {
				id_not_in,
				status_not_in,
				location_contains: this.state.only_remote ? "remote/everywhere" : this.state.search_value,
				status_type,
				job_type: this.jobTypeRef && this.jobTypeRef.value === "ALL" ? undefined : this.jobTypeRef.value,
				createdAt_gte,
				createdAt_lte,
				first,
				skip,
				orderBy
			}
		}
		let res = await this.props.client.query({
			query: gql`
				query Jobs(
					$jobFilter: JobFilterInput
				) {
					jobs(
						jobFilter: $jobFilter
					) {
				    id
				    location
				    position
				    status
				    company {
				      id
				      name
					  logo {
						  id
						  url
					  }
				    }
				    status
				    job_type
					company_logo {
						id
						url
					}
				    company_name
				    company_email
				    company_website	
					}
				}
			`,
			variables
		})
		this.setState({
			[to]: res.data.jobs
		})
	}
	update(){ 
		this.setState({
			featured_jobs: undefined,
			today_jobs:undefined,
			week_jobs:undefined,
			month_jobs: undefined
		})
		this.updateJobs("featured_jobs",undefined, undefined, "FEATURED");
		this.updateJobs("today_jobs",undefined, undefined, "TODAY");
		this.updateJobs("week_jobs", undefined, undefined, "WEEK");
		this.updateJobs("month_jobs", undefined, undefined, "MONTH");
		
	}
	updateFilter(e,to){
		this.setState({
			[to]: e.target.value
		})
		this.update()
	}
	getLogo(job){
		let backgroundImage;
		if (job.company) {
			if (job.company.logo && job.company.logo.url) {
				backgroundImage = `url("${job.company.logo.url}")`
			} else {
				backgroundImage = 'url("/assets/toolkit/images/	014-copany.svg")';
			}
		} else if (job.company_logo && job.company_logo.url) {
			backgroundImage = `url("${job.company_logo.url}")`
		} else {
			backgroundImage = 'url("/assets/toolkit/images/	014-compay.svg")';
		}
		return backgroundImage
	}
	render(){
		return (
	      <div className="master-layout">
	        <div className="master-layout__header">
	          <h1>Find only Flutter jobs!</h1>
	          <h5>Flutter allows you to build beautiful native apps on <br />iOS and Android from a single codebase.</h5>
	          <div className="home__search">
	            <label><span>Location</span>
	              <div className="home__input">
	                <input 
	                	id="searchRef"
						value={this.state.only_remote ? "" : this.state.search_value}
	                	onChange={(e) => this.updateFilter(e,"search_value")}
	                	className="input" 
	                	type="email" 
						disabled={this.state.only_remote}
	                	placeholder="Search for state, city" />
	                <img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
	              </div>
					<label style={{marginTop: 10}} className="checkbox-container">
						<input type="checkbox" checked={this.state.only_remote} onChange={e => this.setState(nextState => {
							nextState.only_remote = !nextState.only_remote;
							nextState.search_value = "";
							this.update();
							return nextState
						 })} />
						<span className="checkmark" />
						<p style={{color: "white"}}>Remote/anywhere</p>
						</label>	           
					</label>
	            <label><span>Type of work</span>
	              <div className="home__select">
	                <select ref={node => this.jobTypeRef = node} data-placeholder="Full time/part time ..." className="chosen-select">
	                  <option value="ALL" default={true}>All</option>
	                  <option value="FULL_TIME">Full Time</option>
	                  <option value="PART_TIME">Part Time</option>
	                  <option value="FREELANCE">Freelance</option>
	                  <option value="CONTRACT">Contract</option>
	                </select>
	                <img className="home__select-before" src="../assets/toolkit/images/portfolio.svg" alt=""/>
	                <img className="home__select-after" src="../assets/toolkit/images/downwards-arrow-key.svg" alt=""/>
	              </div>
	            </label>
	          </div>
	        </div>
	        <div className="master-layout__hero">
	          <div className="home__table">
				{
					this.state.featured_jobs === undefined || (this.state.featured_jobs && this.state.featured_jobs.length)
					? <h4 className="home__table-title">Featured</h4>
					: null
				}
				{
					!this.state.featured_jobs ? <LoadingAnimation loading_type={1}/>
						:
						(
							this.state.featured_jobs.map(job => (
								<div key={job.id} className={`job-listing-table__list home-table ${this.state.featured_jobs[0].id === job.id ? "no-border" : ""}`}>
									<div className="job-listing-table__logo"
										style={{
											backgroundImage: this.getLogo(job)
										}} />
									<div className="job-listing-table__info">
										<Link to={`/job/${job.id}`}>
											<h4>
												{job.position}
											</h4>
											<h5>
												{job.company ? job.company.name : job.company_name}
											</h5>
										</Link>
									</div>
									<div className="job-listing-table__time">
										{
											job.status === "FEATURED"
												? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt="" />Featured</span>
												: <span className="new "><img src="/assets/toolkit/images/blue-star.svg" alt="" />New</span>
										}
										<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />{job.location}</h5>
									</div>
								</div>
							))
						)
				}

				{
					this.state.today_jobs === undefined || (this.state.today_jobs && this.state.today_jobs.length)
						? <h4 className="home__table-title">Today</h4>
						: null
				}
	            {
	            	!this.state.today_jobs ? <LoadingAnimation loading_type={1}/>
	            	: 
	            	(
	            		this.state.today_jobs.map(job => (
			              <div key={job.id} className={`job-listing-table__list home-table ${this.state.today_jobs[0].id === job.id ? "no-border" : ""}`}>
			                <div className="job-listing-table__logo" 
			                style={{
			                	backgroundImage: this.getLogo(job)
			                }} />
				                <div className="job-listing-table__info">
			                	<Link to={`/job/${job.id}`}>
					                  <h4>
					                    {job.position}
					                  </h4>
					                  <h5>
					                   {job.company ? job.company.name : job.company_name}
					                  </h5>
				            		</Link>
				                </div>
			                <div className="job-listing-table__time">
				                {
				                	job.status === "FEATURED" 
				                	? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt=""/>Featured</span>
				                	: <span className="new ">New</span>
				                }
			                  <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt=""/>{job.location}</h5>
			                </div>
		              	</div>
	            		))
	            	)
	            }
				{
					this.state.week_jobs === undefined || (this.state.week_jobs && this.state.week_jobs.length)
					? <h4 className="home__table-title">Week</h4>
					: null
				}	            	
					{ !this.state.week_jobs ? <LoadingAnimation loading_type={1}/>
	            	: 
	            	(
	            		this.state.week_jobs.map(job => (
			              <div key={job.id} className={`job-listing-table__list home-table ${this.state.week_jobs[0].id === job.id ? "no-border" : ""}`}>
								<div className="job-listing-table__logo"
									style={{
										backgroundImage: this.getLogo(job),
									}} />
			                <div className="job-listing-table__info">
			                	<Link to={`/job/${job.id}`}>
				                  <h4>
				                    <p>{job.position}</p>
				                  </h4>
				                  <h5>
				                    <p>{job.company ? job.company.name : job.company_name}</p>
				                  </h5>
				                </Link>
			                </div>
			                <div className="job-listing-table__time">
			                  <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt=""/>{job.location}</h5>
			                </div>
		              	</div>
	            		))
	            	)
	            }
						{
							this.state.month_jobs === undefined || (this.state.month_jobs && this.state.month_jobs.length)
								? <h4 className="home__table-title">Month</h4>
								: null
						}
						{!this.state.month_jobs ? <LoadingAnimation loading_type={1}/>
							:
							(
								this.state.month_jobs.map(job => (
									<div key={job.id} className={`job-listing-table__list home-table ${this.state.month_jobs[0].id === job.id ? "no-border" : ""}`}>
										<div className="job-listing-table__logo"
											style={{
												backgroundImage: this.getLogo(job),
											}} />
										<div className="job-listing-table__info">
											<Link to={`/job/${job.id}`}>
												<h4>
													<p>{job.position}</p>
												</h4>
												<h5>
													<p>{job.company ? job.company.name : job.company_name}</p>
												</h5>
											</Link>
										</div>
										<div className="job-listing-table__time">
											<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />{job.location}</h5>
										</div>
									</div>
								))
							)
						}
						{/* <div class="newsletter">
							<div class="newsletter__title">
								<img src="../../assets/toolkit/images/015-email.svg" alt=""/>
								<p>Get the newest Flutter jobs in your inbox</p>
							</div>
							<div class="newsletter__input">
								<input type="text" placeholder="Your email"/>
								<a href="#" class="button button--blue">Notify me</a>
							</div>
						</div> */}
	        </div>
					<Footer/>
	      </div>
	    </div>
				
		);
	}
}

export default withApollo(Home);
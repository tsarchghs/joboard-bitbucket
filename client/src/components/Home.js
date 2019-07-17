import React from "react";
import { loadToolKit } from "../helpers";
import { debounce } from "lodash";
import { withApollo, Query } from 'react-apollo';
import gql from "graphql-tag";
import Footer from "./Footer";

import { Link } from "react-router-dom";
import { loadAfterHomeMount } from "../helpers"
import LoadingAnimation from "./LoadingAnimation";
import { COUNTRIES_QUERY } from "../Queries";

class Home extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			moveCheckbox: false,
			search_value: undefined,
			job_type: undefined,
			featured_jobs: undefined,
			today_jobs: undefined,
			week_jobs: undefined,
			month_jobs: undefined,
			hideLocationDropdown: true
		}
		this.jobTypeRef = undefined;
		this.update = debounce(this.update.bind(this),250);
		this.updateFilter = this.updateFilter.bind(this)
		this.updateJobs = this.updateJobs.bind(this)
	}
	componentDidMount(){
		loadAfterHomeMount()
		if (this.jobTypeRef) this.jobTypeRef.onchange = this.update;
		this.update();
	}
	async updateJobs(to,id_not_in, status_not_in, status_type, createdAt_gte, createdAt_lte, first,skip,orderBy){
		let variables = {
			jobFilter: {
				id_not_in,
				status_not_in,
				query: this.state.only_remote ? "remote/everywhere" : this.state.search_value,
				status_type,
				job_type: this.jobTypeRef && this.jobTypeRef.value === "ALL" ? undefined : this.jobTypeRef.value,
				createdAt_gte,
				createdAt_lte,
				first,
				skip,
				orderBy,
				city: this.state.city ? this.state.city : undefined
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
					city {
						id
						name
						country {
							id
							name
						}
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
		if (to == "city"){
			this.setState({
				selectedLocation: e.target.id
			})
		}
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
	      <div>
	        <div className="master-layout__header">
	          <h1>{window.__PUBLIC_DATA__.find_only_text}</h1>
	          <div dangerouslySetInnerHTML={{
				  __html: window.__PUBLIC_DATA__.below_find_only_html
			  }}>
			  </div>
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
	                	placeholder="Position, skills" />
	                <img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
	              </div>
					<label style={{marginTop: 10}} className="checkbox-container">
						<input type="checkbox" checked={this.state.only_remote} onChange={e => this.setState(nextState => {
							nextState.only_remote = !nextState.only_remote;
							if (nextState.only_remote){
								nextState.selectedLocation = false;
								nextState.city = undefined
							}
							nextState.hideLocationDropdown = true;
							nextState.search_value = "";
							this.update();
							return nextState
						 })} />
						<span className="checkmark" />
						<p style={{color: "white"}}>Remote/anywhere</p>
					</label>	           
				</label>
				
		{
			window.__PUBLIC_DATA__.use_predefined_location &&
				<React.Fragment>
				<label><span>Location</span>
					<div className="home__input">
						<div className="home__input--extra" style={{cursor:"pointer"}} onClick={e => {
							this.setState(prevState => {
								prevState.hideLocationDropdown = !prevState.hideLocationDropdown 
								return prevState;
							})
						}}>
						<p>{this.state.selectedLocation ? this.state.selectedLocation : "Select location"}</p>
						<img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
										<span className="arrow-down"><img src="../assets/toolkit/images/white-arrow.svg" /></span>
						</div>
						</div>
				</label>

				</React.Fragment>

		}
	            <label>
				<span>Type of work</span>
	              <div className="home__select">
	                <select ref={node => this.jobTypeRef = node} data-placeholder="Full time/part time ..." className="chosen-select">
	                  <option value="ALL" default={true}>All</option>
	                  <option value="FULL_TIME">Full Time</option>
	                  <option value="PART_TIME">Part Time</option>
	                  <option value="FREELANCE">Freelance</option>
					  <option value="CONTRACT">Contract</option>
					  <option value="UNSPECIFIED">Unspecified</option>
	                </select>
	                <img className="home__select-before" src="../assets/toolkit/images/portfolio.svg" alt=""/>
	                <img className="home__select-after" src="../assets/toolkit/images/downwards-arrow-key.svg" alt=""/>
	              </div>
	            </label>
	          </div>
					 <Query query={COUNTRIES_QUERY}>
					 	{({loading,error,data}) => {
							if (loading) return null;
							if (error) return error.message;
							let countries = data.countries
							let cities = [];
							for (var x in countries){
								let country = countries[x];
								if (country.name === this.state.insideState){
									cities = country.cities
								}
							}
							return (
								this.state.hideLocationDropdown ? null : 
								<div className="home__selected open">
									<div className={`home__selected-container ${this.state.insideState ? "move" : ""}`}>
										<div className="select-card select-more">
											<p className="select-card__title">Select country and city</p>
											<div className="select-card__items">
											{
												countries.map(country => (
													<div className="select-card__item" onClick={e => {
														this.setState({
															insideState: country.name
														})
													}}>
														<img src="../assets/toolkit/images/al.jpg" />
														<p>{country.name}</p>
														<img className="select-card__item--icon" src="../assets/toolkit/images/gray-arrow.svg" />
													</div>

												))
											}
											</div>
										</div>
										<div className="select-card select-more">
											<div className="select-card__more--title">
												<img 
													className="select-card__more--icon" 
													src="../assets/toolkit/images/gray-arrow.svg" 
													onClick={e => this.setState({insideState:false})}
													style={{ cursor: "pointer" }}	
												/>
												<img src="../assets/toolkit/images/kos.jpg" />
												<p className="select-card__title">Kosova</p>
											</div>
											<div className="select-card__items">
												{
													cities.map(city => (
														<div className="select-card__item">
															<p>{city.name}</p>
															<label className="container card__checkbox">
																<input 
																	onChange={e => this.updateFilter(e,"city")} 
																	checked={this.state.city === city.id} 
																	value={city.id} 
																	type="radio" 
																	name="radio" 
																	id={city.name}
																/>
																<span className="checkmark"></span>
															</label>
														</div>

													))	
												}
											</div>
										</div>
									</div>
								</div>

							)
						 }}

					 </Query>
				
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
									<div className="job-listing-table__lt">
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
									</div>
									<div className="job-listing-table__time">
										{
											job.status === "FEATURED"
												? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt="" />Featured</span>
												: <span className="new "><img src="/assets/toolkit/images/blue-star.svg" alt="" />New</span>
										}
										<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />{window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location}</h5>
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
							<div className="job-listing-table__lt">			                
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
							</div>
			                <div className="job-listing-table__time">
				                {
				                	job.status === "FEATURED" 
				                	? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt=""/>Featured</span>
				                	: <span className="new ">New</span>
				                }
								<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />
								{window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location}
								</h5>
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
							<div className="job-listing-table__lt">
									<div className="job-listing-table__logo"
										style={{
											backgroundImage: this.getLogo(job),
										}} />
								<div className="job-listing-table__info">
									<Link to={`/job/${job.id}`}>
									<h4>
										{job.position}
									</h4>
									<h5>
										<p>{job.company ? job.company.name : job.company_name}</p>
									</h5>
									</Link>
								</div>
							</div>
			                <div className="job-listing-table__time">
			                  <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt=""/>{window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location}</h5>
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
										<div className="job-listing-table__lt">
											<div className="job-listing-table__logo"
												style={{
													backgroundImage: this.getLogo(job),
												}} />
											<div className="job-listing-table__info">
												<Link to={`/job/${job.id}`}>
													<h4>
														{job.position}
													</h4>
													<h5>
														<p>{job.company ? job.company.name : job.company_name}</p>
													</h5>
												</Link>
											</div>
											<div className="job-listing-table__time">
												<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />{window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location}</h5>
											</div>
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
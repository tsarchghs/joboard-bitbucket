import React from "react";
import { debounce } from "lodash";
import { withApollo, Query } from 'react-apollo';
import gql from "graphql-tag";
import Footer from "./Footer";
import { Link, withRouter } from "react-router-dom";
import { loadAfterHomeMount } from "../helpers"
import LoadingAnimation from "./LoadingAnimation";
import { COUNTRIES_QUERY } from "../Queries";
import EventListener from 'react-event-listener';
import DropdownWrapper from "./wrappers/DropdownWrapper";
import { getQueryParams } from "../helpers";
import { compose } from "recompose";
import JobsList from "./home/JobsList";

class _Home extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			only_remote: false,
			moveCheckbox: false,
			location: undefined,
			job_types: undefined,
			featured_jobs: undefined,
			today_jobs: undefined,
			week_jobs: undefined,
			month_jobs: undefined,
			hideLocationDropdown: true,
			find_only_text: window.__PUBLIC_DATA__.find_only_text
		}
		this.jobTypeRef = undefined;
		this.update = debounce(this.update.bind(this),250);
		this.updateFilter = this.updateFilter.bind(this)
		this.updateJobs = this.updateJobs.bind(this)
		this.handleClick = this.handleClick.bind(this)
		this.openLocationDropdownButton = undefined;
		this.countriesDropdown = undefined;
		this.showCategories = this.showCategories.bind(this)
		this.toggleLocationDropdownRef = React.createRef();
		this.toggleLocationDropdown = this.toggleLocationDropdown.bind(this)
		this.job_categories = {
			data_scientist: "Data scientist",
			al_researcher: "AL Researcher",
			intelligence_specialist: "Intelligence specialist",
			al_data_analyst: "AL Data Analyst",
			machine_learning_engineer: "Machine Learning Engineer",
			software_engineer: "Software Engineer"
		}
	}
	componentDidMount(){
		this.props.history.listen((location,action) => {
			if (location.pathname === "/") {
				if (location.search && !this.job_categories[getQueryParams(window.location.href).category]) {
					this.props.history.push("/")
					return;
				}
				this.update()
				let categoryParam = getQueryParams(window.location.href).category;
				if (location.search){
					this.setState({
						find_only_text: this.job_categories[categoryParam]
					})
				} else {
					this.setState({ find_only_text: window.__PUBLIC_DATA__.find_only_text })
				}
			};
		})
		if (!this.illegalConfiguration()){
			loadAfterHomeMount()
			if (this.jobTypeRef) this.jobTypeRef.onchange = this.update;
			this.update();
		}
	}
	async updateJobs(to,id_not_in, status_not_in, status_type, createdAt_gte, createdAt_lte, first,skip,orderBy){		
		let category = getQueryParams(window.location.href).category;
		if (category) category = category.toUpperCase()
		let variables = {
			jobFilter: {
				category,
				id_not_in,
				status_not_in,
				keywords: this.state.keywords,
				location: this.state.only_remote ? "remote/everywhere" : this.state.location,
				status_type,
				job_types: this.jobTypeRef && this.jobTypeRef.value === "ALL" ? undefined : (this.jobTypeRef ? [this.jobTypeRef.value] : undefined),
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
					remote
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
				    job_types
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
					category
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
	handleClick(e){
		if (this.countriesDropdown && !this.countriesDropdown.contains(e.target) && !this.openLocationDropdownButton.contains(e.target)){
			this.setState({hideLocationDropdown: true})
		}
	}
	illegalConfiguration(){
		return window.__PUBLIC_DATA__.use_location && window.__PUBLIC_DATA__.use_predefined_location
	}
	showCategories(){
		return window.__PUBLIC_DATA__.use_predefined_location &&  !this.props.match
	}
	toggleLocationDropdown(e){
		console.log(555)
		this.setState(prevState => {
			prevState.hideLocationDropdown = !prevState.hideLocationDropdown
			return prevState;
		})
	}
	render(){
		if (window.__PUBLIC_DATA__.use_location && window.__PUBLIC_DATA__.use_predefined_location){
			return (
				<h1>Only use_location or use_predefined_location can be true</h1>
			)
		}
		return (
	      <div>
			<EventListener
				target="window"
				onMouseDown={this.handleClick}
				onMouseUp={this.handleClick}
			/>
	        <div className="master-layout__header">
	          <h1>{this.state.find_only_text}</h1>
	          <div dangerouslySetInnerHTML={{
				  __html: window.__PUBLIC_DATA__.below_find_only_html
			  }}>
			  </div>
	          <div className="home__search">
	            {
					!window.__PUBLIC_DATA__.use_keywords ? null
					: <label>
						<span>Keywords</span>
						<div className="home__input">
						<input 
							value={this.state.keywords}
							onChange={(e) => this.updateFilter(e,"keywords")}
							className="input" 
							placeholder="Position, skills" />
						<img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
						</div>           
					</label>
				}
				
		{
			window.__PUBLIC_DATA__.use_predefined_location &&
			<React.Fragment>
				<label onClick={e => e.preventDefault()}>
					<span>Location</span>
						<div ref={this.toggleLocationDropdownRef} className="home__input">
							<div className="home__input--extra" style={{cursor:"pointer"}} onClick={this.toggleLocationDropdown}>
								<p>{this.state.selectedLocation ? this.state.selectedLocation : "Select location"}</p>
								<img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
								<span className="arrow-down"><img src="../assets/toolkit/images/white-arrow.svg" /></span>
							</div>
						</div>
						<div style={{ marginTop: 83, position: "absolute" }} onClick={e => {
							console.log(1234)
							e.preventDefault()
							this.setState(nextState => {
								console.log(231222)
								nextState.only_remote = !nextState.only_remote;
								if (nextState.only_remote) {
									nextState.selectedLocation = false;
									nextState.city = undefined
								}
								nextState.hideLocationDropdown = true;
								nextState.location = "";
								this.update();
								return nextState
							})
						}} className="checkbox-container">
						<input type="checkbox" checked={this.state.only_remote} />
						<span className="checkmark" />
						<p style={{color: "white"}}>Remote/anywhere</p>
					</div>
				</label>

			</React.Fragment>
		}
		{
			!window.__PUBLIC_DATA__.use_location ? null : <label>
						<span>Location</span>
						<div className="home__input">
						<input 
							value={this.state.only_remote ? "" : this.state.location}
							onChange={(e) => this.updateFilter(e,"location")}
							className="input" location
							placeholder="Position, skills" 
							disabled={this.state.only_remote}
						/>
						<img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
						</div>	           
					</label>
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
								<DropdownWrapper
									toggleButton={this.toggleLocationDropdownRef}
									toggleDropdown={this.toggleLocationDropdown}
									displayed={!this.state.hideLocationDropdown}
								>
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
								</DropdownWrapper>

							)
						 }}

					 </Query>
				
	        </div>

			{
				!window.__PUBLIC_DATA__.use_categories || !true ? null :
						<div className="ai-filter">
							<Link to={`?category=data_scientist`}>Data scientist</Link>
							<Link to={`?category=al_researcher`}>AL Researcher</Link>
							<Link to={`?category=intelligence_specialist`}>Intelligence specialist</Link>
							<Link to={`?category=al_data_analyst`}>AL Data Analyst</Link>
							<Link to={`?category=machine_learning_engineer`}>Machine Learning Engineer</Link>
							<Link to={`?category=software_engineer`}>Software Engineer</Link>
						</div>
			}
	        <div className="master-layout__hero">
	          <div className="home__table">
				<JobsList
					text={"Featured"}
					show_status={true}
					jobs={this.state.featured_jobs}
					LoadingComponent={<LoadingAnimation loading_type={1} />}
				/>
				<JobsList
					text={"Today"}
					show_status={true}
					jobs={this.state.today_jobs}
					LoadingComponent={<LoadingAnimation loading_type={1} />}
				/>	
				<JobsList
					text={"Week"}
					show_status={false}
					jobs={this.state.week_jobs}
					LoadingComponent={<LoadingAnimation loading_type={1} />}
				/>
				<JobsList
					text={"Month"}
					show_status={false}
					jobs={this.state.month_jobs}
					LoadingComponent={<LoadingAnimation loading_type={1} />}
				/>
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

export default compose(withApollo,withRouter)(_Home);
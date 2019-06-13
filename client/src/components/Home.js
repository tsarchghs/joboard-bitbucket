import React from "react";
import { loadToolKit } from "../helpers";
import { debounce } from "lodash";
import { withApollo } from 'react-apollo';
import gql from "graphql-tag";
import { Link } from "react-router-dom";


// mutation {
// 	register(
//     email:"aaaaa"
//     password:"aaaaa"
//     company:{
//       name:"DAS"
//       email:"DAS"
//       website:"DADAS"
//       job:{
//         salary:32112
//         apply_url:"DAS"
//         status:FEATURED
//         job_type:CONTRACT
//         description:"DAS"
//         location:"DAS"
//         position:"DSA"
//       }
//     }
//   ){
//     token
//   }
// }

class Home extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			today_jobs: undefined,
			week_jobs: undefined	
		}
		this.searchRef = undefined;
		this.jobTypeRef = undefined;
		this.update = debounce(this.update.bind(this),250);
		let today = new Date();
		let noFormatYesterday = today.setDate(today.getDate()-1);
		this.yesterday = new Date(noFormatYesterday).toISOString();  
	}
	componentDidMount(){
		loadToolKit();
		this.jobTypeRef.onchange = this.update;
		this.update();
	}
	async updateFromDate(createdType,date,first,to){
		let data = await this.props.client.query({
			query: gql`
				query {
					jobs(jobFilter:{
						location_contains:"${document.getElementById("searchRef").value}"
						${
							!this.jobTypeRef || this.jobTypeRef.value === "ALL" ? ""
							: `job_type: ${this.jobTypeRef.value}`
						}
					    ${
					    	first ? `first: ${first}` : ""
					    }
				  }) {
				    id
				    location
				    position
				    status
				    company {
				      id
				      name
				    }
				    status
				    job_type
				    company_name
				    company_email
				    company_website
				  }
				}
			`
		})
		console.log(data.data.jobs);
		this.setState({
			[to]: data.data.jobs
		})
	}
	async update(e){
		this.setState({
			today_jobs:undefined,
			week_jobs:undefined
		})
		console.log("UPDATE");
		this.updateFromDate("createdAt_gte",this.yesterday,3,"today_jobs");
		this.updateFromDate("createdAt_lte",3,10,"week_jobs");
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
	                	ref={node => this.searchRef = node} 
	                	onChange={this.update}
	                	className="input" 
	                	type="email" 
	                	placeholder="Search for state, city" />
	                <img src="../assets/toolkit/images/placeholder.svg" alt=""/>				
	              </div>
	            </label>
	            <label><span>Type of work</span>
	              <div className="home__select">
	                <select onChange={this.update} ref={node => this.jobTypeRef = node} data-placeholder="Full time/part time ..." className="chosen-select">
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
	            <h4 className="home__table-title">Today</h4>
	            {
	            	!this.state.today_jobs ? <center><img alt="" src="http://localhost:3000/assets/toolkit/images/loading_blue.gif"/></center>
	            	: 
	            	(
	            		this.state.today_jobs.map(job => (
			              <div className="job-listing-table__list home-table no-border">
			                <div className="job-listing-table__logo" 
			                style={{
			                	backgroundImage: 
			                		job.company && job.company.logo && job.company.logo.url ? job.company.logo.url :
			                		'url("/assets/toolkit/images/014-company.svg")'
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
				                	: <span className="new "><img src="/assets/toolkit/images/blue-star.svg" alt=""/>New</span>
				                }
			                  <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt=""/>{job.location}</h5>
			                </div>
		              	</div>
	            		))
	            	)
	            }
	            <h4 className="home__table-title">This week</h4>	            	
					{ !this.state.week_jobs ? <center><img alt="" src="http://localhost:3000/assets/toolkit/images/loading_blue.gif"/></center>
	            	: 
	            	(
	            		this.state.week_jobs.map(job => (
			              <div className="job-listing-table__list home-table no-border">
			                <div className="job-listing-table__logo" 
			                style={{
			                	backgroundImage: 
			                		job.company && job.company.logo && job.company.logo.url ? job.company.logo.url :
			                		'url("/assets/toolkit/images/014-company.svg")'
			                }} />
			                <div className="job-listing-table__info">
			                	<Link to={`/job/${job.id}`}>
				                  <h4>
				                    <a href="#">{job.position}</a>
				                  </h4>
				                  <h5>
				                    <a href="#">{job.company ? job.company.name : job.company_name}</a>
				                  </h5>
				                </Link>
			                </div>
			                <div className="job-listing-table__time">
				                {
				                	job.status === "FEATURED" 
				                	? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt=""/>Featured</span>
				                	: <span className="new "><img src="/assets/toolkit/images/blue-star.svg" alt=""/>New</span>
				                }
			                  <h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt=""/>{job.location}</h5>
			                </div>
		              	</div>
	            		))
	            	)
	            }

	          </div>
	      </div>
	      </div>
		);
	}
}

export default withApollo(Home);
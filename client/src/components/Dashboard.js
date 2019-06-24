import React from "react";
import { daysDifference } from "../helpers";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { Link } from "react-router-dom";
import RenewJobModal from "./RenewJobModal";
import DeleteJobModal from "./DeleteJobModal";
import { Elements } from 'react-stripe-elements';
import { GET_LOGGED_IN_USER, DELETE_JOB_MUTATITON } from "../Queries";

class _Dashboard extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			currentModal: undefined,
			modalJob: undefined,
			jobOptions: undefined
		}
		this.closeModal = this.closeModal.bind(this)
		this.deleteJob = this.deleteJob.bind(this);
	}
	closeModal(e,success){
		if (success){
			this[`${this.state.modalJob.id}_job-listing-table__time`].outerHTML = `
			<div class="job-listing-table__time"><h5><img src="/assets/toolkit/images/time-left.svg" alt="">7 days left</h5><h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="">${this.state.modalJob.location}</h5></div>
			`
			this[`${this.state.modalJob.id}_job-listing-table__more`].outerHTML = ""
		}
		this.setState({
			currentModal: undefined,
			modalJob: undefined
		})
	}
	openModal(modalName,job){
		console.log(job,123);
		let partial_state = {
			currentModal: modalName
		}
		if (job) partial_state["modalJob"] = job;
		this.setState(partial_state)
	}
	async deleteJob(e,job){
		e.preventDefault();
		this.props.client.mutate({
			mutation: DELETE_JOB_MUTATITON,
			variables: {
				id: job.id
			}
		})
		this.setState({
			currentModal: false
		})
		let cached = this.props.client.readQuery({
			query: GET_LOGGED_IN_USER
		})
		console.log(cached);
		console.log(cached.getLoggedInUser.company.jobs.length)
		cached.getLoggedInUser.company.jobs = cached.getLoggedInUser.company.jobs.filter(x => x.id !== job.id);
		console.log(cached.getLoggedInUser.company.jobs.length)
		this.props.client.writeQuery({
			query: GET_LOGGED_IN_USER,
			data: cached
		})
	}
	render(){
		console.log(this.props.user.company,5555);
		return (
			<div>
				<DashboardSidebar />
				<Elements>
					<RenewJobModal
						modalIsOpen={this.state.currentModal === "RenewJobModal"}
						closeModal={this.closeModal}
						job={this.state.modalJob}
					/>
				</Elements>
				<DeleteJobModal
					closeModal={this.closeModal}
					modalIsOpen={this.state.currentModal === "DeleteJobModal"}
					onYes={(e) => this.deleteJob(e,this.state.modalJob)}
					job={this.state.modalJob}
				/>
				<div className="dashboard-layout">
					<div className="dashboard-layout__header dashboard-jl">
						<div className="card">
							<div className="card__logo"
								style={{
									backgroundImage:
										this.props.user.company.logo
											? `url("${this.props.user.company.logo.url}")`
											: 'url("/assets/toolkit/images/014-copany.svg")'
									,
									backgroundSize: "cover"
								}} />
							<div className="card-data">
								<div className="card-data__title">{this.props.user.company.name}</div>
								<div className="card-data__info">
									<a href={this.props.user.company.website} target="_blank"><img src="/assets/toolkit/images/grid-world.svg" alt="" />{this.props.user.company.website}</a>
									<a href="#"><img src="/assets/toolkit/images/envelope.svg" alt="" />{this.props.user.company.email}</a>
								</div>
							</div>
						</div>		<div className="jobs-card">
							<div className="jobs-card__post">
								<div className="jobs-card__number">
									<div className="jobs-card__icon"><img src="/assets/toolkit/images/listing.svg" alt="" /></div>
									<p>{this.props.user.company.jobs.length}</p>
								</div>
								<div className="jobs-card__title">Jobs posted</div>
							</div>
						</div>	</div>
					<div className="dashboard-layout__hero">
						<h4 className="job-listing-table__title">Job listings</h4>

						{
							this.props.user.company.jobs.map(job => {
								return (
									<div className={`job-listing-table__list ${this.props.user.company.jobs[0].id === job.id ? "no-border" : ""}`}>
										<div className="job-listing-table__logo" style={{
											backgroundImage:
												this.props.user.company.logo
													? `url("${this.props.user.company.logo.url}")`
													: 'url("/assets/toolkit/images/014-compay.svg")'
										}} />
										<div className="job-listing-table__info">
											<h4>
												<Link to={`/job/${job.id}`}>
													<p>{job.position}</p>
												</Link>
											</h4>
											<h5>
												<Link to={`/job/${job.id}`}>
													<p>{this.props.user.company.name}</p>
												</Link>
											</h5>
										</div>
										<div ref={node => this[`${job.id}_job-listing-table__time`] = node} className="job-listing-table__time">
											{
												job.status !== "CLOSED"
													? <h5 className><img src="/assets/toolkit/images/time-left.svg" alt="" />
														{`${daysDifference(new Date(), new Date(job.expiresAt))} days left`}
													</h5>
													: <h5 class="red"><img src="/assets/toolkit/images/time-left.svg" alt=""/>Job expired</h5>
											}
											<h5><img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />{job.location}</h5>
										</div>
											{
												job.status === "CLOSED"
													?
													<div ref={node => this[`${job.id}_job-listing-table__more`] = node} className="job-listing-table__more" style={{marginRight:15}}>
													<p onClick={() => this.openModal("RenewJobModal",job)} class="button blue">Renew</p>
													</div>
													: ""
											}
											<div class="custom-dropdown opened" style={{display: this.state.jobOptions == job.id ? "initial" : "none"}}>
												<Link to={`/job/update/${job.id}`}>
													<p>Update</p>
												</Link>	
												<a onClick={(e) => this.openModal("DeleteJobModal",job)}>Delete</a>
											</div>
											<a href="#" onClick={e => {
												e.preventDefault();
												this.setState(nextState => {
													nextState.jobOptions = nextState.jobOptions === job.id ? undefined : job.id 
													return nextState;
												})
											}} ><img src="/assets/toolkit/images/more.svg" alt="" /></a>
									</div>
								);
							})
						}

					</div>
				</div>
			</div>
		)
	}
}

export default withApollo(_Dashboard);
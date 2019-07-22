import React from "react";
import { Link } from "react-router-dom";
import { getLogo } from "../../helpers";

function JobsList(props){
    return (
        <React.Fragment>
            {
                props.jobs === undefined || (props.jobs && props.jobs.length)
                    ? <h4 className="home__table-title">{props.text}</h4>
                    : null
            }
            {
                !props.jobs ? props.LoadingComponent
                    :
                    (
                        props.jobs.map(job => (
                            <div key={job.id} className={`job-listing-table__list home-table ${props.jobs[0].id === job.id ? "no-border" : ""}`}>
                                <div className="job-listing-table__lt">
                                    <div className="job-listing-table__logo"
                                        style={{
                                            backgroundImage: getLogo(job)
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
                                        props.show_status ? (
                                            job.status === "FEATURED"
                                                ? <span className="new blue"><img src="/assets/toolkit/images/blue-star.svg" alt="" />Featured</span>
                                                : <span className="new "><img src="/assets/toolkit/images/blue-star.svg" alt="" />New</span>
                                        ) : null 
                                    }
                                    <h5>
                                        <img src="/assets/toolkit/images/gray-placeholder.svg" alt="" />
                                        {window.__PUBLIC_DATA__.use_predefined_location ? `${job.city.name}, ${job.city.country.name}` : job.location}
                                        {job.remote ? `${job.location ? " Or" : ""} remote/anywhere` : ""}
                                    </h5>
                                </div>
                            </div>
                        ))
                    )
            }
        </React.Fragment>

    )
}

export default JobsList;
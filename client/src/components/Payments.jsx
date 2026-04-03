import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { Query } from "../lib/apolloCompat";
import { INVOICES_QUERY } from "../Queries";

class Payments extends React.Component {
	render(){
		return (
 		  <div>
	       	<DashboardSidebar/>
	        <div className="dashboard-layout">
	          <h4>Receipts</h4>
	          <div className="dashboard-layout__hero scroll-x">
	            <div className="table-content">
	              <table className="unstriped payments-table">
	                <thead>
	                  <tr>
	                    <td>Date</td>
	                    <td>Job title</td>
	                    <td>Credit Card</td>
	                    <td>Price</td>
	                    <td>Receipt</td>
	                  </tr>
	                </thead>
	                <tbody>
					<Query 
						query={INVOICES_QUERY}
						fetchPolicy='no-cache'
					>
						{ ({loading,error,data}) => {
							if (loading || !data || data.invoices === undefined){
								return [1, 2, 3].map(() => <tr>
									<td>-/- -/- - - -</td>
									<td>- - - - -- - - - -- - - - -</td>
									<td>- - - - - - - - - - - - - - - - - - - - -</td>
									<td className="td-bold">- - - -</td>
									<td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt="" />View</a></td>
								</tr>)
							}
							let invoices = data.invoices
							return invoices.map(invoice => {
								return (
									<tr>
										<td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
										<td>{invoice.job.position}</td>
										<td>**** **** **** {invoice.last_four_digits}</td>
										<td className="td-bold">${invoice.price}</td>
										<td className="td-blue"><a href={invoice.receipt_url}><img src="/assets/toolkit/images/pdf-file.svg" alt=""/>View</a></td>
									</tr>
								)
							})
						}}
					</Query>
	                </tbody>
	              </table>
	            </div>
	          </div>
	        </div></div>
		)
	}
}

export default Payments;

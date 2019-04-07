import React from "react";
import DashboardSidebar from "./DashboardSidebar";

class Payments extends React.Component {
	render(){
		return (
 		  <div>
	       	<DashboardSidebar/>
	        <div className="dashboard-layout">
	          <div className="dashboard-layout__header flex-column">
	            <h4>Payment Card</h4>
	            <div className="creditcard">
	              <div>
	                <h3 className="creditcard__number">**** **** **** 3448</h3>
	                <p>Master Card</p>
	              </div>
	              <div className="creditcard__footer">
	                <p>10/2023</p>
	                <a href="#" className="button">Edit</a>
	              </div>
	            </div>
	          </div>
	          <h4>Invoices</h4>
	          <div className="dashboard-layout__hero scroll-x">
	            <div className="table-content">
	              <table className="unstriped payments-table">
	                <thead>
	                  <tr>
	                    <td>Date</td>
	                    <td>Job title</td>
	                    <td>Credit Card</td>
	                    <td>Price</td>
	                    <td>status</td>
	                    <td>PDF</td>
	                  </tr>
	                </thead>
	                <tbody>
	                  <tr>
	                    <td>12 Jan 2019</td>
	                    <td>Mobile Developper</td>
	                    <td>**** **** **** 4590</td>
	                    <td className="td-bold">$299</td>
	                    <td className="td-green">Paid</td>
	                    <td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt />Download pdf</a></td>
	                  </tr>
	                  <tr>
	                    <td>12 Jan 2019</td>
	                    <td>Mobile Developper</td>
	                    <td>**** **** **** 4590</td>
	                    <td className="td-bold">$299</td>
	                    <td className="td-green">Paid</td>
	                    <td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt />Download pdf</a></td>
	                  </tr>
	                  <tr>
	                    <td>12 Jan 2019</td>
	                    <td>Mobile Developper</td>
	                    <td>**** **** **** 4590</td>
	                    <td className="td-bold">$299</td>
	                    <td className="td-green">Paid</td>
	                    <td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt />Download pdf</a></td>
	                  </tr>
	                  <tr>
	                    <td>12 Jan 2019</td>
	                    <td>Android and Ios Developper</td>
	                    <td>**** **** **** 4590</td>
	                    <td className="td-bold">$29239</td>
	                    <td className>Waiting</td>
	                    <td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt />Download pdf</a></td>
	                  </tr>
	                  <tr>
	                    <td>12 Jan 2019</td>
	                    <td>Mobile Developper</td>
	                    <td>**** **** **** 4590</td>
	                    <td className="td-bold">$299</td>
	                    <td className="td-green">Paid</td>
	                    <td className="td-blue"><a href="#"><img src="/assets/toolkit/images/pdf-file.svg" alt />Download pdf</a></td>
	                  </tr>
	                </tbody>
	              </table>
	            </div>
	          </div>
	        </div></div>
		)
	}
}

export default Payments;
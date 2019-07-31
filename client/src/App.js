import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Cookies from 'js-cookie';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Home from "./components/Home";
import Login from "./components/Login";
import Footer from "./components/Footer";
import CreateJob from "./components/CreateJob";
import CreateJobAdmin from "./components/CreateJobAdmin";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Payments from "./components/Payments";
import DashboardHeader from "./components/DashboardHeader";
import CompanySettings from "./components/CompanySettings";
import JobProfile from "./components/JobProfile";
import UpdateJobProfile from "./components/UpdateJobProfile";
import { getQueryParams } from "./helpers";
import {StripeProvider,Elements} from 'react-stripe-elements';
import { GET_LOGGED_IN_USER } from "./Queries"
import  Category from "./components/Category";

// https://frozen-refuge-32300.herokuapp.com
const client = new ApolloClient({
  uri: window.__PUBLIC_DATA__.apollo_client_uri,
  request: async (operation) => {
    const token = Cookies.get("token");
    operation.setContext({
      headers: {
        authorization: `Bearer ${token}`
      }
    })
  }
});

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: undefined
    }
    if (window.__PUBLIC_DATA__ === undefined){
      window.__PUBLIC_DATA__ = {}
    }
  }
  render() {
    return (
      <StripeProvider apiKey={window.__PUBLIC_DATA__.production_client ? "pk_live_VzebAEDh33V8db6oZe4beNA6" : "pk_test_N1sdoxQTHRHokGxvtutLWw0x00HDZ2RDsi"}>
        <ApolloProvider client={client}>
          <Router>
            <Query query={GET_LOGGED_IN_USER}>
              {({loading,error,data,refetch}) => {
                console.log("App re/rernder");
                if (loading) return <div className="master-layout" style={{ width: window.innerWidth, height: window.innerHeight}}></div>
                if (error){
                  return <p>{error.message}</p>
                }
                let user = error ? undefined : data.getLoggedInUser
                console.log(user,55);
                return (
                  <div>
                    <Route path="/" exact component={() => {
                      return (
                          <div className="master-layout">
                            <Header user={user}/>
                            <Home/>
                          </div>
                        )
                    }} />
                    <Route path="/login" exact component={() => {
                      let params = getQueryParams(window.location.href);
                      if (user){
                        if (params["success"]){
                          return <Redirect to={`${params["success"].replace(":","/")}`}/>
                        }
                        return <Redirect to="/dashboard"/>
                      }
                      return <Login refetchApp={refetch}/>
                    }} />
                    <Route path="/create_job" exact component={() => {
                      return ( 
                        <div>
                          <Header user={user}/>

                          <Elements>
                            <CreateJob refetchApp={refetch} user={user}/>
                          </Elements>
                        </div>
                        )
                    }}/>
                    <Route path="/create_job_for_free_cus_im_boss" exact component={() => {
                      return (
                        <div>
                          <Header user={user} />
                          <Elements>
                            <CreateJobAdmin refetchApp={refetch} user={user} />
                          </Elements>
                        </div>
                      )
                    }} />
                    <Route path="/dashboard" exact component={() => {
                      if (!user){
                        return <Redirect to="/login?success:dashboard"/>
                      }
                      return (
                          <div>
                            <DashboardHeader user={user} refetchApp={refetch}/>
                            <Dashboard user={user}/>
                          </div>
                        )
                    }}/>
                    <Route path="/payments" exact component={() => {
                      if (!user) { return <Redirect to="/login?success:payments"/> }
                      return (
                          <div>
                            <DashboardHeader user={user} refetchApp={refetch}/>
                            <Payments/>
                          </div>
                        )
                    }}/>
                    <Route path="/settings" exact component={() => {
                      if (!user) { return <Redirect to="/login?success:settings"/> }
                      return (
                        <div>
                          <DashboardHeader user={user} refetchApp={refetch}/>
                          <CompanySettings company={user.company}/>
                        </div>
                      );
                    }}/>
                    <Route path="/job/:id" exact component={(match) => {
                      console.log(1);
                      return (
                        <div>
                          <Header user={user} />
                          <JobProfile user={user} match={match} />
                        </div>
                      )
                    }} />
                    <Route path="/job/update/:id" exact component={({ match }) => {
                      console.log(1);
                      return (
                        <div>
                          <Header user={user} />
                          <UpdateJobProfile match={match} />
                        </div>
                      )
                    }} />
                    {
                      window.__PUBLIC_DATA__.use_predefined_location &&
                        <Route path="/category/:id" exact component={({ match }) => {
                          console.log(1);
                          return (
                            <div className="master-layout">
                              <Header user={user} />
                              <Category match={match} />
                            </div>
                          )
                        }} />
                    }
                  </div>
                );
              }}
            </Query>
          </Router>
        </ApolloProvider>
      </StripeProvider>
    );
  }
}

export default App;

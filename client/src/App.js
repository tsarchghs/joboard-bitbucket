import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import Cookies from 'js-cookie';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Home from "./components/Home";
import Login from "./components/Login";
import CreateJob from "./components/CreateJob";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Payments from "./components/Payments";
import DashboardHeader from "./components/DashboardHeader";
import CompanySettings from "./components/CompanySettings";
import JobProfile from "./components/JobProfile";
import { getQueryParams } from "./helpers";
import {StripeProvider} from 'react-stripe-elements';

const client = new ApolloClient({
  uri: "http://localhost:4000",
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
  }
  render() {
    console.log(3213112);
    return (
      <StripeProvider apiKey="12323">
        <ApolloProvider client={client}>
          <Router>
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

                      }
                    }
                  }
                }
            `}>
              {({loading,error,data,refetch}) => {
                console.log(data);
                if (loading) return "Loading"
                if (error){
                  if (!(error.message === "GraphQL error: Not logged in")){
                    return <p>{error.message}</p>
                  }
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
                          <CreateJob user={user}/>
                        </div>
                        )
                    }}/>
                    <Route path="/dashboard" exact component={() => {
                      if (!user){
                        return <Redirect to="/login?success:dashboard"/>
                      }
                      return (
                          <div>
                            <DashboardHeader user={user} refetchApp={refetch}/>
                            <Dashboard/>
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
                          <Header user={user}/>
                          <JobProfile match={match}/>
                        </div>
                      )
                    }}/>
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

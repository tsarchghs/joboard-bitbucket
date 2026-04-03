import React, { Component } from "react";
import Cookies from "js-cookie";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  Query,
} from "./lib/apolloCompat";
import { BrowserRouter as Router, Redirect, Route } from "./lib/routerCompat";
import { Elements, StripeProvider } from "./lib/stripeCompat";
import Home from "./components/Home";
import Login from "./components/Login";
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
import { GET_LOGGED_IN_USER } from "./Queries";
import Category from "./components/Category";

// https://frozen-refuge-32300.herokuapp.com
const httpLink = new HttpLink({
  uri: "https://54.209.236.62:4001",
});

const authLink = new ApolloLink((operation, forward) => {
  const token = Cookies.get("token");

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
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
      <StripeProvider apiKey={false ? "pk_live_VzebAEDh33V8db6oZe4beNA6" : "pk_test_51TAcLxCQPvziXDdOvgYRElj0Y62abG8QYCedB2xhOcXw9yx4jQD65kWGDaXnFx95Jw06zadRKiWYXNOCgUYBRo8O00NIX0pyPx"}>
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
                          return <Redirect to={`/${params["success"].replace(/:/g,"/")}`}/>
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
                        return <Redirect to="/login?success=dashboard"/>
                      }
                      return (
                          <div>
                            <DashboardHeader user={user} refetchApp={refetch}/>
                            <Dashboard user={user}/>
                          </div>
                        )
                    }}/>
                    <Route path="/payments" exact component={() => {
                      if (!user) { return <Redirect to="/login?success=payments"/> }
                      return (
                          <div>
                            <DashboardHeader user={user} refetchApp={refetch}/>
                            <Payments/>
                          </div>
                        )
                    }}/>
                    <Route path="/settings" exact component={() => {
                      if (!user) { return <Redirect to="/login?success=settings"/> }
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

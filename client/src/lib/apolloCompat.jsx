import React from "react";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  gql,
} from "@apollo/client";
import {
  ApolloProvider,
  useApolloClient,
  useMutation,
  useQuery,
} from "@apollo/client/react";

const withDisplayName = (WrappedComponent) =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";

const withApollo = (WrappedComponent) => {
  function WithApollo(props) {
    const client = useApolloClient();
    return <WrappedComponent {...props} client={client} />;
  }

  WithApollo.displayName = `withApollo(${withDisplayName(WrappedComponent)})`;
  return WithApollo;
};

const Query = ({ children, query, variables, ...options }) => {
  const client = useApolloClient();
  const result = useQuery(query, { variables, ...options });
  return children({
    ...result,
    client,
  });
};

const Mutation = ({ children, mutation, ...options }) => {
  const client = useApolloClient();
  const [mutate, result] = useMutation(mutation, options);
  return children(mutate, {
    ...result,
    client,
  });
};

export {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  gql,
  HttpLink,
  InMemoryCache,
  Mutation,
  Query,
  withApollo,
};

import React from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const listeners = new Set();
let lastLocationSignature = null;

const getLocationSignature = (location) =>
  `${location.pathname}|${location.search}|${location.hash}`;

const syncLocation = (location, action = "POP") => {
  const signature = getLocationSignature(location);

  if (signature === lastLocationSignature) {
    return;
  }

  lastLocationSignature = signature;
  listeners.forEach((listener) => listener(location, action));
};

const createHistory = (navigate, location) => ({
  goBack: () => navigate(-1),
  listen: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  location,
  push: (to) => navigate(to),
  replace: (to) => navigate(to, { replace: true }),
});

const buildMatch = (path, location, params) => ({
  isExact: true,
  params,
  path: path || location.pathname,
  url: location.pathname,
});

const withDisplayName = (WrappedComponent) =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";

const withRouter = (WrappedComponent) => {
  function WithRouter(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const history = React.useMemo(
      () => props.history || createHistory(navigate, location),
      [location, navigate, props.history]
    );
    const match =
      props.match && Object.keys(props.match).length
        ? props.match
        : buildMatch(location.pathname, location, params);

    React.useEffect(() => {
      syncLocation(location);
    }, [location]);

    return (
      <WrappedComponent
        {...props}
        history={history}
        location={props.location || location}
        match={match}
      />
    );
  }

  WithRouter.displayName = `withRouter(${withDisplayName(WrappedComponent)})`;
  return WithRouter;
};

const Redirect = ({ to }) => <Navigate replace to={to} />;

const Route = ({ children, component: RouteComponent, exact, path, render }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = path
    ? matchPath({ end: exact !== false, path }, location.pathname)
    : { params: {} };

  React.useEffect(() => {
    syncLocation(location);
  }, [location]);

  if (!match) {
    return null;
  }

  const routeProps = {
    history: createHistory(navigate, location),
    location,
    match: buildMatch(path, location, match.params),
  };

  if (RouteComponent) {
    return <RouteComponent {...routeProps} />;
  }

  if (render) {
    return render(routeProps);
  }

  if (typeof children === "function") {
    return children(routeProps);
  }

  return children ?? null;
};

export { BrowserRouter, Link, Redirect, Route, withRouter };

const compose =
  (...hocs) =>
  (WrappedComponent) =>
    hocs.reduceRight((Component, hoc) => hoc(Component), WrappedComponent);

export default compose;

import React from "react";
import {
  CardElement,
  Elements as StripeElements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const StripeContext = React.createContext(null);

const withDisplayName = (WrappedComponent) =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";

const StripeProvider = ({ apiKey, children }) => {
  const stripePromise = React.useMemo(() => loadStripe(apiKey), [apiKey]);

  return (
    <StripeContext.Provider value={stripePromise}>{children}</StripeContext.Provider>
  );
};

const Elements = ({ children }) => {
  const stripePromise = React.useContext(StripeContext);
  return <StripeElements stripe={stripePromise}>{children}</StripeElements>;
};

const injectStripe = (WrappedComponent) => {
  function InjectStripe(props) {
    const stripe = useStripe();
    const elements = useElements();

    const stripeCompat = React.useMemo(
      () => ({
        async createToken(data) {
          const cardElement = elements?.getElement(CardElement);

          if (!stripe || !cardElement) {
            return {
              error: {
                message: "Payment form is not ready yet.",
              },
            };
          }

          return stripe.createToken(cardElement, data);
        },
      }),
      [elements, stripe]
    );

    return <WrappedComponent {...props} elements={elements} stripe={stripeCompat} />;
  }

  InjectStripe.displayName = `injectStripe(${withDisplayName(WrappedComponent)})`;
  return InjectStripe;
};

export { CardElement, Elements, StripeProvider, injectStripe };

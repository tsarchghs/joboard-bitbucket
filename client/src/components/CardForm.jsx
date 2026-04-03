import React from "react";
import { CardElement } from "../lib/stripeCompat";
import "./styles/CardForm.css";

const handleBlur = () => {

};
const handleChange = (change) => {
  console.log('[change]', change);
};
const handleClick = () => {
};
const handleFocus = () => {
};
const handleReady = () => {
};

const createOptions = (fontSize, padding) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding,
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};


class CardForm extends React.Component {
  // handleSubmit = (e) => {
  //   if (this.props.stripe) {
  //     this.props.stripe
  //       .createToken({currency:"usd",amount:500})
  //       .then((payload) => console.log('[token]', payload));
  //   } else {
  //     console.log("Stripe.js hasn't loaded yet.");
  //   }
  // };
  render() {
    return (
      <div>
        <label>
          Card detailss
          {
            this.props.card_denied ? <p><br/>card_denied</p> : ""
          }
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {/*<button>Pay</button>*/}
      </div>
    );
  }
}

export default CardForm;

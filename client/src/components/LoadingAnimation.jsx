import React from "react";
import Lottie from "lottie-react";
import animationData from "./loadingAnimation.json";
import animationData2 from "./loadingAnimation2.json";
 
export default class LoadingAnimation extends React.Component {
  render() {
    return (
      <div>
        <Lottie
          animationData={this.props.loading_type === 1 ? animationData : animationData2}
          autoplay
          loop
          style={{
            height: this.props.height ? this.props.height : 150,
            width: this.props.width ? this.props.width : 150,
          }}
        />
      </div>
    );
  }
}

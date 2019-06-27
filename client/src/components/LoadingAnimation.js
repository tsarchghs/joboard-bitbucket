import React from 'react'
import Lottie from 'react-lottie';
import animationData from './loadingAnimation.json'
import animationData2 from './loadingAnimation2.json'
 
export default class LoadingAnimation extends React.Component {
 
  constructor(props) {
    super(props);
  }
 
  render() {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: this.props.loading_type === 1 ? animationData : animationData2,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    }
 
    return <div>
      <Lottie options={defaultOptions}
              height={this.props.height ? this.props.height : 150}
              width={this.props.width ? this.props.width : 150}
        />
    </div>
  }
}
 
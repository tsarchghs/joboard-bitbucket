import React from "react";

class FeaturedCheckboxComponent extends React.Component {
    render(){
        return (
            <label className="checkbox-container"
                style={{ marginTop: '40px', marginBottom: '60px' }}>
                <input type="checkbox" checked={this.props.featured} onChange={e => this.props.onChange({ target: { value: !this.props.featured } }, "featured")} />
                <span className="checkmark" />
                <p className="checkmark-text">Make my job vacancy featured for 7 days ( +50$)
							<span className="new blue">
                        <img src="/assets/toolkit/images/blue-star.svg" />Featured
							</span>
                </p>
            </label>
        )
    }
}

export default FeaturedCheckboxComponent;

import React from "react";
import LoadingAnimation from "../LoadingAnimation";

class PostJobButton extends React.Component {
    render(){
        return (
            <div className="text-center">
                {
                    this.props.loading ? <LoadingAnimation loading_type={2} />
                        : <button style={{ width: "100%" }} type="submit" className="button blue">Post this job ({this.props.featured ? "249" : "199"}$)</button>
                }
            </div>
        )
    }
}

export default PostJobButton;
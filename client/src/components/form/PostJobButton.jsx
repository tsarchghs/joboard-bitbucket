import React from "react";
import LoadingAnimation from "../LoadingAnimation";

const PostJobButton = props => {
    return (
        <div className="text-center">
            {
                props.loading ? <LoadingAnimation loading_type={2} />
                    : <button style={{ width: "100%" }} type="submit" className="button blue">
                            {props.update ? `Update job` : `Post this job (${props.featured ? "249" : "199"}$)`}
                        </button>
            }
        </div>
    )
}

export default PostJobButton;
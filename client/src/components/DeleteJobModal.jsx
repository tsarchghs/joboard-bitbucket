import React from "react";
import Modal from "react-modal";
import { Mutation, withApollo } from "../lib/apolloCompat";
import compose from "../lib/compose";
import { withRouter } from "../lib/routerCompat";
import { DELETE_JOB_MUTATITON } from "../Queries";

const customStyles = {
    overlay: {
        'backgroundColor': 'rgba(40, 70, 100, 0.7)',
        opacity: 1
    },
    content: {
        top: '50%',
        left: '50%',
        right: '70%',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    }
};
 
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const DeleteJobModal = props => {
    return (
        <div>
            <Modal
                isOpen={props.modalIsOpen}
                onRequestClose={props.closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <div>
                    <div className="modal__header">
                        <h4>Delete {props.job ? props.job.position : ""}</h4>
                        <p className="gray">This will delete {props.job ? props.job.position : ""} and cannot be undone</p>
                    </div>
                    <div className="modal__footer">
                        <div className="modal__footer-buttons">
                            <a onClick={props.closeModal} className="button gray" data-close aria-label="Close modal">No I don’t want</a>
                            {   
                                props.onYes && 
                                <a onClick={props.onYes} style={{backgroundColor: "#F6534E"}} className="button red">Delete</a>
                            }
                            {
                                !props.onYes &&
                                <Mutation
                                    mutation={DELETE_JOB_MUTATITON}
                                >
                                    { (deleteJob,{loading,error,data}) => {
                                        return (
                                            <a onClick={async () => {
                                                if (loading) return "Loading";
                                                if (error) return error.message;
                                                console.log({ variables: { id: props.job.id } })
                                                let res = await deleteJob({variables:{id: props.job.id}})
                                                window.location.href = "/"
                                            }} style={{ backgroundColor: "#F6534E" }} className="button red">Delete</a>
                                        )
                                    }}
                                </Mutation>
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default compose(withApollo,withRouter)(DeleteJobModal);

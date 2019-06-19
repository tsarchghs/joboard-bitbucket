import React from "react";
import Modal from 'react-modal';

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
                            <a onClick={props.onYes} style={{backgroundColor: "#F6534E"}} className="button red">Delete</a>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default DeleteJobModal;
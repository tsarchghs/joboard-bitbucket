import React from "react";
import Modal from 'react-modal';

const customStyles = {
    overlay: {
        'backgroundColor': 'rgba(40, 70, 100, 0.7)',
        opacity: 1
    },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
  }
};
 
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const CreateAccountQuestionModal = props => {
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
                        <img src="/assets/toolkit/images/small-company.svg" alt />
                        <h4>Do you want to create an account ?</h4>
                        <p className="gray">You have already filled the informations of your company, so we can create you an account. But why do you need an account?</p>
                    </div>
                    <div className="modal__hero">
                        <div className="modal__hero-info">
                            <img src="/assets/toolkit/images/modal1.svg" alt />
                            <p className="gray">See how much time is left for your job vacancy.</p>
                        </div>
                        <div className="modal__hero-info">
                            <img src="/assets/toolkit/images/modal2.svg" alt />
                            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
                        </div>
                        <div className="modal__hero-info">
                            <img src="/assets/toolkit/images/modal3.svg" alt />
                            <p className="gray">Renew if the job listing is over so you don’t have to refill the informations again.</p>
                        </div>
                    </div>
                    <div className="modal__footer">
                        <div className="modal__footer-buttons">
                            <a href="#" onClick={props.closeModal} className="button gray" data-close aria-label="Close modal">No I don’t want</a>
                            <a href="#" onClick={props.onYes} className="button blue">Yes, I want to create account</a>
                        </div>
                        <p className="gray">*By not creating account you will not be able to edit the job listing.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default CreateAccountQuestionModal;
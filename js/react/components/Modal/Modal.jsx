import uuid from 'uuid';
import React, { PropTypes } from 'react';
import cls from 'classnames';

import './Modal.scss';

const removeNoScroll = () => document.body.classList.remove('overflow-hide');
const addNoScroll = () => document.body.classList.add('overflow-hide');

class Modal extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        closeModal: PropTypes.func,
        isOpen: PropTypes.bool,
        titleNode: PropTypes.node,
        disableCloseOnClick: PropTypes.bool
    }

    static defaultProps = {
        disableCloseOnClick: false
    }

    constructor(props) {
        super(props);

        this.state = {
            id: `modal-${uuid.v4()}`
        };
    }

    /**
     * TODO: Add body class based on redux state. And trigger actions,
     * to control that. Other components would be able to use that
     * logic.
     */
    componentWillReceiveProps({ isOpen }) {
        if (isOpen === this.props.isOpen) {
            return;
        }

        const domClassAction = isOpen ? addNoScroll : removeNoScroll;
        domClassAction();
    }

    componentWillUnmount() {
        if (this.props.isOpen) {
            this.closeModal();
        }
    }

    onModalClick = (e) => {
        if (this.props.disableCloseOnClick) {
            return;
        }
        if (e.target.id !== this.state.id) {
            return;
        }
        this.closeModal();
    }

    closeModal = () => {
        removeNoScroll();
        this.props.closeModal();
    }

    render() {
        const { children, isOpen, titleNode, klassName } = this.props;
        return (
            <div
              className={cls('Modal', klassName, isOpen ? 'Modal--open' : 'Modal--closed')}
              id={this.state.id}
              onClick={this.onModalClick}
            >
                <div className="Modal__window">
                    {titleNode}

                    <div className="Modal__body">
                        {children}
                    </div>

                    <button
                      className={cls(
                          'Modal__close-button',
                          klassName === 'SignUp--modal' && 'tc br-100 pa1'
                      )}
                      onClick={this.closeModal}
                    >×</button>
                </div>
            </div>
        );
    }
}

export default Modal;

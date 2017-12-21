import uuid from 'uuid';
import React, { PropTypes } from 'react';
import cls from 'classnames';

import CloseIcon from '../Icons/CloseIcon.jsx';

const removeNoScroll = () => document.body.classList.remove('overflow-hide');
const addNoScroll = () => document.body.classList.add('overflow-hide');

class LightBox extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        closeModal: PropTypes.func,
        isOpen: PropTypes.bool,
        titleNode: PropTypes.node,
        klassName: PropTypes.string
    }

    static defaultProps = {
        klassName: ''
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
    componentWillMount(props) {
        addNoScroll();
    }

    componentWillUnmount() {
        if (this.props.isOpen) {
            this.closeModal();
        }
    }

    onModalClick = (e) => {
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
        const klasses = cls(
            'fixed top-0 right-0 lefty-0 bottom-0 w-100 h-100 z-999 pa3 bg-black-60',
            klassName,
            isOpen ? '' : ''
        );
        return (
            <div className={klasses} onClick={this.onModalClick} role="presentation">
                <div className="bg-white pa2 h-100 w-100 relative">
                    <button
                      onClick={this.closeModal}
                      className="ba b--white absolute right-0 top-0 br-100 db bg-red z-999"
                      style={{ height: '32px', width: '32px', top: '-10px', right: '-8px', borderWidth: '2px' }}
                    >
                        <CloseIcon
                          style={{ fill: '#fff', width: '24px', height: '24px', marginTop: '3px', marginLeft: '3px' }}
                        />
                    </button>
                    {
                        titleNode &&
                        <div>
                            {titleNode}
                        </div>
                    }
                    <div className="show-for-small" style={{ height: '100%' }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default LightBox;

import React, { PropTypes } from 'react';

import './ToolTip.scss';
import InfoIcon from '../Icons/InfoIcon.jsx';

class ToolTip extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    render() {
        return (
            <div className="ToolTip cursor dib">
                <InfoIcon />
                <div className="ToolTip__child absolute" >
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default ToolTip;

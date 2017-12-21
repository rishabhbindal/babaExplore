import React, { PropTypes } from 'react';

class NgGotoContext extends React.Component {
    getChildContext() {
        return {
            ngGotoPath: this.props.ngGotoPath,
            ngUpdateLogin: this.props.ngUpdateLogin,
            ngSetMissingDataCollected: this.props.ngSetMissingDataCollected,
            ngGoBack: this.props.ngGoBack,
            ngSetSignupFromFb: this.props.ngSetSignupFromFb
        };
    }

    render() {
        return this.props.children;
    }
}

NgGotoContext.propTypes = {
    children: PropTypes.node,
    ngGotoPath: PropTypes.func,
    ngUpdateLogin: PropTypes.func,
    ngSetMissingDataCollected: PropTypes.func,
    ngGoBack: PropTypes.func,
    ngSetSignupFromFb: PropTypes.func
};

NgGotoContext.childContextTypes = {
    ngGotoPath: PropTypes.func,
    ngUpdateLogin: PropTypes.func,
    ngSetMissingDataCollected: PropTypes.func,
    ngGoBack: PropTypes.func,
    ngSetSignupFromFb: PropTypes.func
};

export default NgGotoContext;

import React, { PropTypes } from 'react';
import ScriptLoader from './ScriptLoader.jsx';

class RazorpayScriptLoader extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    render() {
        return (
            <ScriptLoader
              id="elt_payment_gateway"
              src="https://checkout.razorpay.com/v1/checkout.js"
              onLoad
            >
                {this.props.children}
            </ScriptLoader>
        );
    }
}

export default RazorpayScriptLoader;

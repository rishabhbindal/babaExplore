import React, { PropTypes } from 'react';
import ScriptLoader from '../ScriptLoader.jsx';

class PayPalScriptLoader extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    render() {
        return (
            <ScriptLoader
              id="elt_payment_gateway_paypal"
              src="https://www.paypalobjects.com/api/checkout.js"
              onLoad
            >
                {this.props.children}
            </ScriptLoader>
        );
    }
}

export default PayPalScriptLoader;

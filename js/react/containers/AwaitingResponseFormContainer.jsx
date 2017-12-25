import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { actions as appActions, getState as appState } from '../reducers';
import AwaitingResponseForm from '../components/AwaitingResponseForm/AwaitingResponseForm.jsx';

const formSelector = formValueSelector('awaiting-response-form');

const mapStateToProps = (state, { url }) => {
    const cost = formSelector(state, 'cost');
    const downpayment = formSelector(state, 'downpayment');
    const awaitingResponses = appState.hostProperties.getAwaitingResponses(state);
    const awaitingResponse = awaitingResponses.find(r => r.url === url);
    const gatewayCharge = appState.appConfig.getServiceChargeRate(state);
    return { cost, downpayment, awaitingResponse, gatewayCharge };
};

export default connect(mapStateToProps, {
    submitAwaitingResponse: appActions.hostProperties.submitAwaitingResponse,
})(AwaitingResponseForm);

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Modal from '../Modal/Modal.jsx';
import Button from '../Button/Button.jsx';
import Loader from '../Loader/Loader.jsx';
import { appState, appActions } from '../../reducers';
import { userPropType } from '../../data-shapes/user.js';

import './PaymentSelector.scss';

const toInt = val => parseInt(val, 10);

const mapStateToProps = (state, props) => {
    const { property: { id } } = props;
    const isOpen = appState.modals.showPaymentSelector(state);
    const order = appState.order.getExistingValidOrder(state, id);
    const isHostOrder = isOpen && isOpen.hostOrder;
    const hostOrder = appState.hostOrder.getHostOrder(state);
    const isDownpayment = appState.hostOrder.isDownpayment(state);
    return {
        isOpen,
        order,
        isHostOrder,
        hostOrder,
        isDownpayment
    };
};

class PaymentSelector extends React.Component {
    static defaultProps = {
        isOpen: false,
        isHostOrder: false,
        isDownpayment: false
    }

    static propTypes = {
        isOpen: PropTypes.bool,
        isHostOrder: PropTypes.bool,
        isDownpayment: PropTypes.bool,
        showPaymentSelector: PropTypes.func.isRequired,
        openPayment: PropTypes.func.isRequired,
        openHostOrderPayment: PropTypes.func.isRequired,
        requestDone: PropTypes.func.isRequired,
        completeBooking: PropTypes.func.isRequired,
        updateOrder: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.openPayment = this.openPayment.bind(this);
        this.updateOrder = this.updateOrder.bind(this);
        this.getHostOrderVal = this.getHostOrderVal.bind(this);
        this.checkForZeroOrderPayment = this.checkForZeroOrderPayment.bind(this);

        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isHostOrder) {
            this.setState({ isHostOrder: true });
        }
    }

    getHostOrderVal() {
        const { hostOrder, isDownpayment } = this.props;
        return isDownpayment ? hostOrder.downpaymentInUSD : hostOrder.amountInUSD;
    }

    closeModal() {
        const { showPaymentSelector, requestDone } = this.props;
        showPaymentSelector(false);
        requestDone();
        this.zeroOrderPaymentInitiated = false;
    }

    openPayment() {
        const { showPaymentSelector, openPayment, openHostOrderPayment } = this.props;
        const { isHostOrder } = this.state;
        showPaymentSelector(false);
        if (!isHostOrder) {
            openPayment();
            return;
        }
        openHostOrderPayment();
    }

    checkForZeroOrderPayment() {
        const { hostOrder, order, isOpen } = this.props;

        if (!isOpen) {
            return;
        }

        const orderDetails = order || hostOrder;
        if (orderDetails && toInt(orderDetails.amount) === 0 && !this.zeroOrderPaymentInitiated) {
            this.zeroOrderPaymentInitiated = true;
            this.openPayment();
        }
    }

    updateOrder(data, resp) {
        const { completeBooking, updateOrder } = this.props;
        const { isHostOrder } = this.state;
        const receiptInfo = JSON.stringify({
            payer_id: data.payerID,
            payment_id: data.paymentID,
            authorization_id: resp.transactions[0].related_resources[0].authorization.id
        });
        if (!isHostOrder) {
            return completeBooking(receiptInfo, 'PAYPAL');
        }
        return updateOrder(receiptInfo, 'PAYPAL');
    }

    render() {
        const { isOpen, order, hostOrder } = this.props;
        const { showPaymentSelector, requestDone, showMessageModal } = this.props;
        const { openPayment } = this;
        const { isHostOrder } = this.state;

        if (process.env.ELT_IS_NOT_BROWSER === 'true') {
            return null;
        }

        const PayPalButton = window.paypal && window.paypal.Button.driver('react', { React, ReactDOM });

        this.checkForZeroOrderPayment();

        return (
            <Modal
              isOpen={isOpen}
              closeModal={this.closeModal}
              titleNode={(
                  <div className="PaymentSelector__header">
                      <h4>Select Payment Method</h4>
                  </div>
            )}
            >
                { !window.paypal && <div className="tc"><Loader /></div> }
                { window.paypal && <div className="pa2 tc flex flex-column flex-row-ns">
                    <div className="dib-ns fl w-50-ns">
                        <div className="flex flex-column pa2 pa3-m pa3-l">
                            <div>
                                <p className="mb1">PAY with</p>
                                <p
                                  className="f6"
                                  style={{ minHeight: '3rem' }}
                                >
                                    Card, Netbanking or wallet
                                </p>
                            </div>
                            <div className="pt2" style={{ minWidth: '70%' }}>
                                <div style={{ minWidth: '100px' }}>
                                    <Button
                                      red
                                      expanded
                                      onClick={openPayment}
                                      style={{
                                          width: '148px',
                                          margin: 'auto',
                                          padding: 0,
                                          height: '26px',
                                          borderRadius: '4px'
                                      }}
                                    >
                                        Proceed
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dib-ns w-50-ns fr">
                        <div className="flex flex-column pa2 pa3-m pa3-l">
                            <div>
                                <p className="mb1">PAY with</p>
                                <p className="f6" style={{ minHeight: '3rem' }}>PayPal</p>
                            </div>
                            <div className="pt2" style={{ minWidth: '70%' }}>
                                {window.paypal && <PayPalButton
                                  env={__PAY_PAYPAL_ENV__}
                                  style={{
                                      label: 'pay',
                                      shape: 'rect',
                                      size: 'small',
                                      color: 'silver',
                                      tagline: false
                                  }}
                                  client={{
                                      sandbox: __PAY_PAYPAL_KEY__,
                                      production: __PAY_PAYPAL_KEY__
                                  }}
                                  commit
                                  payment={(data, actions) => {
                                      showPaymentSelector(false);
                                      const amount = !isHostOrder ? order.amountInUSD : this.getHostOrderVal();
                                      const invoiceNo = !isHostOrder ? order.finalId : hostOrder.id;
                                      return actions.payment.create({
                                          payment: {
                                              transactions: [{
                                                  amount: { total: amount, currency: 'USD' },
                                                  invoice_number: invoiceNo
                                              }],
                                              intent: 'authorize'
                                          }
                                      });
                                  }}
                                  onAuthorize={(data, actions) => actions.payment.execute().then((resp) =>
                                      this.updateOrder(data, resp))
                                  }
                                  onCancel={() => {
                                      requestDone();
                                  }}
                                  onError={() => {
                                      showMessageModal(
                                          'Error !!',
                                          'There was an error in initiating the PayPal Payment. Please try another Payment method or try again later.'
                                      );
                                      requestDone();
                                  }}
                                /> }
                            </div>
                        </div>
                    </div>
                </div> }
            </Modal>
        );
    }
}

export default connect(mapStateToProps, {
    showPaymentSelector: appActions.modals.showPaymentSelector,
    openPayment: appActions.order.openPayment,
    requestDone: appActions.order.requestDone,
    completeBooking: appActions.order.completeBooking,
    showMessageModal: appActions.modals.showMessageModal,
    openHostOrderPayment: appActions.hostOrder.openPayment,
    updateOrder: appActions.hostOrder.updateOrder
})(PaymentSelector);

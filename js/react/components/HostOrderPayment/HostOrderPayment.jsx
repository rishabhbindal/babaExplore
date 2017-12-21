import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Loader from '../Loader/Loader.jsx';
import Button from '../Button/Button.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import { userPropType } from '../../data-shapes/user.js';
import { hostOrderProptype } from '../../data-shapes/HostOrder.js';
import PaymentSelector from '../PaymentSelector/PaymentSelector.jsx';

import './HostOrderPayment.scss';

const buttontext = (state) => {
    const hash = {
        PAYMENT_PENDING: 'Pay Now',
        PAYMENT_CONFIRMED: 'Booking Complete',
        DELETED: 'Link Expired'
    };
    return hash[state];
};

class HostOrderPayment extends React.Component {
    static defaultProps = {
        hostOrder: null,
        updateSucceeded: false,
        orderFetchFailed: false,
        user: null,
        host: null
    }

    static propTypes = {
        hostOrder: hostOrderProptype,
        updateSucceeded: PropTypes.bool,
        orderFetchFailed: PropTypes.bool,
        user: userPropType,
        host: userPropType,
        showPaymentSelector: PropTypes.func.isRequired,
        selectDownPayment: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.selectDownPayment = this.selectDownPayment.bind(this);

        this.state = { downpaymentSelected: false };
    }

    selectDownPayment() {
        const { selectDownPayment } = this.props;
        selectDownPayment(!this.state.downpaymentSelected);
        this.setState({ downpaymentSelected: !this.state.downpaymentSelected });
    }

    render() {
        const { hostOrder, user, host, updateSucceeded, orderFetchFailed } = this.props;
        const { showPaymentSelector } = this.props;

        const btnText = hostOrder ? buttontext(hostOrder.state) : 'Loading';

        if (!(hostOrder && user) && !orderFetchFailed) {
            return (
                <div className="row HostOrderPayment__loader__container">
                    <Loader />
                </div>
            );
        }

        if (orderFetchFailed) {
            return (
                <div style={{ margin: '0.5rem', textAlign: 'center' }}>
                    <h5>Error in fetching order details. Please check the url.</h5>
                </div>
            );
        }

        const disabled = hostOrder.state === 'DELETED' || hostOrder.state === 'PAYMENT_CONFIRMED';

        return (
            <div className="row HostOrderPayment__container">
                <div className="HostOrderPayment__section">
                    { user && <div className="HostOrderPayment__userinfo__container">
                        <p className="HostOrderPayment__userinfo__title">
                            Hey
                            <span className="HostOrderPayment__userinfo__name"> {user.firstName} </span>
                            , here are your order details :
                        </p>
                    </div> }
                </div>
                <div className="HostOrderPayment__section">
                    <div className="HostOrderPayment__propertyinfo">
                        <Link to={`/listing/${hostOrder.property.code}`}>
                            <h3 className="HostOrderPayment__property__title">{hostOrder.property.caption}</h3>
                        </Link>
                        <p>
                            {hostOrder.property.locality && `${hostOrder.property.locality}, `} {hostOrder.property.city}
                        </p>
                        <div>
                            <h6 style={{ display: 'inline-block', fontSize: '.9rem' }}>Property Link: </h6>
                            <Link to={`/listing/${hostOrder.property.code}`}>
                                <span className="HostOrderPayment__urltitle">
                                    {` www.explorelifetraveling.com/listing/${hostOrder.property.code}`}
                                </span>
                            </Link>
                        </div>
                        <div className="HostOrderPayment__hostinfo__container">
                            <h5 className="HostOrderPayment__hostinfo__title">Hosted By:</h5>
                            { host && <UserInfo
                              img={host.profilePic}
                              name={host.firstName}
                              quote={<TruncatedText text={host.ownerPropertyIntro} limit={80} quoted />}
                              fullWidth
                            /> }
                        </div>
                        <div className="HostOrderPayment__orderdetails__container">
                            <table className="HostOrderPayment__orderdetails">
                                <thead>
                                    <tr className="HostOrderPayment__orderdetails__title">
                                        <td>
                                            Check In:
                                            <div className="HostOrderPayment__dates">
                                                {moment(hostOrder.dateFrom).format('MMM DD, YYYY')}
                                            </div>
                                        </td>
                                        <td>
                                            Check Out:
                                            <div className="HostOrderPayment__dates">
                                                {moment(hostOrder.dateUntil).format('MMM DD, YYYY')}
                                            </div>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="HostOrderPayment__orderdetails__extradetails">
                                        <td>Booking For</td>
                                        <td>Quantity</td>
                                    </tr>
                                    { hostOrder.quantityMap.map(q => (
                                        <tr key={q.id}>
                                            <td className="HostOrderPayment__orderdetails__bookables">
                                                <p>{q.caption}</p>
                                            </td>
                                            <td>{q.requested}</td>
                                        </tr>
                                    )) }
                                    <tr className="HostOrderPayment__orderdetails__extradetails">
                                        <td>
                                            <p>Charge</p>
                                        </td>
                                        <td>₹{parseInt(hostOrder.cost, 10) + parseInt(hostOrder.exploreFee, 10)}</td>
                                    </tr>
                                    { !!parseInt(hostOrder.fee, 10) && <tr className="HostOrderPayment__orderdetails__extradetails">
                                        <td>
                                            <p>Payment Gateway Fees</p>
                                        </td>
                                        <td>₹{hostOrder.fee}</td>
                                    </tr> }
                                    <tr className="HostOrderPayment__orderdetails__extradetails">
                                        <td>
                                            <p>Total</p>
                                        </td>
                                        <td>₹{hostOrder.amount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {
                    (hostOrder.amount !== hostOrder.downpayment) && <div className="HostOrderPayment__downpayment">
                        <span>Down Payment (₹{hostOrder.downpayment}) : </span>
                        <input
                          type="checkbox"
                          value={this.state.downpaymentSelected}
                          onClick={this.selectDownPayment}
                        />
                    </div>
                }
                <div className="HostOrderPayment__button">
                    { updateSucceeded && <p>Payment Successful.</p> }
                    <Button
                      onClick={() => { !disabled && showPaymentSelector({  show: true, hostOrder: true }); }}
                      disabled={disabled}
                      size="expand"
                    >
                        {btnText}
                    </Button>
                    <PaymentSelector property={{}} />
                </div>
            </div>
        );
    }
}

export default HostOrderPayment;

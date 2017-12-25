import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import { userPropType } from '../../data-shapes/user.js';
import { searchPropertyType } from '../../data-shapes/property.js';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import { bookablePrice, gatewayFee } from '../../lib/computeBookablePrices.js';

const toInt = n => (parseInt(n, 10) || 0);

const getPricing = ({ quantityMap, customPrice, gatewayCharge, days, hasPercentFee, feePercent, feeDisabled }) => {
    let exploreFees = Object.values(quantityMap).reduce((sum, v) => {
        const bprice = bookablePrice({
            bookable: { ...v, downPayment: v.pricing.downPayment, exploreFee: v.pricing.exploreFee },
            requested: v.requested,
            guestCount: 0,
            days
        });
        return sum + bprice.exploreFee;
    }, 0);

    if (hasPercentFee) {
        exploreFees = (customPrice * feePercent) / 100;
    }
    const gatewayFees = gatewayFee(customPrice + exploreFees, gatewayCharge);
    return {
        exploreFees,
        gatewayFees: feeDisabled ? 0 : gatewayFees
    };
};

class HostCreateOrderForm extends React.Component {
    static defaultProps = {
        gatewayCharge: null
    }

    static propTypes = {
        property: searchPropertyType,
        guest: userPropType,
        hostCreateOrder: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired,
        resetCreateOrder: PropTypes.func.isRequired,
        updateProperty: PropTypes.func.isRequired,
        isOrderCreating: PropTypes.bool,
        gatewayCharge: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkInChange = this.checkInChange.bind(this);
        this.checkOutChange = this.checkOutChange.bind(this);
        this.customCheckboxChange = this.customCheckboxChange.bind(this);
        this.customPriceChange = this.customPriceChange.bind(this);
        this.customDownpaymentChange = this.customDownpaymentChange.bind(this);
        this.quantityMapChange = this.quantityMapChange.bind(this);
        this.handleFailure = this.handleFailure.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.updateFee = this.updateFee.bind(this);

        this.state = {
            checkIn: null,
            checkOut: null,
            canChangePrice: false,
            customPrice: null,
            customDownpayment: null,
            quantityMap: {},
            errorMessages: {},
            disableFeeForHostOrders: props.property.disableFeeForHostOrders
        };
    }

    checkInChange(date) {
        this.setState({ checkIn: date });
    }

    checkOutChange(date) {
        this.setState({ checkOut: date });
    }

    quantityMapChange(event) {
        const target = event.target;
        const requested = toInt(target.value);
        if (requested > 0) {
            this.state.quantityMap[target.dataset.bookableurl] = { requested };
        } else {
            delete this.state.quantityMap[target.dataset.bookableurl];
        }
        this.setState({ ...this.state.quantityMap });
    }

    customCheckboxChange(event) {
        this.setState({ canChangePrice: event.target.checked });
    }

    customPriceChange(event) {
        this.setState({ customPrice: event.target.value });
    }

    customDownpaymentChange(event) {
        this.setState({ customDownpayment: event.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { checkIn, checkOut, quantityMap, customPrice, customDownpayment, canChangePrice } = this.state;
        const { guest } = this.props;
        let error = false;
        let errorMessages = {};
        if (!checkIn) {
            errorMessages.checkIn = 'Required';
            error = true;
        }
        if (!checkOut) {
            errorMessages.checkOut = 'Required';
            error = true;
        }
        if(!!customDownpayment) {
            if (toInt(customPrice) <= 0) {
                errorMessages.customDownpayment = "Required Custom Price";
                error=true;
            } else if (toInt(customPrice) < toInt(customDownpayment)) {
                errorMessages.customDownpayment = "Downpayment should not exceed custom Price";
                error=true;
            }
        }
        const anySelected = Object.values(this.state.quantityMap).some(qMap => qMap.requested);
        if (!anySelected) {
            errorMessages.bookableNotSelected = 'Please select atleast one bookable';
            error = true;
        }
        this.setState({ errorMessages });
        if (!error) {
            const params = {
                date_from: checkIn.format('YYYY-MM-DD'),
                date_until: checkOut.format('YYYY-MM-DD'),
                payment_gateway: 'RAZOR_PAY',
                owner: guest.url,
                quantity_map: quantityMap
            };
            if (canChangePrice && customPrice && customPrice >= 0) {
                params.cost = customPrice;
            }

            if (canChangePrice && customDownpayment && customDownpayment >= 0) {
                params.downpayment_cost = customDownpayment;
            }
            this.props.hostCreateOrder(params)
                .then(this.handleSuccess)
                .catch(this.handleFailure);
        }
        return false;
    }

    handleFailure(message) {
        this.props.showMessageModal('Error', message);
    }

    handleSuccess() {
        this.state = {};
        this.props.resetCreateOrder();
        this.props.showMessageModal('Success', 'ORDER SUCCESSFULY CREATED FOR GUEST.');
    }

    updateFee() {
        const { updateProperty, property: { id } } = this.props;
        this.setState({ disableFeeUpdate: true });
        updateProperty({
            disable_fee_for_host_order: !this.state.disableFeeForHostOrders
        }, { id }).then(() => {
            this.setState({
                disableFeeForHostOrders: !this.state.disableFeeForHostOrders
            });
            this.setState({ disableFeeUpdate: false });
        }).catch(() => this.setState({ disableFeeUpdate: false }));
    }

    render() {
        const { property, isOrderCreating, gatewayCharge } = this.props;
        const { checkIn, checkOut, customPrice, quantityMap } = this.state;

        const bookablesWithPercentFee = property.bookableItems.filter(b =>
            b.status === 'ENABLED' && b.pricing.exploreFee.type === '_PERCENT');
        const hasPercentFee = bookablesWithPercentFee.length;
        const feePercent = hasPercentFee && bookablesWithPercentFee[0].pricing.exploreFee.amount;

        const totals = getPricing({
            quantityMap: Object.keys(quantityMap).map((k) => {
                const b = property.bookableItems.find(b => b.url === k);
                return {
                    ...b,
                    requested: quantityMap[k].requested
                };
            }),
            customPrice: parseInt(customPrice, 10),
            gatewayCharge,
            days: (checkIn && checkOut) ? checkOut.diff(checkIn, 'days') : 0,
            hasPercentFee,
            feePercent,
            feeDisabled: this.state.disableFeeForHostOrders
        });

        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    <label htmlFor="gatewayFee" className="dib pa1 pr2 fw5">Apply payment gateway fee</label>
                    <input
                      name="gatewayFee"
                      type="checkbox"
                      checked={!this.state.disableFeeForHostOrders}
                      onChange={this.updateFee}
                      disabled={this.state.disableFeeUpdate}
                    />
                </div>
                <div className="medium-6 column" style={{ padding: '0 .25rem 0 0' }}>
                    <label htmlFor="Check In">Check In</label>
                    <DatePicker
                      selected={checkIn || null}
                      dateFormat="DD/MM/YYYY"
                      placeholderText="Check In"
                      maxDate={checkOut}
                      onChange={this.checkInChange}
                    />
                    <div style={{ color: 'red' }}>{ this.state.errorMessages.checkIn}</div>
                </div>
                <div className="medium-6 column" style={{ padding: '0 0 0 .25rem' }}>
                    <label htmlFor="Check Out">Check Out</label>
                    <DatePicker
                      selected={checkOut || null}
                      dateFormat="DD/MM/YYYY"
                      placeholderText="Check Out"
                      disabled={!checkIn}
                      minDate={checkIn}
                      onChange={this.checkOutChange}
                    />
                    <div style={{ color: 'red' }}>{ this.state.errorMessages.checkOut}</div>
                </div>

                {
                    property.bookableItems.map(({ caption, noOfInstances, url }) => (
                        <div>
                            <div
                              className="medium-9 small-9 column"
                              style={{ textAlign: 'right', paddingTop: '10px' }}
                            >
                                <b>{ caption }</b>
                            </div>
                            <select
                              className="medium-3 small-3 column"
                              onChange={this.quantityMapChange}
                              data-bookableUrl={url}
                            >
                                { [...Array(noOfInstances+1).keys()].map(no => <option>{ no }</option>) }
                            </select>
                            <div style={{ clear: 'both' }} />
                        </div>
                    ))
                }

                { this.state.errorMessages.bookableNotSelected && <div className="tc pa2">
                    <div style={{ color: 'red' }}>
                        { this.state.errorMessages.bookableNotSelected}
                    </div>
                </div> }

                <div>
                    <input
                      type="checkbox"
                      className="medium-1 small-1 column"
                      value={this.state.canChangePrice}
                      onChange={this.customCheckboxChange}
                    />
                    <span
                      className="medium-11 small-11 column"
                      style={{
                          margin: '-5px',
                          float: 'left'
                      }}
                    >
                        Set Custom Price for Guest
                    </span>
                </div>
                <div style={{ clear: 'both' }} />
                {
                    !!this.state.canChangePrice && <div>
                        <div className="medium-6 column" style={{ padding: '0 .25rem 0 0' }}>
                            <label htmlFor="Custom Price">Custom Price</label>
                            <input
                              type="text"
                              placeholder="Custom Price"
                              value={this.state.customPrice || ''}
                              onChange={this.customPriceChange}
                            />
                        </div>
                        <div className="medium-6 column" style={{ padding: '0 0 0 .25rem' }}>
                            <label htmlFor="Custom Downpayment">Custom Downpayment</label>
                            <input
                              type="text"
                              placeholder="Custom Downpayment"
                              value={this.state.customDownpayment || ''}
                              onChange={this.customDownpaymentChange}
                            />
                            <div style={{ color: 'red' }}>{this.state.errorMessages.customDownpayment}</div>
                        </div>
                        { this.state.customPrice && <div className="tc mb3">
                            { !!totals.exploreFees && <b className="f6">{`Explore Fee: ${totals.exploreFees}`}</b> }
                            <br />
                            <b className="f6">Gateway Fee: { totals.gatewayFees }</b>
                            <br />
                            <b className="f6">Total Cost: { parseInt(this.state.customPrice, 10) + totals.exploreFees + totals.gatewayFees }</b>
                        </div> }
                    </div>
                }
                <ButtonLoader
                  expanded
                  size="large"
                  showSpinner={isOrderCreating}
                >
                    Create Order
                </ButtonLoader>
                <br />
                <div style={{ clear: 'both' }} />
            </form>
        );
    }
}

export default reduxForm({
    form: 'host-create-order-form'
})(HostCreateOrderForm);

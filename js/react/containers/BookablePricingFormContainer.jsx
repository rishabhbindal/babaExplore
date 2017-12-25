import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { change, reduxForm, Field, FormSection, formValueSelector } from 'redux-form';

import { appState } from '../reducers';
import { toInt } from '../lib/helpers.js';
import { bookableTypes } from '../constants/enumConstants.js';

import ButtonCheckboxField from '../components/ButtonCheckboxField/ButtonCheckboxField.jsx';
import PriceEl from '../components/PriceEl/PriceEl.jsx';

const FORM_NAME = 'booking';

const updateBookingField = (name, value) => change(FORM_NAME, name, value);

const formSelector = formValueSelector(FORM_NAME);
const bookableSectionName = bookableId => `${bookableId}`; // `bookable-${bookableId}`;

const mapStateToProps = (store, { bookable, property }) => {
    const booking = formSelector(store, `quantityMap.${bookableSectionName(bookable && bookable.id)}`) || {};

    const { id, quantityMap, date } = appState.order.getExistingValidOrder(store, property.id) || {};

    const initialValues = property.bookables.reduce((acc, b) => {
        const { requested, extraGuests } = (quantityMap && quantityMap[b.id]) || {};
        return {
            ...acc,
            [b.id]: {
                requested: requested || 1,
                isChosen: requested > 0 || false,
                extraGuests: extraGuests || 0
            }
        };
    }, {});

    const isInProgress = id && appState.order.isInProgress(store, id);

    return { booking, isInProgress, initialValues: { quantityMap: initialValues, date } };
};

const peopleString = count => count === 1 ? 'person' : (count > 1 ? 'people' : '');
const guestString = count => count === 1 ? 'guest' : (count > 1 ? 'guests' : '');

class BookablePricingFormContainer extends React.Component {
    static propTypes = {
        idx: PropTypes.number,
        isInProgress: PropTypes.bool
    }

    static defaultProps = {
        isInProgress: false
    }

    constructor(props) {
        super(props);

        this.toggleChosen = this.toggleChosen.bind(this);
        this.onRequestedFieldChange = this.onRequestedFieldChange.bind(this);
        this.onChoosenFieldChange = this.onChoosenFieldChange.bind(this);
        this.state = {
            isChosen: false
        };
    }

    onChoosenFieldChange(event, newValue) {
        const { dispatch, bookable } = this.props;
        if (!newValue) {
            const prefix = `quantityMap.${bookableSectionName(bookable.id)}`;

            dispatch(updateBookingField(`${prefix}.requested`, 1));
            dispatch(updateBookingField(`${prefix}.extraGuests`, ''));
        }
    }

    onRequestedFieldChange(event, newValue, previousValue) {
        const { dispatch, bookable } = this.props;
        const prefix = `quantityMap.${bookableSectionName(bookable.id)}`;

        dispatch(updateBookingField(`${prefix}.extraGuests`, ''));
    }

    toggleChosen() {
        this.setState({ isChosen: !this.state.isChosen });
    }

    render() {
        const { bookable, handleSubmit, idx, isInProgress, booking } = this.props;
        const { pricing, stay } = bookable;

        const maxGuests = stay.maxExtraGuests * toInt(booking.requested);

        const isDayLounge = bookableTypes.PACKAGE === bookable.bookableType;

        const guestField = maxGuests > 0 && (
            <div className="fl w-100 pr1">
                <label
                  className="dib"
                  htmlFor="guest"
                  style={{ fontSize: '12px', lineHeight: '16px' }}
                >
                    <span className="dib mh1 w3 pv1" >
                        <Field name="extraGuests" component="select" disabled={isInProgress}>
                            {(new Array(maxGuests + 1)).fill().map((c, i) => <option key={i} value={i}>{i}</option>)}
                        </Field>
                    </span>
                    Additional Guest
                </label>

            </div>
        );
        const bookableFields = stay.instanceCount > 0 && (
            <div className="fl w-100 pr1">
                <div className="cf pv1">
                    <div className="dib mh1 w3" >
                        <Field
                          name="requested"
                          component="select"
                          disabled={isInProgress}
                          className={maxGuests === 0 && 'ma0'}
                          onChange={this.onRequestedFieldChange}
                        >
                            {(new Array(stay.instanceCount)).fill().map((c, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                        </Field>
                    </div>
                    <label className="dib f7" htmlFor="requested"> {isDayLounge ? 'People' : 'Unit'} </label>
                </div>
            </div>
        );

        const rooms = toInt(booking.requested) || 1;
        const extraGuests = toInt(booking.extraGuests) || 0;
        const totalPeople = (rooms * stay.perInstanceGuests) + extraGuests;
        const totalPrice = (pricing.ticketPrice * rooms) + (pricing.guestCharge * extraGuests);

        return (
            <form onSubmit={handleSubmit} className="BookablePricingFormContainer w-100">
                <FormSection name={`quantityMap.${bookableSectionName(bookable.id)}`}>
                    <div className="relative pa2 bg-white" style={{ marginTop: '15px', padding: '5px' }}>
                        <div className="relative">
                            <div className="absolute dt dt--fixed lh-solid f6" style={{ top: '-25px' }}>
                                {
                                    stay.instanceCount > 0 &&
                                    <div className="dtc tc pv1 b--black-30">
                                        <div className="cf pv2 w-75 center ba bg-silver white">
                                            We have {stay.instanceCount} of them
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="dt dt--fixed bt1 lh-solid">
                                <div className="dtr tr pv2 tc f4 b mt2">
                                    {bookable.caption}
                                </div>
                                <div className="dtr tr pb2 tc f6 black-30 b">
                                    {stay.perInstanceGuests} Person per booking
                                </div>
                            </div>
                            <div className="dt dt--fixed bg-black-10 bt b--black-30">
                                <div className="dtc tc pv1">
                                    <div>
                                        <PriceEl large bold price={pricing.ticketPrice * rooms} />
                                        { !isDayLounge && 'per night' }
                                    </div>
                                </div>
                            </div>
                            <div className="dt dt--fixed bg-white-90 ba b--black-30">
                                <div className="dtc tc br b--black-30">
                                    {
                                        stay.instanceCount > 0 &&
                                        (
                                            <div className="cf">
                                                {bookableFields}
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    guestField &&
                                    <div className="dtc tc br b--black-30">
                                        <div className="cf">
                                            {guestField}
                                        </div>
                                    </div>
                                }
                                {
                                    guestField &&
                                    <div
                                      className="dtc tc"
                                      style={{ fontSize: '12px', lineHeight: '16px', verticalAlign: 'middle' }}
                                    >
                                        <div className="fl w-100 tr text-left" style={{ margin: '10px 2px' }}>
                                            {
                                                booking.extraGuests > 0 &&
                                                <PriceEl bold price={pricing.guestCharge * toInt(booking.extraGuests)} />
                                            }
                                        </div>
                                        Additional price per guest
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="dt dt--fixed bg-white-90 pv1">
                            <div className="dtc">
                                <p>Total <span className="f6">{totalPeople} {guestString(totalPeople)}</span></p>
                            </div>
                            <div className="dtc">
                                <PriceEl bold klassName="red" price={totalPrice} />
                                <span className="f6">{ !isDayLounge && 'per night' }</span>
                            </div>
                        </div>
                        <div className="cf pv0 w-100">
                            <ButtonCheckboxField
                              disabled={isInProgress}
                              name="isChosen"
                              isChecked={booking.isChosen}
                              onChange={this.onChoosenFieldChange}
                              id={`${bookableSectionName(bookable.id)}-requested`}
                            />
                        </div>
                    </div>
                </FormSection>
            </form>
        );
    }
}

export default connect(mapStateToProps)(
    reduxForm({
        form: FORM_NAME,
        enableReinitialize: true
    })(BookablePricingFormContainer)
);

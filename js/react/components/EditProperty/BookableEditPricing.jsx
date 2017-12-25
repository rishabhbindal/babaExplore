import React, { PropTypes } from 'react';
import cls from 'classnames';
import isMobileDevice from '../../lib/isMobileDevice.js';
import Modal from '../Modal/Modal.jsx';
import NumberField from './NumberField.jsx';

class BookableEditPricing extends React.Component {
    static propTypes = {
        updateBookablePricing: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        const { bookable } = this.props;
        const { stay, pricing, actualTicketPrice } = bookable;

        this.state = {
            isOpen: false,
            buttonEnabled: false
        };

        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.showPricingModal = this.showPricingModal.bind(this);
        this.closePricingModal = this.closePricingModal.bind(this);

        this.initialPricing = {
            no_of_instances: stay.instanceCount,
            no_of_guests: stay.perInstanceGuests,
            max_additional_guest: stay.maxExtraGuests,
            daily_price: actualTicketPrice,
            guest_charge: pricing.guestCharge
        };
        this.pricing = Object.assign({}, this.initialPricing);
    }

    componentDidMount() {
        this.setButtonEnabled();
    }

    onChange(e, name) {
        this.pricing[name] = parseInt(e.target.value, 10);
        this.setButtonEnabled();
    }

    onClick() {
        if (!this.state.buttonEnabled) {
            return false;
        }
        const { updateBookablePricing } = this.props;
        this.setState({ isOpen: false });

        this.pricing.max_guests = parseInt(this.pricing.no_of_guests, 10) +
            parseInt(this.pricing.max_additional_guest, 10);
        updateBookablePricing(this.pricing);
        this.setState({ buttonEnabled: false });
        return true;
    }

    setButtonEnabled() {
        const { no_of_instances, no_of_guests, daily_price } = this.pricing;
        const valid = val => val !== '' && parseInt(val, 10) > 0;
        this.setState({ buttonEnabled: valid(no_of_instances) && valid(no_of_guests) && valid(daily_price) && this.isDataChanged() });
    }

    isDataChanged() {
        const pricing = this.initialPricing;
        return pricing.no_of_instances !== this.pricing.no_of_instances ||
            pricing.no_of_guests !== this.pricing.no_of_guests ||
            pricing.max_additional_guest !== this.pricing.max_additional_guest ||
            pricing.daily_price !== this.pricing.daily_price ||
            pricing.guest_charge !== this.pricing.guest_charge;
    }

    showPricingModal() {
        this.setState({ isOpen: true });
    }

    closePricingModal() {
        this.setState({ isOpen: false });
    }

    render() {
        const { bookable } = this.props;
        const { stay, pricing, actualTicketPrice } = bookable;

        const inputs = () => (
            <div className="relative">
                <NumberField title="Number of Instances" value={stay.instanceCount} name="no_of_instances" onChange={this.onChange} />
                <NumberField title="Number of people per Instance" value={stay.perInstanceGuests} name="no_of_guests" onChange={this.onChange} />
                <NumberField title="Price per Instances" value={actualTicketPrice} name="daily_price" onChange={this.onChange} />
                <NumberField title="Number of additional guests" value={stay.maxExtraGuests} name="max_additional_guest" onChange={this.onChange} min={0} />
                <NumberField title="Price per additional guests" value={pricing.guestCharge} name="guest_charge" onChange={this.onChange} min={0} />
                <button
                  className={cls(
                        "w-100 pa2 ma0 ba white bg-red hover-bg-light-red pointer",
                        { disabled: !this.state.buttonEnabled }
                    )}
                  onClick={this.onClick}
                  disabled={!this.state.buttonEnabled}
                >Done</button>
            </div>
        );

        return (
            isMobileDevice() ? (
                <div>
                    <button
                      onClick={this.showPricingModal}
                      className="w-100 pa2 ma0 ba bg-green white"
                    >
                        Change Pricing
                    </button>
                    <Modal
                      isOpen={this.state.isOpen}
                      closeModal={this.closePricingModal}
                    >
                        {inputs()}
                    </Modal>
                </div>
            )
            : inputs()
        );
    }
}

export default BookableEditPricing;

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions } from '../../reducers';
import HostBookableInput from '../HostBookableInput/HostBookableInput.jsx';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

import './HostBookableDetailsForm.scss';

const mapStateToProps = () => ({});

class HostBookableDetailsForm extends React.Component {
    static propTypes = {
        bookable: PropTypes.object.isRequired,
        updateBookables: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInstanceChange = this.handleInstanceChange.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
        this.handleCaptionChange = this.handleCaptionChange.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.isStateChanged = this.isStateChanged.bind(this);
        this.validateCaption = this.validateCaption.bind(this);
        this.submitCompleted = this.submitCompleted.bind(this);

        const { bookable } = this.props;
        const { noOfInstances, dailyPrice, caption, status } = bookable;

        this.state = {
            initialState: {
                noOfInstances,
                dailyPrice,
                caption,
                status
            },
            noOfInstances,
            dailyPrice,
            caption,
            status,
            isValid: true,
            isSubmitting: false
        };
    }

    isStateChanged() {
        const { noOfInstances, dailyPrice, caption, status, initialState } = this.state;
        return initialState.noOfInstances !== noOfInstances ||
               initialState.dailyPrice !== dailyPrice ||
               initialState.status !== status ||
               initialState.caption !== caption;
    }

    validateCaption() {
        const { caption } = this.state;
        const isValid = (caption && caption.length > 0 && caption.length < 25);
        this.setState({ isValid });
    }

    submitCompleted() {
        const { caption, noOfInstances, dailyPrice } = this.state;
        this.setState({
            isSubmitting: false,
            initialState: {
                noOfInstances,
                dailyPrice,
                caption
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.isStateChanged() || !this.state.isValid) {
            return false;
        }
        this.setState({ isSubmitting: true });
        const { url, property } = this.props.bookable;
        const { noOfInstances, dailyPrice, caption, status } = this.state;
        this.props.updateBookables(url, {
            caption,
            property,
            status,
            no_of_instances: noOfInstances,
            daily_price: dailyPrice
        }).then(() => this.submitCompleted());
        return true;
    }

    handleCaptionChange(event) {
        this.setState({
            caption: event.target.value
        });
        this.validateCaption();
    }

    handlePriceChange(event) {
        this.setState({
            dailyPrice: event.target.value
        });
    }

    handleInstanceChange(event) {
        this.setState({
            noOfInstances: event.target.value
        });
    }

    handleStatusChange(event) {
        this.setState({
            status: event.target.value
        });
    }

    render() {
        const { caption, noOfInstances, dailyPrice, status } = this.state;

        return (
            <div className="BookableDetails">
                <form className="BookableDetailsForm" onSubmit={this.handleSubmit}>
                    <HostBookableInput
                      title="Your room title"
                      value={caption}
                      valid={this.state.isValid}
                      errorMessage="Title should be less than 25 characters."
                      onChange={this.handleCaptionChange}
                    />

                    <HostBookableInput
                      small
                      title="No of Rooms"
                      value={noOfInstances}
                      onChange={this.handleInstanceChange}
                    />
                    <HostBookableInput
                      small
                      title="Daily Price"
                      value={dailyPrice}
                      onChange={this.handlePriceChange}
                    />
                    <div className="HostBookableInput_input--big">
                        <input
                          type="radio"
                          name="bookable_status"
                          onChange={this.handleStatusChange}
                          value="ENABLED"
                          checked={status === 'ENABLED'}
                        />
                        <label htmlFor="bookable-status-enabled">Enable</label>
                        <input
                          type="radio"
                          name="bookable_status"
                          onChange={this.handleStatusChange}
                          value="DISABLED"
                          checked={status === 'DISABLED'}
                        />
                        <label htmlFor="bookable-status-disabled">Disable</label>
                    </div>
                    <div className="HostBookableInput_input--big">
                        <ButtonLoader
                          disabled={!this.isStateChanged()}
                          expanded
                          type="submit"
                          size="large"
                          showSpinner={this.state.isSubmitting}
                        >
                          Save
                        </ButtonLoader>
                    </div>
                </form>
                <div className="edit__bookable_by_range" />
            </div>
        );
    }

}

export default connect(
    mapStateToProps, {
        updateBookables: actions.hostProperties.updateBookables
    }
)(HostBookableDetailsForm);

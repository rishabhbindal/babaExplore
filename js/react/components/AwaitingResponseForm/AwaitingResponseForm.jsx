import React, { PropTypes } from "react";
import { Field, propTypes as formPropTypes, reduxForm } from "redux-form";

import ButtonLoader from "../ButtonLoader/ButtonLoader.jsx";
import InputField from "../InputField/InputField.jsx";

import { actions as appActions } from "../../reducers";
import { gatewayFee } from "../../lib/computeBookablePrices.js";

const errorMessage = es =>
  (es && Array.isArray(es) && es.map(a => a.trim()).join(", ")) ||
  (es &&
    typeof es === "object" &&
    !es.details &&
    Object.keys(es).map(k => `${k}: ${es[k]}`).join(", ")) ||
  (es &&
    typeof es === "object" &&
    es.details &&
    Object.keys(es.details).map(k => `'${k}': ${es.details[k]}`).join(", ")) ||
  "Error in processing request. Please Try again later";

const getPricing = ({ quantityMap, cost, gatewayCharge, bookableItems }) => {
  const bookablesWithPercentFee = bookableItems.filter(b =>
    b.status === 'ENABLED' && b.pricing.exploreFee.type === '_PERCENT');
  const hasPercentFee = bookablesWithPercentFee.length;
  let exploreFees = Object.values(quantityMap).reduce(
    (sum, v) => sum + v.explore_fee,
    0
  );
  if (hasPercentFee) {
    const percent = bookablesWithPercentFee[0].pricing.exploreFee.amount;
    exploreFees = Math.round((cost * percent) / 100);
  }
  const gatewayFees = gatewayFee(cost + exploreFees, gatewayCharge);
  return {
    exploreFees,
    gatewayFees
  };
};

class AwaitingResponseForm extends React.Component {
  static defaultProps = {
    cost: "0",
    downpayment: "0"
  };

  static propTypes = {
    ...formPropTypes,
    cost: PropTypes.string,
    downpayment: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.hostMessageChange = this.hostMessageChange.bind(this);
    this.handleAcceptClick = this.handleAcceptClick.bind(this);
    this.handleRejectClick = this.handleRejectClick.bind(this);
    this.toggleCustomPrice = this.toggleCustomPrice.bind(this);

    this.state = {
      showForm: true,
      hostMessage: "",
      isError: false,
      errorMessage: null,
      useCustomPrice: false
    };
  }

  hostMessageChange(event) {
    this.setState({ hostMessage: event.target.value });
  }

  resetForm() {
    this.setState({
      showForm: false,
      isError: false,
      errorMessage: null,
      useCustomPrice: false
    });
  }

  toggleCustomPrice() {
    this.setState({ useCustomPrice: !this.state.useCustomPrice });
  }

  _validateHostMessage(state) {
    if (state.hostMessage.length === 0) {
      return {
        isError: true,
        errorMessage: "Please enter a message to visitor."
      };
    }
    return null;
  }

  handleAcceptClick() {
    const error = this._validateHostMessage(this.state);
    if (error !== null) {
      this.setState(error);
      return;
    }
    this.setState({ isError: false, errorMessage: "" });

    const { url, cost, downpayment } = this.props;
    const params = this.state.useCustomPrice
      ? {
          cost,
          downpayment_cost: downpayment
        }
      : {};
    params["host_message"] = this.state.hostMessage;

    this.props
      .submitAwaitingResponse(`${url}accept/`, params)
      .then(() => this.resetForm())
      .catch(e => {
        this.setState({
          isError: true,
          errorMessage: errorMessage(e)
        });
      });
  }

  handleRejectClick() {
    const error = this._validateHostMessage(this.state);
    if (error !== null) {
      this.setState(error);
      return;
    }

    const { url } = this.props;
    this.props.submitAwaitingResponse(`${url}reject/`, {
      host_message: this.state.hostMessage
    });
    this.resetForm();
  }

  render() {
    const { showForm } = this.state;

    if (!showForm) {
      return null;
    }
    const { awaitingResponse, gatewayCharge } = this.props;
    let { cost } = this.props;
    cost = parseInt(cost, 10);
    const { quantityMap, property: { bookableItems } } = awaitingResponse;
    const totals = getPricing({ quantityMap, cost, gatewayCharge, bookableItems });

    return (
      <div className="host__form">
        <textarea
          rows="3"
          placeholder="Message to visitor."
          onChange={this.hostMessageChange}
          className={this.state.isError && "error__message__active"}
          value={this.state.hostMessage}
        />
        <form>
          <input
            type="checkbox"
            value={this.state.useCustomPrice}
            onChange={this.toggleCustomPrice}
          />
          <label htmlFor="checkbox">Set custom price</label>
          {this.state.useCustomPrice &&
            <div>
              <label htmlFor="cost">Custom Price</label>
              <Field
                type="number"
                min={0}
                name="cost"
                placeholder="Custom Price"
                component={InputField}
                varient="small"
              />
              {false &&
                <div>
                  {/*
                                    hide the downpayment option until we support downpayment
                                    in the events page or listing page
                                */}
                  <label htmlFor="downpayment">Custom Downpayment</label>
                  <Field
                    type="number"
                    min={0}
                    name="downpayment"
                    placeholder="Custom Downpayment"
                    component={InputField}
                    varient="small"
                  />
                </div>}
              {!!cost &&
                <div>
                  <div>
                    <b>
                      Explore Fee: {totals.exploreFees}
                    </b>
                  </div>
                  <div>
                    <b>
                      Payment Gateway Fees: {totals.gatewayFees}
                    </b>
                  </div>
                  <div>
                    <b>
                      Total: {cost + totals.exploreFees + totals.gatewayFees}
                    </b>
                  </div>
                </div>}
            </div>}
        </form>
        {this.state.isError &&
          <div className="error__message__active">
            {this.state.errorMessage}
          </div>}

        <button
          className="button success"
          onClick={this.handleAcceptClick}
          value="Accept"
        >
          Accept
        </button>
        <button
          className="button danger host__reject"
          onClick={this.handleRejectClick}
          value="Reject"
        >
          Reject
        </button>
      </div>
    );
  }
}

export default reduxForm({
  form: "awaiting-response-form"
  // asyncValidate: onValidateCoupon,
  // asyncBlurFields: ['couponCode']
})(AwaitingResponseForm);

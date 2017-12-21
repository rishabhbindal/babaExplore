import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import Select from 'react-select';

import { actions, getState } from '../../reducers';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

const mapStateToProps = (state) => {
    const properties = getState.hostProperties.getPropertiesAutocomplete(state);
    const isEmailSending = getState.hostProperties.emailOrderHistoryPosting(state);

    return { properties, isEmailSending };
};

class HostPropertyFilter extends React.Component {

    static propTypes = {
        fetchPropertiesAutocomplete: PropTypes.func.isRequired,
        propertyType: PropTypes.string,
        handleSubmit: PropTypes.func.isRequired,
        emailOrderHistory: PropTypes.func.isRequired,
        properties: PropTypes.array,
        isPastBooking: PropTypes.bool,
        isEmailSending: PropTypes.bool
    }

    constructor(props) {
        super(props);

        this.changeProperty = this.changeProperty.bind(this);
        this.fetchProperties = this.fetchProperties.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.buildParams = this.buildParams.bind(this);

        this.state = {
            propertyId: null,
            propertyCode: null
        };
    }

    componentDidMount() {
        this.props.fetchPropertiesAutocomplete(this.buildParams());
    }

    buildParams(input = null) {
        let params = {};
        const { propertyType } = this.props;
        if (propertyType) {
            params.type = propertyType;
        }
        if (input) {
            params.caption = input;
        }
        return params;
    }

    fetchProperties(input) {
        if (input && input.length > 3) {
            this.props.fetchPropertiesAutocomplete(this.buildParams(input));
        } else {
            this.props.fetchPropertiesAutocomplete(this.buildParams());
        }
    }

    changeProperty(event) {
        this.setState({
            propertyId: (event ? event.value : null),
            propertyCode: (event ? event.code : null)
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const { propertyId, propertyCode } = this.state;
        this.props.handleSubmit({
            propertyId,
            propertyCode
        });
    }

    render() {
        const { properties, isPastBooking, isEmailSending } = this.props;

        return (
            <form onSubmit={this.handleSubmit}>
                <Select
                  className="SelectFilterProperty"
                  name="property-id"
                  onInputChange={this.fetchProperties}
                  value={this.state.propertyId}
                  onChange={this.changeProperty}
                  options={properties}
                  placeholder="Filter by Property"
                  style={{ borderColor: 'rgba(254, 84, 89, 0.42)' }}
                />
                <input type="submit" value="Filter" className="button submit" />
                {
                    isPastBooking &&
                    <div className="small-12 medium-3 column">
                        <ButtonLoader
                          expanded
                          disabled={isEmailSending}
                          onClick={() => this.props.emailOrderHistory({})}
                        >
                            Email as CSV
                        </ButtonLoader>
                    </div>
                }
            </form>
        );
    }

}

export default connect(mapStateToProps, {
    fetchPropertiesAutocomplete: actions.hostProperties.fetchPropertiesAutocomplete,
    emailOrderHistory: actions.hostProperties.emailOrderHistory
})(HostPropertyFilter);

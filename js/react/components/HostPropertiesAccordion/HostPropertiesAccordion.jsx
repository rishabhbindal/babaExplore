import React, { PropTypes } from 'react';
import Collapse, { Panel } from 'rc-collapse';

import Loader from './../Loader/Loader.jsx';
import HostPropertyDetailsContainer from '../../containers/HostPropertyDetailsContainer.jsx';

import capitalize from './../../../lib/capitalize.es6.js';

const AccordionHeader = ({ caption, location, status }) => {
    const formatedStatus = (status || '')
        .replace(/[_-]/g, ' ')
        .toLowerCase();

    return (
        <span>
            <span className="host__info" style={{ float: 'left' }}>
                <span>{ caption }</span>
            </span>
            <span className="host__property__type show-for-medium">
                <span>{ location }</span>
            </span>
            <span className="host__property__location show-for-medium">
                <span>{ capitalize(formatedStatus) }</span>
            </span>
        </span>
    );
};

AccordionHeader.propTypes = {
    caption: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string
};

class HostPropertiesAccordion extends React.Component {
    static propTypes = {
        properties: PropTypes.arrayOf(PropTypes.object)
    };

    constructor(props) {
        super(props);
        this.handleAccordion = this.handleAccordion.bind(this);
        this.resetPropertyDetails = this.resetPropertyDetails.bind(this);

        this.state = {
            propertyDetails: null
        };
    }

    componentDidMount() {
        const { properties } = this.props;

        if (properties && properties.length) {
            this.handleAccordion('0');
        }
    }

    resetPropertyDetails() {
        this.setState({ bookingDetails: null });
    }

    handleAccordion(key) {
        if (!key) {
            return null;
        }
        this.resetPropertyDetails();
        const { properties } = this.props;
        const property = properties.find(({ id }) => id === parseInt(key, 10));

        return this.setState({
            propertyDetails: (property ? <HostPropertyDetailsContainer propertyId={property.id} /> : null)
        });
    }

    render() {
        const { properties } = this.props;

        return (
            <Collapse accordion className="booking__accordion" onChange={this.handleAccordion} defaultActiveKey="0">
                {
                    properties.map(property => (
                        <Panel header={<AccordionHeader {...property} />} key={property.id}>
                            {
                                this.state.propertyDetails ||
                                <div className="text-align--center"><Loader size="large" /></div>
                            }
                        </Panel>
                    ))
                }
            </Collapse>
        );
    }
}

export default HostPropertiesAccordion;

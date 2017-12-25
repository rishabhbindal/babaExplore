import React, { PropTypes } from 'react';
import LazyLoad from 'react-lazyload';

import BookableCalendar from '../BookableCalendar/BookableCalendar.jsx';
import HostBookableDetailsForm from './../HostBookableDetailsForm/HostBookableDetailsForm.jsx';
import './HostPropertyDetails.scss';

const ChangePropertyStatus = ({ property, isPropertyUpdating, updateProperties }) => {
    const CHANGE_PROPERTY_STATUSES = [
        {
            label: 'Un Published',
            value: 'EDITING'
        },
        {
            label: 'Private',
            value: 'PRIVATE'
        },
        {
            label: 'Published',
            value: 'PUBLISHED'
        }
    ];

    const handleStatusChange = (event) => {
        updateProperties(property.url, {
            status: event.target.value,
            city: property.city
        });
    };

    return (
        <div className="ChangePropertyStatus">
            <label
              className="ChangePropertyStatus-label"
              htmlFor="change-property-status"
            >
                Your house listing status
            </label>
            <select
              value={property.status}
              className="ChangePropertyStatus-select"
              onChange={handleStatusChange}
              disabled={isPropertyUpdating}
            >
                {
                    CHANGE_PROPERTY_STATUSES.map(({ value, label }) => (
                        <option value={value} key={label}>
                            {label}
                        </option>
                    ))
                }
            </select>
        </div>
    );
};

ChangePropertyStatus.propTypes = {
    property: PropTypes.object,
    updateProperties: PropTypes.func,
    isPropertyUpdating: PropTypes.bool
};

class HostPropertyDetails extends React.Component {
    static propTypes = {
        property: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.handleBookableChange = this.handleBookableChange.bind(this);
        const { property } = this.props;
        const currentBookableId = property && property.bookableItems.length > 0 && property.bookableItems[0].id;
        this.state = { currentBookableId };
    }

    handleBookableChange(event) {
        this.setState({ currentBookableId: event.target.value });
    }

    render() {
        const { property, user } = this.props;
        const currentBookable = property &&
                                property.bookableItems.length > 0 &&
                                property.bookableItems.find(item => item.id === this.state.currentBookableId);

        return (
            <div className="h-100">
                <div className="row"><ChangePropertyStatus {...this.props} /></div>

                {
                    property.bookableItems.length > 0 &&
                    <div className="row">
                        <label className="ChangeBookable-label" htmlFor="Select Bookable">Select a Bookable</label>
                        <select
                          className="ChangeBookable-select"
                          onChange={this.handleBookableChange}
                        >
                            {
                                property.bookableItems.map(({ id, caption }) => (
                                    <option value={id} key={id}>
                                        {caption}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                }
                {
                    currentBookable &&
                    <div className="row">
                        <HostBookableDetailsForm bookable={{ ...currentBookable }} key={currentBookable.id} />
                    </div>
                }
                {
                    currentBookable &&
                    <div className="row">
                        <LazyLoad height={300}>
                            <div className="bookable-calendar-container">
                                <BookableCalendar bookable={{ ...currentBookable }} owner={user} />
                            </div>
                        </LazyLoad>
                    </div>
                }
            </div>
        );
    }
}

export default HostPropertyDetails;

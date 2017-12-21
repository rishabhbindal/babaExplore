import React, { PropTypes } from 'react';
import HostPageMenu from './../HostPageMenu/HostPageMenu.jsx';
import HostPropertyFilter from './../HostPropertyFilter/HostPropertyFilter.jsx';

class HostPageLayout extends React.Component {
    static propTypes = {
        children: PropTypes.element,
        handleFilter: PropTypes.func,
        propertyType: PropTypes.string,
        isPastBooking: PropTypes.bool
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(params) {
        const { handleFilter } = this.props;

        if (handleFilter && typeof handleFilter === 'function') {
            handleFilter(params);
        }
    }

    render() {
        return (
            <div className="row">
                <div className="host__panel host__panel__left">
                    <HostPageMenu />
                </div>
                <div className="host__panel host__panel__right">
                    <HostPropertyFilter
                      handleSubmit={this.handleSubmit}
                      propertyType={this.props.propertyType}
                      isPastBooking={this.props.isPastBooking}
                    />
                    { this.props.children }
                </div>
            </div>
        );
    }
}

export default HostPageLayout;

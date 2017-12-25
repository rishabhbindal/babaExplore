import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions as appActions } from '../reducers';

import Loader from '../components/Loader/Loader.jsx';

class CityLocalitiesOptionsContainer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        fetchLocalities: PropTypes.func.isRequired,
        locality: PropTypes.string,
        withoutLabel: PropTypes.bool
    }

    static defaultProps = {
        className: '',
        state: null,
        city: null,
        locality: null,
        withoutLabel: false
    }

    constructor(...args) {
        super(...args);

        this.handleLocalityChange = this.handleLocalityChange.bind(this);

        this.state = {
            isFetching: false,
            localities: []
        };
    }

    componentWillMount() {
        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.city !== this.props.city
            || nextProps.state !== this.props.state
        ) {
            this.fetchData(nextProps);
        }
    }

    fetchData(loc) {
        const city = (loc && loc.city) || this.props.city;
        const state = (loc && loc.state) || this.props.state;

        if (!city) {
            this.setState({ localities: [] });
            return;
        }

        this.setState({ isFetching: true });
        this.props.fetchLocalities({ city, state })
            .then((localities) => {
                this.setState({
                    isFetching: false,
                    localities
                });
            });
    }

    handleLocalityChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        const { locality, withoutLabel, className } = this.props;
        const { localities, isFetching } = this.state;

        if (isFetching) {
            // do not return loader until the size issues are fixed
            return null;
        }

        if (!localities.length) {
            return null;
        }

        localities.push('Others');

        return (
            <div className={className}>
                { !withoutLabel && (
                    <label
                      htmlFor="locality"
                      className="special-text"
                    >Filter by Locality</label>
                  )
                }
                <select id="locality" value={locality || ''} onChange={this.handleLocalityChange}>
                    <option value="">All Localities</option>
                    {
                        localities.map(local =>
                            <option value={local} key={local}>{local}</option>
                        )
                    }
                </select>
            </div>
        );
    }
}

export default connect(null, {
    fetchLocalities: appActions.property.fetchLocalities
})(CityLocalitiesOptionsContainer);

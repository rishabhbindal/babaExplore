import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState as appState } from '../reducers';
import { promotedListType } from './../data-shapes/homePage.js';

import HomePageVideos from '../components/HomePage/HomePageVideos.jsx';
import HomePageSpecialEvent from '../components/HomePage/HomePageSpecialEvent.jsx';
import Loader from '../components/Loader/Loader.jsx';
import EventListing from '../components/EventListing/EventListing.jsx';
import EventListHeader from '../components/EventListHeader/EventListHeader.jsx';

const mapStateToProps = (state) => {
    const { homePage } = state;
    const promotedList = appState.homePage.getPromotedList(state) || {};
    const promotedEvents = homePage.events.eventItems || [];
    const descriptionMap = promotedList.description_map || {};
    const homePageStrings = promotedList.strings || {};
    const events = appState.events.getEvents(state);
    const isLoading = appState.events.isEventsLoading(state) || false;

    return { promotedList, promotedEvents, descriptionMap, homePageStrings, events, isLoading };
};

class EventListPageContainer extends React.Component {
    static propTypes = {
        promotedList: promotedListType,
        events: PropTypes.object,
        promotedEvents: PropTypes.arrayOf(PropTypes.object),
        descriptionMap: PropTypes.object,
        homePageStrings: PropTypes.object,
        isLoading: PropTypes.bool,
        fetchEvents: PropTypes.func.isRequired,
        fetchPromotedList: PropTypes.func.isRequired,
        fetchPromotedEvents: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.fetchArchives = this.fetchArchives.bind(this);
        this.changeStatus = this.changeStatus.bind(this);
        this.changeCity = this.changeCity.bind(this);

        this.state = {
            status: 'ACTIVE',
            city: null
        };
    }

    componentDidMount() {
        const { promotedEvents } = this.props.promotedList;
        const { status, city } = this.state;

        const fetchArchives = this.fetchArchives;
        this.fetchData(status, city).then(() => {
            fetchArchives();
        });
        this.props.fetchPromotedList('default')
            .then(() => {
                const fetchPromotedEvents = promotedEvents &&
                                            promotedEvents.map(itemUrl => this.props.fetchPromotedEvents(itemUrl));

                return Promise.all([
                    fetchPromotedEvents
                ]);
            });
    }

    changeStatus() {
        const status = (this.state.status === 'ARCHIVED') ? 'ACTIVE' : 'ARCHIVED';
        this.setState({ status });
        this.fetchData(status, this.state.city);
    }

    changeCity(event) {
        const { city } = event.target.dataset;
        const cityName = (city !== 'All') ? city : null;
        this.setState({ city: cityName });
        this.fetchData(this.state.status, cityName);
    }

    fetchArchives() {
        const { events } = this.props;

        if (events && events.count <= 0 && this.state.status === 'ACTIVE') {
            const status = 'ARCHIVED';
            this.setState({ status });
            this.fetchData(status, this.state.city);
        }
    }

    fetchData(status, city = null) {
        let params = { status };
        if (city) {
            params.city = city;
        }
        return this.props.fetchEvents(params);
    }

    render() {
        const { promotedEvents, descriptionMap, homePageStrings, events, isLoading } = this.props;
        const specialEvent = promotedEvents[0];
        const activeEvents = (descriptionMap && Object.values(descriptionMap)
            .filter(data => (data.type === 'events'))
            .sort((a, b) => (parseInt(a.ordering, 10) - parseInt(b.ordering, 10)))) || [];
        const { special_event_title, event_title } = homePageStrings;

        const EventList = () => {
            if (isLoading) {
                return (<div className="text-align--center" style={{ margin: '50px 0' }}><Loader /></div>);
            }
            if (events && events.count > 0) {
                return (<EventListing {...events} />);
            }
            return (
                <div className="text-align--center" style={{ margin: '50px 0' }}>
                    <h6>No Active Experiences currently scheduled</h6>
                </div>
            );
        };

        return (
            <div>
                <HomePageSpecialEvent event={specialEvent} specialEventTitle={special_event_title} />
                <section>
                    <EventListHeader {...this.state} changeStatus={this.changeStatus} changeCity={this.changeCity} />
                </section>
                <section><EventList /></section>
                { activeEvents.length > 0 && <HomePageVideos items={activeEvents} sectionTitle={event_title} /> }
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchPromotedList: actions.homePage.fetchPromotedList,
    fetchPromotedEvents: actions.homePage.fetchEvents,
    fetchEvents: actions.events.fetchEvents
})(EventListPageContainer);

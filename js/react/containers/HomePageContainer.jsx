import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import LazyLoad from 'react-lazyload';

import { actions, getState as appState } from '../reducers';
import { userPropType } from './../data-shapes/user.js';
import { promotedListType } from './../data-shapes/homePage.js';

import HomePagePlaces from '../components/HomePage/HomePagePlaces.jsx';
import HomePageVideos from '../components/HomePage/HomePageVideos.jsx';
import HomePageNews from '../components/HomePage/HomePageNews.jsx';
import HomePageCommunities from '../components/HomePage/HomePageCommunities.jsx';
import HomePageSpecialEvent from '../components/HomePage/HomePageSpecialEvent.jsx';
import HomePageLanding from '../components/HomePageLanding/HomePageLanding.jsx';
import FooterContainer from './FooterContainer.jsx';
import HomepageHelmet from '../components/HomepageHelmet.jsx';

const mapStateToProps = (state, { propertyCode }) => {
    const { homePage, user } = state;
    const property = appState.event.getProperty(state, propertyCode) || {};
    const isLoading = user.fetching;
    const promotedList = appState.homePage.getPromotedList(state) || {};
    const news = promotedList.press || [];
    const properties = promotedList.properties || [];
    const events = promotedList.events || [];
    const groups = promotedList.groups || [];
    const backgroundImages = promotedList.images || [];
    const promotedSearchPages = promotedList.promotedSearchPages || [];
    const homePageStrings = promotedList.strings || {};
    const descriptionMap = promotedList.description_map || {};
    const hostVideos = promotedList.hostVideos || [];
    const seoData = promotedList.seoData;

    return {
        isLoading,
        property,
        promotedList,
        news,
        properties,
        events,
        backgroundImages,
        groups,
        promotedSearchPages,
        homePageStrings,
        descriptionMap,
        hostVideos,
        seoData
    };
};

class HomePageContainer extends React.Component {

    static propTypes = {
        promotedList: promotedListType,
        fetchPress: PropTypes.func.isRequired,
        fetchProperties: PropTypes.func.isRequired,
        fetchEvents: PropTypes.func.isRequired,
        fetchGroups: PropTypes.func.isRequired,
        fetchPromotedList: PropTypes.func.isRequired
    }

    componentDidMount() {
        this.props.fetchPromotedList('default');
    }

    render() {
        const { news, properties, events, backgroundImages, groups,
            promotedSearchPages, homePageStrings, descriptionMap, hostVideos, seoData } = this.props;
        const specialEvent = events;

        const activeEvents = (descriptionMap && Object.values(descriptionMap)
            .filter((data) => (data.type === 'events'))
            .sort((a, b) => (parseInt(a.ordering) - parseInt(b.ordering)))) || [];

        const { hero_string, search_title, special_event_title, community_title,
            community_description, community_description_list, property_title, event_title, news_title, hostvideo_title } = homePageStrings;

        return (
            <div>
                { seoData && <HomepageHelmet
                  seoData={seoData}
                  image={backgroundImages.length && backgroundImages[0].image1640x1100}
                />}
                <div className="view-animate home-page ng-scope">
                    <HomePageLanding
                      heroText={hero_string}
                      searchTitle={search_title}
                      BackgroundImages={backgroundImages}
                      promotedSearchPages={promotedSearchPages}
                    />
                    <LazyLoad height={200}>
                    <HomePageSpecialEvent event={specialEvent} specialEventTitle={special_event_title} />
                    </LazyLoad>
                    <LazyLoad height={100}>
                    <HomePageCommunities
                      groups={groups}
                      communityTitle={community_title}
                      communityDescription={community_description}
                      communityDescriptionList={community_description_list}
                    />
                    </LazyLoad>
                    <LazyLoad height={100}>
                    <HomePagePlaces properties={properties} propertiesTitle={property_title} />
                    </LazyLoad>
                    <LazyLoad height={100}>
                        { (hostVideos.length >= 3) && <HomePageVideos items={hostVideos} sectionTitle={hostvideo_title} />}
                    </LazyLoad>
                    <LazyLoad height={100}>
                    { (activeEvents.length > 0 && <HomePageVideos
                      items={activeEvents}
                      sectionTitle={event_title}
                      eventLink
                    />) }
                    </LazyLoad>
                    <LazyLoad height={100}>
                    { (news.length > 0 && <HomePageNews newsItems={news} newsTitle={news_title} />) }
                    </LazyLoad>
                </div>
                <FooterContainer />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchPromotedList: actions.homePage.fetchPromotedList,
    fetchPress: actions.homePage.fetchPress,
    fetchProperties: actions.homePage.fetchProperties,
    fetchEvents: actions.homePage.fetchEvents,
    fetchGroups: actions.homePage.fetchGroups
})(HomePageContainer);

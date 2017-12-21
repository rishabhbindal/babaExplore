import { appActions, appState } from './reducers';
import { matchPath } from 'react-router-dom';

import FooterContainer from './containers/FooterContainer.jsx';
import HomePageContainer from './containers/HomePageContainer.jsx';
import ListingPageContainer from './containers/ListingPageContainer.jsx';
import PrivacyPage from './components/PrivacyPage/PrivacyPage.jsx';
import TermsPage from './components/TermsPage/TermsPage.jsx';
import AboutPage from './components/AboutPage/AboutPage.jsx';
import EventsPageContainer from './containers/EventsPageContainer.jsx';
import CommunityPageContainer from './containers/CommunityPageContainer.jsx';
import StartHostingContainer from './containers/StartHostingContainer.jsx';


const appPaths = [{
    path: '/',
    component: FooterContainer,
    fetchData: (store) => {
        return Promise.all([
            appActions.appConfig.fetchAppConfig(),
            appActions.appConfig.fetchGroups(),
            appActions.event.fetchCancellationPolicies()
        ]).then(res => res.map(store.dispatch));
    }
}, {
    path: '/',
    isExact: true,
    component: HomePageContainer,
    fetchData: store =>
            store.dispatch(appActions.homePage.fetchPromotedList('default'))
}, {
    path: '/listing/:propertyCode',
    component: ListingPageContainer,
    fetchData: (store, { propertyCode }) => {
        store.dispatch(appActions.property.setCurrentProperty(propertyCode));
        return store.dispatch(appActions.property.fetchProperty(propertyCode));
    }
}, {
    path: '/events/:eventCode',
    component: EventsPageContainer,
    fetchData: (store, { eventCode }) => {
        return store.dispatch(appActions.event.fetchEventListing(eventCode)).then(() => {
            const property = appState.event.getProperty(store.getState(), eventCode);
            const { id, owner, eventDate } = property;

            return Promise.all([
                appActions.property.fetchProperty(eventCode), /* a hack to make it work with order reducer changes */
                appActions.user.fetchUser(owner),
                appActions.event.fetchGuests(id, eventDate),
                appActions.event.fetchCancellationPolicies()
            ]);
        });
    }
}, {
    path: '/community/:communityName',
    component: CommunityPageContainer,
    fetchData: (store, { communityName }) => {
        try {
            const name = decodeURIComponent(communityName);
            return store.dispatch(appActions.community.fetchCommunity(name));
        } catch (e) {
            console.log('Error while parsing community name=', communityName);
            return Promise.resolve(null);
        }
    }
}, {
    path: '/privacy',
    component: PrivacyPage
}, {
    path: '/terms',
    component: TermsPage
}, {
    path: '/about',
    component: AboutPage
},{
    path: '/start-hosting',
    component: StartHostingContainer
}];


export default ({ url, store }) => {
    const promises = [];

    appPaths.forEach((route) => {
        const match = matchPath(url, route);

        if (!match || (route.isExact && !match.isExact)) {
            return;
        }

        const { params } = match;

        if (route.fetchData) {
            promises.push(route.fetchData(store, params));
        }
    });

    return Promise.all(promises).catch(e => {
        console.log('e=', e);
    });
};

import 'babel-polyfill';
import React from 'react';
import Loadable from 'react-loadable';

import { Route, Switch } from 'react-router-dom';

import PrivateRoute from '../react/containers/PrivateRoute.jsx';

import HomePageContainer from '../react/containers/HomePageContainer.jsx';

/* Host pages */
import HostOrderPaymentContainer from '../react/containers/HostOrderPaymentContainer.jsx';

/* Community pages */
import CommunityPageContainer from '../react/containers/CommunityPageContainer.jsx';
import CommunitiesPageContainer from '../react/containers/CommunitiesPageContainer.jsx';
import TopMemberPageContainer from '../react/containers/TopMemberPageContainer.jsx';

import EventListPageContainer from '../react/containers/EventListPageContainer.jsx';
import GuestListMainBodyContainer from '../react/containers/GuestListMainBodyContainer.jsx';

import SearchResults from '../react/containers/SearchResultContainer.jsx';
import SearchFilter from '../react/containers/SearchFilterFormContainer.jsx';
import CoworkContainer from '../react/containers/CoworkContainer.jsx';
import ExperientialStaysContainer from '../react/containers/ExperientialStaysContainer.jsx';

import SignupFormContainer from '../react/containers/SignupFormContainer.jsx';
import ExtraInfoContainer from '../react/containers/ExtraInfoContainer.jsx';
import UserDashboardContainer from '../react/containers/UserDashboardContainer.jsx';

import SiteHeaderContainer from '../react/containers/SiteHeaderContainer.jsx';
import FooterContainer from '../react/containers/FooterContainer.jsx';

import '../../scss/elt-glyphs.scss';
import '../../font/proximanova/fonts.min.css';
import '../../scss/global.scss';

import '../../css/explore.css';
import Loader from './components/Loader/Loader.jsx';
import 'react-select/dist/react-select.css';
import 'rc-collapse/assets/index.css';
import 'react-dates/lib/css/_datepicker.css';

class NoMatch extends React.Component {
    componentWillMount() {
        const { history } = this.props;
        setTimeout(() => {
            history.push('/');
        }, 5000);
    }

    render() {
        return (
            <div style={{ margin: '20rem 5rem', textAlign: 'center' }}>
                <h4>
                    The path doesn't seem to exist. Sorry about that. We are taking you to
                    <a href="/"> home page</a>.
                </h4>
            </div>
        );
    }
}

const L = loaderFn => Loadable({
    loader: loaderFn,
    loading: () => <Loader className="pa4 tc w-100" />,
    render({ default: Component }, props) {
        return <Component {...props} />;
    }
});

const TermsPage = () => import(/* webpackChunkName: "terms" */'./../react/components/TermsPage/TermsPage.jsx');
const AboutPage = () => import(/* webpackChunkName: "about" */'./../react/components/AboutPage/AboutPage.jsx');
const PrivacyPage = () => import(/* webpackChunkName: "privacy" */'./../react/components/PrivacyPage/PrivacyPage.jsx');

const ListingPage = () => import(/* webpackChunkName: "listing" */'./../react/containers/ListingPageContainer.jsx');
const HostPages = () => import(/* webpackChunkName: "hostpages" */'./../react/containers/HostPages.jsx');
const EventPage = () => import(/* webpackChunkName: "eventPage" */'./../react/containers/EventsPageContainer.jsx');
const StartHostingPage = () => import(/* webpackChunkName: "createProperty" */'./../react/containers/StartHostingContainer.jsx');

const CommonApp = () => (
    <div>
        <Route path="/" render={() => <SiteHeaderContainer />} />
        <Switch>
            <Route path="/about" component={L(AboutPage)} />
            <Route path="/privacy" component={L(PrivacyPage)} />
            <Route path="/terms" component={L(TermsPage)} />
            <PrivateRoute path="/start-hosting" component={L(StartHostingPage)} />

            <Route path="/listing/:propertyCode" component={L(ListingPage)} />

            {/* Community pages */}
            <Route path="/find-your-people" component={CommunitiesPageContainer} />
            <Route path="/community/:name/topmembers" component={TopMemberPageContainer} />
            <Route
              path="/community/:name/admins"
              render={props => <TopMemberPageContainer {...props} isMangersList />}
            />
            <Route path="/community/:name" component={CommunityPageContainer} />

            {/* Event details pages */}
            <Route exact path="/events" component={EventListPageContainer} />
            <Route path="/events/:eventCode/guestlist" component={GuestListMainBodyContainer} />
            <Route path="/events/:eventCode" component={L(EventPage)} />

            <Route path="/search" component={SearchResults} />
            <Route path="/search-filter" component={SearchFilter} />
            <Route path="/cowork" component={CoworkContainer} />
            <Route path="/experiential-stays" component={ExperientialStaysContainer} />

            <Route path="/missing-details" component={ExtraInfoContainer} />
            <PrivateRoute path="/user-dashboard" component={UserDashboardContainer} />

            <Route path="/host-order-payment" component={HostOrderPaymentContainer} />

            <PrivateRoute path="/host" component={L(HostPages)} />
            <Route component={NoMatch} />
        </Switch>
        <Route path="/" render={() => <FooterContainer />} />
    </div>
);

export default () => (
    <Switch>
        <Route exact path="/" component={HomePageContainer} />
        <Route exact path="/home" component={HomePageContainer} />
        {/* just showing the homepage when someone goes to the signup page */}
        <Route exact path="/signup" component={HomePageContainer} />
        <Route path="/" render={CommonApp} />
    </Switch>
);

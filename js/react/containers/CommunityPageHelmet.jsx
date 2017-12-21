import React from 'react';
import Helmet from 'react-helmet';
import { groupPropType } from './../data-shapes/group';

class CommunityPageHelmet extends React.Component {
    static propTypes = {
        community: groupPropType
    }

    static defaultProps = {
        community: null
    }

    render() {
        const { community } = this.props;

        if (!community) {
            return (
                <Helmet>
                    <title>ExploreLifeTraveling</title>
                    <meta property="og:title" content="ExploreLifeTraveling" />
                    <meta property="og:url" content={__HOST_URL__} />
                </Helmet>
            );
        }

        const firstImage = (community.images && community.images[0]) || {};

        return (
            <Helmet>
                <title>ExploreLifeTraveling - {community.name}</title>
                <meta name="description" content={community.information} />
                {/* <meta name="keywords" content={property.meta && property.meta.keywords} /> */}
                <meta property="og:title" content={`ExploreLifeTraveling - ${community.name}`} />
                <meta property="og:url" content={`${__HOST_URL__}/community/${community.name}`} />
                <meta property="og:description" content={community.information} />
                <meta property="og:image" content={firstImage.large || firstImage.medium || firstImage.small} />
            </Helmet>
        );
    }
}

export default CommunityPageHelmet;

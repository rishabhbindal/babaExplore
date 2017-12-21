import React from 'react';
import Helmet from 'react-helmet';
import { eventPropertyType } from '../data-shapes/property.js';

class ListingHelmet extends React.Component {
    static propTypes = {
        property: eventPropertyType
    }

    static defaultProps = {
        property: null
    }

    render() {
        const { property } = this.props;

        if (!property) {
            return (
                <Helmet>
                    <title>ExploreLifeTraveling</title>
                    <meta property="og:title" content="ExploreLifeTraveling" />
                    <meta property="og:url" content={__HOST_URL__} />
                </Helmet>
            );
        }

        const firstImage = (property.images && property.images[0]) || {};

        return (
            <Helmet>
                <title>ExploreLifeTraveling - {property.caption}</title>
                <meta name="description" content={property.meta.description} />
                <meta name="keywords" content={property.meta.keywords} />
                <meta property="og:title" content={`ExploreLifeTraveling - ${property.caption}`} />
                <meta property="og:url" content={`${__HOST_URL__}/listing/${property.code}`} />
                <meta property="og:description" content={property.character} />
                <meta property="og:image" content={firstImage.large || firstImage.medium || firstImage.small} />
            </Helmet>
        );
    }
}

export default ListingHelmet;

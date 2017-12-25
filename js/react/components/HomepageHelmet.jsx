import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

class HomepageHelmet extends React.Component {
    static propTypes = {
        seoData: PropTypes.shape({
            title: PropTypes.string,
            keywords: PropTypes.string,
            description: PropTypes.string
        }),
        image: PropTypes.string
    }

    static defaultProps = {
        seoData: null,
        image: null
    }

    render() {
        const { seoData, image } = this.props;
        if (!seoData) {
            return (
                <Helmet>
                    <title>ExploreLifeTraveling</title>
                    <meta property="og:title" content="HomeStays" />
                    <meta property="og:url" content={__HOST_URL__} />
                </Helmet>
            );
        }
        return (
            <Helmet>
                <title>ExploreLifeTraveling</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta name="og:description" content={seoData.description} />
                <meta name="og:title" content={seoData.title} />
                <meta property="og:url" content={__HOST_URL__} />
                <meta
                  name="og:image"
                  content={
                    'https://d1mpyadj18j171.cloudfront.net/media/imagerepo/486fcf8e-7781-4f07-8d53-078788186576.jpg'
                  }
                />
            </Helmet>
        );
    }
}

export default HomepageHelmet;

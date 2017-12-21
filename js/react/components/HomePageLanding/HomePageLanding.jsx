import React, { PropTypes } from 'react';

import './HomePageLanding.scss';

import HomePageSearch from './HomePageSearch.jsx';
import HeroText from './HeroText.jsx';
import SiteHeaderContainer from '../../containers/SiteHeaderContainer.jsx';

const HomePageLanding = ({ BackgroundImages, promotedSearchPages, searchTitle, heroText }) => {
    const backgroundImage = BackgroundImages.length ? BackgroundImages[0].image1640x1100 : null;

    return (
        <header
          className="hero splash151" style={{
              background: `url(${backgroundImage}) no-repeat 72% center / cover`
          }}
        >
            <div className="topbar">
                <SiteHeaderContainer />
            </div>
            <div style={{margin:'auto',marginTop:'48px'}}>
                <div className="section__title">
                    <span className="home__title">Explore unique stays.</span>
                    <span className="section__title__text">{ searchTitle }</span>
                </div>
            </div>
            <div className="spl-content">

                <HomePageSearch promotedSearchPages={promotedSearchPages} searchTitle={searchTitle} />
            </div>
        </header>
    );
};

export default HomePageLanding;

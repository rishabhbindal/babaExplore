import React, { PropTypes } from 'react';

import './HomePageVideos.scss';

import PreviewPropertyContainer from './../../containers/PreviewPropertyContainer.jsx';
import ELTSlider from './../ELTSlider/ELTSlider.jsx';

const HomePagePlaces = ({ properties, propertiesTitle }) => {
    const propertiesSection = properties.length > 0 && (
        properties.map((property, id) => (
            <div key={id}>
                <PreviewPropertyContainer property={property} ownerUrl={property.owner} />
            </div>
        ))
    );

    const carouselSettings = {
        infinite: false,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        lazyLoad: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3
                }

            },

            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    };

    const slider = propertiesSection ? (<ELTSlider settings={carouselSettings}>{ propertiesSection }</ELTSlider>) : null;

    return (
        <section>
            <div className="row full-grid">
                <div className="section-title centered">
                    <h2>{ propertiesTitle }</h2>
                </div>
                <div className="featured-listings">
                    { slider }
                </div>
            </div>
        </section>
    );
};

export default HomePagePlaces;

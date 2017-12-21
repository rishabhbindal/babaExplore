import React, { PropTypes } from 'react';

import './HomePageVideos.scss';

import ELTSlider from './../ELTSlider/ELTSlider.jsx';
import YouTubeLazy from '../YouTubeLazy/YouTubeLazy.jsx';
import TruncatedText from '../TruncatedText/TruncatedText.jsx';

const HomePageVideos = ({ items, sectionTitle, eventLink }) => {
    const itemsSection = items.length > 0 && (
        items.map((item, id) => (
            <div key={`${item.video_url}${item.page_url}${id}`} className="ph2-ns">
                <h4 className="w-100 tc h3">{ item.title }</h4>
                <YouTubeLazy url={item.video_url} />
                { item.page_url && <p className="tc">
                    <a href={item.page_url} target="_blank" className="HomePageVides__pageurl">
                        { eventLink ? 'Link to Event' : 'Link to Listing' }
                    </a></p> }
                <p className="pa2">
                    { <TruncatedText text={item.description} linit={50} /> }
                </p>
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

    const slider = itemsSection ? (<ELTSlider settings={carouselSettings}>{ itemsSection }</ELTSlider>) : null;

    return (
        <section className="HomepageVideo-updates">
            <div className="row">
                <div className="section-title centered">
                    <h2>{ sectionTitle }</h2>
                </div>

                { slider }
            </div>
        </section>
    );
};

HomePageVideos.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        page_url: PropTypes.string,
        video_url: PropTypes.string,
        description: PropTypes.string
    })).isRequired,
    sectionTitle: PropTypes.string.isRequired,
    eventLink: PropTypes.bool
};

HomePageVideos.defaultProps = {
    eventLink: false
};

export default HomePageVideos;

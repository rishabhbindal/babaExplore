import React, { PropTypes } from 'react';

import './HomePageNews.scss';

import NewsItem from './NewsItem.jsx';
import ELTSlider from './../ELTSlider/ELTSlider.jsx';

const HomePageNews = ({ newsItems, newsTitle }) => {
    const newsItemsSection = newsItems.length > 0 && (
      newsItems.map((newsItem, id) => (
        <div key={id}>
            <NewsItem newsItem={newsItem} />
        </div>
      ))
    );

    const carouselSettings = {
        infinite: false,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        lazyLoad: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2
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

    const slider = newsItemsSection ? (<ELTSlider settings={carouselSettings}>{ newsItemsSection }</ELTSlider>) : null;

    return (
        <section className="news__stories">
            <div className="row flush full-grid">
                <div className="section-title centered">
                    <h2>{ newsTitle }</h2>
                </div>
                <div>
                    <div className="row">
                        { slider }
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePageNews;

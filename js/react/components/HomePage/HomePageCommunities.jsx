import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import './HomePageCommunities.scss';
import findCommunityImg from '../../../../images/comm-find@2x.jpg';

import ELTSlider from './../ELTSlider/ELTSlider.jsx';

const HomePageCommunities = ({ groups, communityTitle, communityDescription, communityDescriptionList }) => {
    const slides = groups
          .filter((groupItem, id) => (groupItem.isPublished))
          .map((groupItem, id) => (
              <div
                key={id} style={{
                    padding: '0 10px 0 10px'
                }}
              >
                  <Link to={`/community/${groupItem.name}`}>
                      <img src={ groupItem.coverImage.custom || groupItem.coverImage.src} alt={groupItem.coverImage.caption} style={{ boxShadow: '2px 12px 32px rgba(10, 10, 10, 0.3)', width: '100%' }}/>
                  </Link>
              </div>
          ));

    if (!slides.length) {
        return null;
    }

    if (slides.length) {
        slides.push((<div
          key="all_communities" style={{
              padding: '0 10px 0 10px'
          }}
        >
            <Link to="/find-your-people">
                <img src={findCommunityImg} style={{ boxShadow: '2px 12px 32px rgba(10, 10, 10, 0.3)', width: '100%' }} />
            </Link>
        </div>));
    }

    const carouselSettings = {
        infinite: false,
        speed: 300,
        slidesToShow: 4,
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

    const slider = slides.length ? (<ELTSlider settings={carouselSettings}>{ slides }</ELTSlider>) : null;

    return (
        <section>
            <div className="row small-grid no-title">
                <div className="grid-panel">
                    <div className="text-panel carousel-panel">
                        <div className="icon"><i className="icon-badge" /></div>
                        <h4>{ communityTitle }</h4>
                        <p>{ communityDescription }</p>
                        <ul>
                            {
                            communityDescriptionList && communityDescriptionList.map((text, id) => (<li key={id}>{ text }</li>))
                          }
                        </ul>
                        <p>
                            <Link to="/find-your-people" className="right-arrow">Learn more</Link>
                        </p>
                        <div className="panel-flush">
                            { slider }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePageCommunities;

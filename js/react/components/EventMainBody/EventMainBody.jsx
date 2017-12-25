import React, { PropTypes } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';

import './EventMainBody.scss';

import EventBookingContainer from '../../containers/EventBookingContainer.jsx';
import EventBookingContainerForPhone from '../../containers/EventBookingContainerForPhone.jsx';

import PropertyDescriptionList from '../PropertyDescriptionList/PropertyDescriptionList.jsx';
import Loader from '../Loader/Loader.jsx';
import ELTSlider from '../ELTSlider/ELTSlider.jsx';
import GuestListPreview from '../GuestListPreview/GuestListPreview.jsx';
import PropertyMap from '../PropertyMap/PropertyMap.jsx';
import MultiCarousel from '../MultiCarousel/MultiCarousel.jsx';
import CarouselSwitcher from '../MultiCarousel/CarouselSwitcher/CarouselSwitcher.jsx';
import PaymentSelector from '../PaymentSelector/PaymentSelector.jsx';

import { eventPropertyType } from './../../data-shapes/property.js';
import { userPropType } from './../../data-shapes/user.js';

import HostPropertyCardContainer from '../../containers/HostPropertyCardContainer.jsx';
import ReviewsContainer from '../../containers/ReviewsContainer.jsx';
import atleastTwoOfThree from '../../lib/atleastTwoOfThree.js';

class EventMainBody extends React.Component {
    constructor(props) {
        super(props);
        this.onSlideTypeChange = this.onSlideTypeChange.bind(this);

        this.state = { slideType: 'images' };
    }

    onSlideTypeChange(slideType) {
        this.setState({ slideType });
    }

    render() {
        const { guests, property, owner, isLoading, cancellationPolicies } = this.props;
        const { slideType } = this.state;

        if (isLoading || !property.descriptionMap) {
            return (
                <div className="text-align--center">
                    <Loader size="large" />
                </div>
            );
        }

        const bookable = property.bookables && property.bookables[0];
        const bookableImages = (bookable && bookable.images) || [];
        const imageSetTitle = bookable && (property.imageSetTitle || bookable.caption);

        const bookableSlides = bookableImages.map(img => (
            <div key={img.id}>
                <img
                  alt={img.caption}
                  src={img.medium}
                  style={{
                      paddingRight: '10px'
                  }}
                />
            </div>
        ));
        const policyTitle = 'Cancellation Policy';
        if (cancellationPolicies && !property.descriptionMap.find(p => p.title === policyTitle)) {
            const policy = cancellationPolicies.find(p => p.name === property.cancellationPolicy);
            if (policy) {
                property.descriptionMap.push({
                    title: policyTitle,
                    content: policy.details
                });
            }
        }

        const showSwitcher = !!atleastTwoOfThree(
            property.images.length,
            property.panoImages.length,
            property.videos.length
        );

        return (
            <div>
                <StickyContainer>
                    <main className="row bg-white">
                        <div className="EventMainBody">
                            <div className="EventBody__section" style={{ minHeight: 400 }}>
                                <p className="EventMainBody__character">{property.character}</p>
                                <div className="relative">
                                    <MultiCarousel property={property} slideType={slideType} />
                                    { showSwitcher && <CarouselSwitcher
                                      inlineSwitcher
                                      property={property}
                                      onSlideTypeChange={this.onSlideTypeChange}
                                    /> }
                                </div>
                            </div>
                            <LazyLoad height={300}>
                            <div className="EventBody__section EventBody__section--separator">
                                <PropertyDescriptionList
                                  descriptionList={property.descriptionMap}
                                  updateDescription={() => {}}
                                  property={property}
                                  updatePolicy={() => {}}
                                  cancellationPolicies={cancellationPolicies}
                                />
                            </div>
                            </LazyLoad>
                            <LazyLoad height={300}>
                            {
                                bookableSlides.length !== 0 && (
                                    <div className="EventBody__section EventBody__section--separator">
                                        <h5>{imageSetTitle}</h5>
                                        <ELTSlider>
                                            {bookableSlides}
                                        </ELTSlider>
                                    </div>
                                )
                            }
                            </LazyLoad>

                            <LazyLoad height={300}>
                            <div className="cf pb4 pt3">
                                <HostPropertyCardContainer
                                  propertyCode={property.linkedListingCode}
                                />
                            </div>
                            </LazyLoad>

                            <hr />
                            <LazyLoad height={300}>
                                <div className="cf pb4 pt3">
                                    <ReviewsContainer propertyId={property.id} />
                                </div>
                            </LazyLoad>
                        </div>
                        <aside className="EventMainBody__side-bar">
                            { guests && guests.length !== 0 &&
                                <div className="EventMainBody__guest-list EventBody__section">
                                    <Link to={`/events/${property.code}/guestlist/`}>
                                        <h5 className="EventMainBody__guestList__heading">
                                            Complete guest list
                                        </h5>
                                    </Link>
                                    <GuestListPreview
                                      guests={guests}
                                      isLoading={isLoading}
                                      code={property.code}
                                    />
                                </div>
                            }
                            <Sticky>
                                <div className="EventMainBody__booking EventBody__section">
                                    <EventBookingContainer property={property} />
                                </div>
                            </Sticky>
                        </aside>
                    </main>
                </StickyContainer>
                <section className="row">
                    <LazyLoad height={400}>
                    <div
                      className="EventMainBody__map"
                      style={{
                          height: 400
                      }}
                    >
                        <PropertyMap
                          position={property.position}
                          label={property.caption}
                          isEditable={() => false}
                        />
                    </div>
                    </LazyLoad>
                </section>
                <EventBookingContainerForPhone property={property} />
                <PaymentSelector property={property} />
            </div>
        );
    }
}

EventMainBody.propTypes = {
    guests: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        profilePic: PropTypes.string
    })),
    isLoading: PropTypes.bool,
    owner: userPropType,
    property: eventPropertyType,
    hostPropOwnerUrl: PropTypes.string,
    cancellationPolicies: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        details: PropTypes.string
    }))
};

export default EventMainBody;

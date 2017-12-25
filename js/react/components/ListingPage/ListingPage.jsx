import cls from 'classnames';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';

import propertyConst from '../../constants/property.js';
import { eventPropertyType } from '../../data-shapes/property.js';
import CommunityLinkContainer from '../../containers/CommunityLinkContainer.jsx';
import DotList from '../DotList/DotList.jsx';
import ELTSlider from '../ELTSlider/ELTSlider.jsx';
import PinIcon from '../Icons/PinIcon.jsx';
import PropertyDescriptionList from
  '../PropertyDescriptionList/PropertyDescriptionList.jsx';
import PropertyMap from '../PropertyMap/PropertyMap.jsx';
import ReviewsContainer from '../../containers/ReviewsContainer.jsx';
import SocialShare from '../SocialShare/SocialShare.jsx';
import UserInfoContainer from '../../containers/UserInfoContainer.jsx';
import BookablePricingFormContainer from '../../containers/BookablePricingFormContainer.jsx';
import BookingFormContainer from '../../containers/BookingFormContainer.jsx';
import MessageModalContainer from '../../containers/MessageModalContainer.jsx';
import ModalBookingSuccessContainer from '../../containers/ModalBookingSuccessContainer.jsx';
import RelatedPropertyContainer from '../../containers/RelatedPropertyContainer.jsx';
import ModalBookingUserMessage from '../../containers/ModalBookingUserMessage.jsx';
import PaymentSelector from '../PaymentSelector/PaymentSelector.jsx';
import HostEditPropertyImagesContainer from '../../containers/HostEditPropertyImagesContainer.jsx';
import MultiCarousel from '../MultiCarousel/MultiCarousel.jsx';
import CarouselSwitcher from '../MultiCarousel/CarouselSwitcher/CarouselSwitcher.jsx';
import MissingDetailsModalContainer from '../../containers/MissingDetailsModalContainer.jsx';
import CaptionLocation from '../EditProperty/CaptionLocation.jsx';
import BookableCaption from '../EditProperty/BookableCaption.jsx';
import BookableEditPricing from '../EditProperty/BookableEditPricing.jsx';
import Amenities from '../EditProperty/Amenities.jsx';
import PropertyDescription from '../EditProperty/PropertyDescription.jsx';
import TruncateTextBetter from '../TruncateTextBetter/TruncateTextBetter.jsx';
import idFromURLEnd from '../../lib/idFromURLEnd.js';
import Loader from '../Loader/Loader.jsx';
import { getState, actions } from '../../reducers';
import isMobileDevice from '../../lib/isMobileDevice.js';
import atleastTwoOfThree from '../../lib/atleastTwoOfThree.js';

import './ListingPage.scss';

class BookableItem extends React.Component {
    static propTypes = {
        showEditables: PropTypes.bool,
        property: eventPropertyType,
        updateBookableList: PropTypes.func
    }

    constructor(props) {
        super(props);

        const { id, caption } = props.bookable;
        const { property } = props;

        this.state = {
            bookable: { id, caption, property: property.url },
            showingModal: false
        };

        this.bookable = { id, caption, property: property.url };

        this.updateBookableCaption = this.updateBookableCaption.bind(this);
        this.updateBookablePricing = this.updateBookablePricing.bind(this);
        this.rearrangeIndex = this.rearrangeIndex.bind(this);
    }

    reloadImages = () => this.forceUpdate();

    updateBookableCaption(caption) {
        const { updateBookableList } = this.props;
        this.bookable.caption = caption;

        updateBookableList(this.bookable);
    }

    updateBookablePricing(pricing) {

        const { updateBookableList } = this.props;
        this.bookable = Object.assign(this.bookable, pricing);

        updateBookableList(this.bookable);
    }

    rearrangeIndex(showingModal) {
        this.setState({ showingModal });
    }

    render() {
        const { bookable, property, showEditables } = this.props;

        if (!bookable) {
            return null;
        }

        let images = [];
        if (bookable.images && bookable.images.length) {
            images = bookable.images;
        }
        if (images.length === 0) {
            images = property.images && property.images.slice(0, 3);
        }

        const bookableImages = images.map(img => (
            <img
              key={img.id}
              alt={img.caption}
              src={img.medium || img.fallbackImage}
            />
        ));
        const { amenities, caption, instanceCount, stay, descriptionMap, url } = bookable;

        /* if (pricing.isPerPersonPricing) {
         *     console.error('Per person pricing for a room should not be allowed.', bookable);
         * }*/

        return (
            <LazyLoad height={200}>
            <div className="cf mv3">
                <div className="fl w-100 w-75-ns mb2">
                    <div className="fl w-100 w-60-ns pv2 relative">
                        {
                            bookableImages.length !== 0 && (
                                <ELTSlider dotsOnLeft>
                                    {bookableImages}
                                </ELTSlider>
                            )
                        }
                        {
                            showEditables && (
                                <div className="absolute w-100 top-0 h-100" style={{ zIndex: this.state.showingModal ? 15 : 14 }}>
                                    <HostEditPropertyImagesContainer
                                      {...this.props}
                                      propertyUrl={url}
                                      reloadImages={this.reloadImages}
                                      rearrangeIndex={this.rearrangeIndex}
                                      isBookableImage
                                      isSmall
                                    />
                                </div>
                            )
                        }
                    </div>
                    <section className="fl w-100 w-40-ns pv2 ph3">
                        <div className="mb3">
                            {
                                showEditables ?
                                    <BookableCaption bookable={bookable} updateCaption={this.updateBookableCaption} />
                                : <h4 className="dib">{caption}</h4>
                            }
                        </div>

                        <div className="mb3">
                            {descriptionMap.map(desc => <p key={desc.title} >{desc.content}</p>)}
                        </div>
                        {
                            amenities.length > 0 && (
                                <section>
                                    <h6 className="fw9 f6 gray">Amenities</h6>
                                    <DotList list={amenities} italic />
                                </section>
                            )
                        }
                    </section>
                </div>
                <section className="fl w-100 w-25-ns pt3 ph2 pb2 bg-light-gray" style={{ minWidth: '240px' }}>
                    {
                        (!showEditables || isMobileDevice()) &&
                        <BookablePricingFormContainer bookable={bookable} property={property} />
                    }
                    {
                        showEditables &&
                        <BookableEditPricing
                          bookable={bookable}
                          property={property}
                          updateBookablePricing={this.updateBookablePricing}
                        />
                    }
                </section>
            </div>
            </LazyLoad>
        );
    }
}

class ListingPage extends React.Component {
    static propTypes = {
        cancellationPolicies: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, details: PropTypes.string })),
        property: eventPropertyType,
        isFetching: PropTypes.bool,
        propertyCode: PropTypes.string.isRequired,
        fetchProperty: PropTypes.func.isRequired,
        testUser: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func,
        userId: PropTypes.string,
        canUserEdit: PropTypes.bool,
        updatePropertyDetails: PropTypes.func,
        updateBookableDetails: PropTypes.func
    }

    static defaultProps = {
        property: null,
        isFetching: false
    }

    constructor(props) {
        super(props);

        this.state = {
            showMap: false,
            showEditables: false,
            isLoading: false,
            isAdmin: false
        };

        this.toggleMap = this.toggleMap.bind(this);
        this.onSlideTypeChange = this.onSlideTypeChange.bind(this);
        this.reloadImages = this.reloadImages.bind(this);
        this.toggleEditables = this.toggleEditables.bind(this);
        this.showEditables = this.showEditables.bind(this);

        this.updateCaption = this.updateCaption.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
        this.updateDescription = this.updateDescription.bind(this);
        this.updateAmenities = this.updateAmenities.bind(this);
        // this.updateBookable = this.updateBookable.bind(this);
        this.updateBookableList = this.updateBookableList.bind(this);
        this.savePropertyDetails = this.savePropertyDetails.bind(this);
        this.updatePropertyDescription = this.updatePropertyDescription.bind(this);
        this.updatePolicy = this.updatePolicy.bind(this);

        this.updatedProperty = {};

        this.descriptionMapList = null;
        this.amenities = null;
        this.bookables = [];
        this.isUserPermissionChecked = false;

        this.updateCount = 0;
        this.counts = {
            success: 0,
            error: 0
        };
    }

    onSlideTypeChange(slideType) {
        const showingVideo = slideType === 'videos';
        this.setState({ showingVideo, slideType });
    }

    setDescriptionList() {
        const { property } = this.props;
        const descriptionMapList = {};
        property.descriptionMap.forEach(({ title, content }, index) => {
            if (title !== propertyConst.descriptionKeys.houseRules) {
                descriptionMapList[index] = {};
                descriptionMapList[index][title] = content;
            }
        });
        this.descriptionMapList = descriptionMapList;
    }

    setAmenitiesList() {
        const { property } = this.props;
        const amenities = [];
        property.amenities.forEach(amenity => amenities.push(amenity));
        this.amenities = amenities;
    }

    checkAdmin() {
        const { testUser, userId } = this.props;
        if (!userId) {
            return false;
        }
        if (this.isUserPermissionChecked) {
            return this.state.isAdmin;
        }
        testUser().then((data) => {
            this.isUserPermissionChecked = true;
            this.setState({ isAdmin: data.admin });
        }).catch((err) => {
            throw Error(err);
        });
        return false;
    }

    reloadImages = () => this.forceUpdate();
    toggleEditables = () => this.setState({ showEditables: !this.state.showEditables });
    toggleMap = () => this.setState({ showMap: !this.state.showMap });
    showEditables = () => this.state.showEditables;

    isOwnerProperty() {
        const { property, userId } = this.props;
        const id = idFromURLEnd(property.owner);
        return this.props.canUserEdit && userId === id;
    }

    canEditProperty() {
        return this.isOwnerProperty() || this.checkAdmin();
    }

    updateCaption(caption) {
        this.updatedProperty.caption = caption;
    }

    updateLocation({ latitude, longitude }) {
        this.updatedProperty.latitude = latitude;
        this.updatedProperty.longitude = longitude;
    }

    updateDescription(name, desc, index) {
        if (!this.descriptionMapList) {
            this.setDescriptionList();
        }
        if (name === propertyConst.descriptionKeys.houseRules) {
            this.updatedProperty.house_rules = desc;
        } else {
            this.descriptionMapList[index][name] = desc;
        }
    }

    updatePropertyDescription(desc) {
        this.updatedProperty.character = desc;
    }

    updateAmenities(name, addFlag = true) {
        if (!this.amenities) {
            this.amenities = [];
        }
        if (this.amenities.length === 0) {
            this.setAmenitiesList();
        }
        if (addFlag) {
            this.amenities.push(name);
        } else {
            this.amenities.splice(this.amenities.indexOf(name), 1);
        }
    }

    updateBookableList(bookable) {
        const bookableObj = this.bookables.find(b => b.id === bookable.id);
        if (!bookableObj) {
            this.bookables.push(bookable);
        }
    }

    updatePolicy(newPolicy) {
        this.updatedProperty.cancellation_policy = newPolicy;
    }

    updateBookables() {
        const { updateBookableDetails, property, fetchProperty } = this.props;
        this.setState({ isLoading: true });
        this.updateCount = this.bookables.length;
        this.bookables.forEach((bookable) => {
            updateBookableDetails(bookable).then(() => {
                this.updateCount -= 1;
                this.counts.success += 1;
                if (this.updateCount === 0 && this.counts.success > 0) {
                    this.bookables = [];
                    this.counts = { success: 0, error: 0 };
                    fetchProperty(property.code);
                    this.setState({ isLoading: false, showEditables: false });
                }
            }).catch((err) => {
                this.updateCount -= 1;
                this.counts.error += 1;
                this.setState({ isLoading: false });
                throw Error(err);
            });
        });
    }

    updateProperty() {
        const { updatePropertyDetails, property, fetchProperty } = this.props;
        const self = this;

        if (this.descriptionMapList) {
            this.updatedProperty.description_map = this.descriptionMapList;
        }

        this.setState({ isLoading: true });
        if (this.amenities) {
            this.updatedProperty.amenities = this.amenities;
        }

        updatePropertyDetails(this.updatedProperty, property).then(() => {
            if (this.bookables.length === 0) {
                fetchProperty(property.code);
                this.setState({ isLoading: false, showEditables: false });
            } else {
                self.updateBookables();
            }
        }).catch((err) => {
            this.setState({ isLoading: false });
            throw Error(err);
        });
    }

    savePropertyDetails() {
        if (!this.state.isLoading) {
            this.updateProperty();
        }
    }

    render() {
        const { property, cancellationPolicies, isFetching } = this.props;
        if (isFetching) {
            return (<div className="tc pa4">
                <Loader />
            </div>);
        }

        if (!property) {
            return (<div className="tc pa4">
                <h2>Property not found. Please check the URL.</h2>
            </div>);
        }

        const policyTitle = propertyConst.descriptionKeys.cancellationPolicy;
        let descriptionMap = property.descriptionMap;

        if (cancellationPolicies && !descriptionMap.find(p => p.title === policyTitle)) {
            const policy = cancellationPolicies.find(p => p.name === property.cancellationPolicy);
            if (policy) {
                descriptionMap = property.descriptionMap.concat([{
                    title: policyTitle,
                    content: policy.details
                }]);
            }
        }

        const { url } = property;

        const showSwitcher = atleastTwoOfThree(
            property.images.length,
            property.panoImages.length,
            property.videos.length
        );

        const ownerInfo = (
            <div className="ma2">
                <div className="clearfix mt3 mt0-ns">
                    <h6 className="subheading">Hosted by</h6>
                    <UserInfoContainer url={property.owner} />
                </div>
                <div className="clearfix mt3">
                    <h6 className="subheading">Managed by</h6>
                    <UserInfoContainer url={property.communityManager} />
                </div>
            </div>
        );

        return (
            <div className="bg-white elt-max-width ma0 center">
                <div className="cf flex elt-flex-wrap-s" style={{ minHeight: 250 }}>
                    <div className="fl w-100 w-two-thirds-ns relative">
                        <div className="relative">
                            <MultiCarousel
                              property={property}
                              slideType={this.state.slideType}
                            />
                            <div
                              className="elt-black-gradient white absolute left-0 right-0 pa2 pa1-m pa1-l z-carousel-caption bottom-0"
                              style={{ zIndex: this.state.showEditables ? 13 : 0 }}
                            >
                                {
                                    !this.state.showingVideo &&
                                    <CaptionLocation
                                      isEditable={this.state.showEditables}
                                      property={property}
                                      updateCaption={this.updateCaption}
                                    />
                                }
                            </div>
                        </div>
                        {
                            this.state.showEditables && (
                                <HostEditPropertyImagesContainer
                                  {...this.props}
                                  propertyUrl={url}
                                  reloadImages={this.reloadImages}
                                />
                            )
                        }
                        {
                            this.canEditProperty() && (
                                <button
                                  onClick={this.toggleEditables}
                                  className="a2a_svg pointer br-100 bg-white-70 absolute right-1 top-1"
                                  style={{ width: '40px', height: '40px', zIndex: 15 }}
                                >
                                    <div style={{ width: '20px', height: '20px', marginLeft: '10px' }}>
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                            <title>Edit</title>
                                            <path
                                              fill="#fe5459"
                                              d="M27 0c2.761 0 5 2.239 5 5 0 1.126-0.372 2.164-1 3l-2 2-7-7 2-2c0.836-0.628 1.874-1 3-1zM2 23l-2 9 9-2 18.5-18.5-7-7-18.5 18.5zM22.362 11.362l-14 14-1.724-1.724 14-14 1.724 1.724z"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            )
                        }
                    </div>

                    <div className="fl w-100 w-third-ns flex flex-column">
                        <div
                          className={cls('h-100 relative db-ns', this.state.showMap ? 'db' : 'dn')}
                          style={{ flex: 1, minHeight: 250 }}
                        >
                            <div className="absolute top-0 bottom-0 left-0 right-0">
                                <LazyLoad height={250}>
                                    <PropertyMap
                                      position={property.position}
                                      label={property.caption}
                                      property={property}
                                      isEditable={this.showEditables}
                                      updateLocation={this.updateLocation}
                                    />
                                </LazyLoad>
                            </div>
                        </div>

                        <div className="dn db-ns">
                            <SocialShare title={property.caption} />
                        </div>
                    </div>
                </div>

                <div className="mb3">
                    <a
                      className="dn-ns link pa2 lh-solid f6 white db bb b--white"
                      style={{ background: '#ffae00' }}
                      onClick={this.toggleMap}
                      role="presentation"
                    >
                        <div className="text-center">
                            <PinIcon className="v-btm mr1" />
                            {this.state.showMap ? 'Hide' : 'Show'} map
                        </div>
                    </a>
                    <div>
                        { !!showSwitcher && <CarouselSwitcher
                          property={property}
                          onSlideTypeChange={this.onSlideTypeChange}
                        />}
                        <div className="w-33 fr dn db-ns">
                            {ownerInfo}
                        </div>
                    </div>
                    <div className={cls('ph3 small-12 medium-8 mv2', { ba: this.state.showEditables })}>
                        {
                            this.state.showEditables ?
                                <PropertyDescription
                                  updatePropertyDescription={this.updatePropertyDescription}
                                  property={property}
                                />
                            : <p><TruncateTextBetter text={property.character} lines={5} /></p>
                        }
                    </div>

                    <LazyLoad height={200}>
                    <div className="w-100 dn-ns">
                        {ownerInfo}
                    </div>
                    </LazyLoad>
                </div>

                {
                    (!!property.amenities.length || this.state.showEditables) &&
                    <div className={cls('b--black-50  pa3 pb2', { ba: this.state.showEditables })}>
                        <h5 className="subheading text-left">Amenities</h5>
                        <Amenities list={property.amenities} isEditable={this.state.showEditables} updateAmenities={this.updateAmenities} />
                    </div>
                }
                {
                    !!property.openToGroups.length && (
                        <LazyLoad height={100}>
                            <div className="pa2">
                                <div className="b--black-50 pa2 mv2 ">
                                    <h5 className="subheading text-left">Available for communities</h5>
                                    {
                                        property.openToGroups.map(grpName => (
                                            <div className="dib-ns mr3-ns" key={grpName}>
                                                <CommunityLinkContainer preferred="small" name={grpName} />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </LazyLoad>
                    )
                }

                <section className="row">
                    <div className="column medium-12 pa2">
                        <div className={cls('b-black pa2 relative', { ba: this.state.showEditables })}>
                            <h4 className="absolute top--1 bg-white ph2">You can book</h4>
                            {property.bookables.map(b => (
                                <div key={b.id}>
                                    <BookableItem
                                      bookable={b}
                                      property={property}
                                      showEditables={this.state.showEditables}
                                      updateBookableList={this.updateBookableList}
                                    />
                                    <hr className="row column small-12" />
                                </div>
                             ))}
                        </div>
                    </div>
                </section>
                <div className="ph2 fixed bottom-0 w-100 mw-inherit z-booking-panel-index">
                    <BookingFormContainer
                      propertyId={property.id}
                      propertyType={property.type}
                      bookables={property.bookables}
                      percentFee={property.percentFee}
                    />
                </div>

                {
                    this.state.showEditables &&
                    <div className="fixed w-100 bottom-0 bg-green pa2 left-0 right-0 f3 pointer" style={{ zIndex: 14 }}>
                        <button className="w-100 white pointer" onClick={this.savePropertyDetails}>Save</button>
                    </div>
                }
                {
                    this.state.isLoading &&
                    <div className="w-100 h-100 fixed top-0 right-0 left-0 bottom-0 text-center bg-white-80">
                        <Loader className="w-20" />
                    </div>
                }

                <section className="row mv4">
                    <div className="column medium-12 pa2">
                        <div className={cls('b-black pa2 pt4 relative', { ba: this.state.showEditables })}>
                            <h4 className="absolute top--1 bg-white ph2">About {property.caption}</h4>
                            <div className="ph3">
                                <PropertyDescriptionList
                                  property={property}
                                  descriptionList={descriptionMap}
                                  isEditable={this.state.showEditables}
                                  updateDescription={this.updateDescription}
                                  cancellationPolicies={cancellationPolicies}
                                  updatePolicy={this.updatePolicy}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <LazyLoad>
                        <div>
                            { !!property.relatedLounge.length && <div className="w-100 w-50-m w-50-l dib pa3">
                                <RelatedPropertyContainer
                                  propCodes={property.relatedLounge}
                                  titleText="This property also offers day lounges:"
                                  link="listing"
                                />
                            </div> }
                            { !!property.relatedEvent.length && <div className="w-100 w-50-m w-50-l dib pa3">
                                <RelatedPropertyContainer
                                  propCodes={property.relatedEvent}
                                  titleText="Events hosted at this property:"
                                  link="events"
                                />
                            </div> }
                        </div>
                    </LazyLoad>
                </section>

                <section className="row mv4">
                    <div className="column medium-8">
                        <LazyLoad>
                            <ReviewsContainer propertyId={property.id} />
                        </LazyLoad>
                    </div>
                </section>

                <MessageModalContainer />
                <ModalBookingSuccessContainer />
                <ModalBookingUserMessage />
                <MissingDetailsModalContainer />
                <PaymentSelector property={property} />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const userId = getState.session.userId(state);
    const user = getState.user.getUser(state, userId);
    return { userId, canUserEdit: user && user.canCreateHostOrder };
};

export default connect(mapStateToProps, {
    updatePropertyDetails: actions.property.updatePropertyDetails,
    updateBookableDetails: actions.property.updateBookableDetails,
    testUser: actions.user.testUser
})(ListingPage);

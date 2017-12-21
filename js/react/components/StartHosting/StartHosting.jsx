import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';
import isEmail from 'sane-email-validation';
import { Link } from 'react-router-dom';

import DescriptionMap from './DescriptionMap.jsx';
import { imageTypes } from '../../constants/images.js';
import { isYoutubeUrlMatched } from '../../lib/youtubeHelper.js';
import CreatePropertyMap from './CreatePropertyMap.jsx';
import GoogleMapScriptLoader from '../GoogleMapScriptLoader.jsx';
import propertyConfig from '../../constants/property.js';
import Loader from '../Loader/Loader.jsx';
import NoLoggedInUserModel from '../LoginModal/NoLoggedInUserModal.jsx';

const defaultCommunityManager = 'tina@explorelifetraveling.com';

const Astrik = () => (
    <span className="b f5 red">*</span>
);

class StartHostingForm extends Component {
    static propTypes = {
        createProperty: PropTypes.func.isRequired,
        updatePropertyDetails: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired,
        updateStreetAddress: PropTypes.func.isRequired,
        lookupUser: PropTypes.func.isRequired,
        updateUser: PropTypes.func.isRequired,
        addPropertyVideo: PropTypes.func.isRequired,
        addPropertyImage: PropTypes.func.isRequired,
        addPropertyPanoramaImage: PropTypes.func.isRequired
    }
    static defaultProps = {
        user: null
    }

    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            city: null,
            state: null,
            country: null,
            postal_code: null,
            caption: '',
            external_video_link: '',
            hostUsername: '',
            images: { panorama: [], property: [] },
            description_map: [{ key: 'House Rules', value: '' }],
            property_url: '',
            character: '',
            showMap: false,
            location: null,
            propertyCreated: false
        };

        this.property = null;
        this.errors = [];

        this.updateCount = 0;

        this.inputs = { property: null, panorama: null };

        this.user = props.user;
        this.setRef = this.setRef.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.onImagesAddClick = this.onImagesAddClick.bind(this);
        this.onPanoramaAddClick = this.onPanoramaAddClick.bind(this);

        this.onValueChange = this.onValueChange.bind(this);
        this.onAddDescription = this.onAddDescription.bind(this);
        this.onDeleteDescription = this.onDeleteDescription.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
        this.onShowMap = this.onShowMap.bind(this);
        this.closeLoginModel = this.closeLoginModel.bind(this);
    }

    componentDidMount() {
        // set default community manager if present
        this.getUser(defaultCommunityManager, users =>
            users && users.length > 0 && this.setState({ manager_username: users[0].email })
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user) {
            this.user = nextProps.user;
            this.props.updateUser(this.user);
            this.setState({ hostUsername: this.user.email });
        }
    }

    getUser(name, callback) {
        const { lookupUser } = this.props;
        lookupUser({ name }).then((user) => {
            if (callback) {
                callback(user);
            }
        }).catch((err) => {
            this.pushError(err);
            throw Error(err);
        });
    }

    setRef(ref, type) {
        if (ref) {
            this.inputs[type] = ref;
        }
    }

    showResponseMessage() {
        const { showMessageModal } = this.props;

        this.updateCount -= 1;
        if (this.updateCount === 0) {
            this.setState({ isLoading: false });
            if (this.errors.length > 0) {
                const withErrors = this.errors.filter(err => err !== null);
                if (withErrors.length === 0) {
                    showMessageModal('Error', 'Error occured! Please try again');
                } else {
                    showMessageModal(
                        'Error',
                        (
                            <ul>
                                {withErrors.map(err => <li>{err}</li>)}
                            </ul>
                        )
                    );
                }
            } else {
                this.setState({ propertyCreated: true });
            }
        }
    }

    pushError(error) {
        if (error.message) {
            this.errors.push(error.message);
        } else {
            this.errors.push(error);
        }
    }

    addYoutubeVideo(video) {
        const { property } = this;
        const { addPropertyVideo } = this.props;
        const imageData = Object.assign(video, {
            property: property.url,
            ordering: 0
        });

        addPropertyVideo(imageData).then(() => {
            this.showResponseMessage();
        }).catch((err) => {
            this.pushError(err);
            this.showResponseMessage();
            throw Error(err);
        });
    }

    uploadImage(image, order, type) {
        const { property } = this;
        const { addPropertyImage, addPropertyPanoramaImage } = this.props;
        const imageData = {
            image,
            caption: '',
            ordering: order,
            property: property.url
        };

        if (type === imageTypes.PROPERTY) {
            addPropertyImage(imageData, property.id, type).then(() => {
                this.showResponseMessage();
            }).catch((err) => {
                this.pushError(err);
                this.showResponseMessage();
                throw Error(err);
            });
        } else {
            addPropertyPanoramaImage(imageData).then(() => {
                this.showResponseMessage();
            }).catch((err) => {
                this.pushError(err);
                this.showResponseMessage();
                throw Error(err);
            });
        }
    }

    uploadAssets() {
        const { external_video_link, images } = this.state;
        this.updateCount = images.property.length + images.panorama.length;

        let length = images.property.length;
        for (let i = 0; i < length; i += 1) {
            this.uploadImage(images.property[i], i, imageTypes.PROPERTY);
        }

        length = images.panorama.length;
        for (let i = 0; i < length; i += 1) {
            this.uploadImage(images.panorama[i], i);
        }

        if (external_video_link !== '') {
            this.updateCount += 1;
            this.addYoutubeVideo({ external_video_link });
        }
    }

    onSubmit() {
        if (this.state.isLoading) {
            return false;
        }
        if (!this.user) {
            this.setState({ showLogin: true });
            return false;
        }
        const { caption, external_video_link, hostUsername, external_property_url, manager_username } = this.state;
        const { city, state, country, postal_code, street_address, character, latitude, longitude } = this.state;
        const { images } = this.state;

        const missingFields = [];
        const isPresent = value => value && value !== '';
        const addToMissing = (key, flag) => flag && missingFields.push(key);

        addToMissing('Property caption', !isPresent(caption));
        addToMissing('Property photos', !images.property.length);
        addToMissing('Location', !(city && state) || !isPresent(street_address));

        const errorList = keys => (
            <div>
                Please provide required details
                <ul>{keys.map(key => <li>{key}</li>)}</ul>
            </div>
        );

        if (missingFields.length > 0) {
            this.showMessage('Error', errorList(missingFields));
            return false;
        }

        if (!isEmail(hostUsername)) {
            this.showMessage('Error', 'Please provide valid email');
            return false;
        }
        if (external_video_link !== '' && !isYoutubeUrlMatched(external_video_link)) {
            this.showMessage('Error', 'Please provide valid video link');
            return false;
        }

        const { email } = this.user;
        const description_map = {};

        this.state.description_map.filter(({ key, value }) => key !== '' && value !== '')
            .map(({ key, value }, index) => {
                const obj = { };
                obj[key] = value;
                description_map[index] = obj;
                return false;
            });

        const createPropertyData = {
            status: 'EDITING',
            instabook: false,
            cancellation_policy: 'NO_REFUNDS',
            country,
            state,
            city,
            postal_code,
            latitude,
            longitude,
            caption,
            street_address,
            character,
            description_map,
            manager_username
        };

        if (!manager_username || manager_username === '') {
            createPropertyData.manager_username = email;
        }

        createPropertyData.notes = {
            external_property_url: [external_property_url].join(','),
            host_email: hostUsername
        };

        this.errors = [];
        this.setState({ isLoading: true });

        if (!this.property) {
            const { createProperty, updatePropertyDetails } = this.props;
            createProperty(createPropertyData).then((data) => {
                this.property = data;
                this.uploadAssets();
                if (hostUsername !== email) {
                    this.getUser(hostUsername, (users) => {
                        if (users && users.length > 0) {
                            createPropertyData.owner_username = users[0].email;
                            updatePropertyDetails({ owner_username: users[0].email }, this.property).then(() => {
                            }).catch((err) => {
                                this.setState({ isLoading: false });
                                throw Error(err);
                            });
                        }
                    });
                }
            }).catch((err) => {
                this.setState({ isLoading: false });
                this.showMessage('Error', err.toString());
                throw Error(err);
            });
        } else {
            this.uploadAssets();
        }
        return false;
    }

    onAddDescription() {
        const { description_map } = this.state;
        description_map.push({ '': '' });
        this.setState({ description_map });
    }

    onDeleteDescription(index) {
        const description_map = [];
        this.state.description_map.map((obj, i) => i !== index && description_map.push(obj));
        this.setState({ description_map });
    }

    onDescriptionChange(index, description) {
        const { description_map } = this.state;
        description_map[index] = description;
        this.setState({ description_map });
    }

    onStateChange(e) {
        this.setState({ state: (e.target.value !== '' ? e.target.value : null), city: null });
    }

    onCityChange({ city }) {
        this.setState({ city: city !== '' ? city : null });
    }

    onLocationChange(location) {
        this.setState({ ...location });
        this.props.updateStreetAddress(location.street_address);
    }

    onShowMap() {
        this.setState({ showMap: true });
    }

    closeModal() {
        this.setState({ showMap: false });
    }

    onValueChange(type, value) {
        const state = this.state;
        state[type] = value;
        this.setState(state);
    }

    onImagesAddClick() {
        if (this.inputs.property) {
            this.inputs.property.click();
        }
        return false;
    }

    onPanoramaAddClick() {
        if (this.inputs.panorama) {
            this.inputs.panorama.click();
        }
        return false;
    }

    closeLoginModel() {
        this.setState({ showLogin: false });
    }

    showMessage(type, message) {
        const { showMessageModal } = this.props;
        showMessageModal(
            type,
            message
        );
    }

    onPicSelect(e, type) {
        e.preventDefault();

        const files = e.target.files;

        if (files.length === 0) {
            return;
        }

        const { images } = this.state;
        images[type] = files;

        this.setState({ images });
    }

    render() {
        const { images, description_map } = this.state;
        const { showMessageModal } = this.props;

        const getLocationString = () => {
            const { city, state, country, postal_code } = this.state;
            return !city ? '' : `${city}, ${state}, ${country} - ${postal_code}`;
        };

        const location = () => (
            <div>
                <div className="row">
                    <label htmlFor="geolocation" className="pa1 fl small-12 medium-3">Location <Astrik /></label>
                    <div id="geolocation" className="fr small-12 medium-9">
                        <button
                          className="small-12 medium-3  white bg-green pa2 mv2 pointer"
                          onClick={this.onShowMap}
                        >
                            Map
                        </button>
                        {
                            this.state.showMap &&
                            <GoogleMapScriptLoader>
                                <CreatePropertyMap
                                  onLocationChange={this.onLocationChange}
                                  closeModal={this.closeModal}
                                  showMessageModal={showMessageModal}
                                  latitude={this.state.latitude}
                                  longitude={this.state.longitude}
                                />
                            </GoogleMapScriptLoader>
                        }
                        <div className="mv2">
                            {getLocationString()}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <label htmlFor="street_address" className="pa1 fl small-12 medium-3">
                        Street Address <Astrik />
                    </label>
                    <div id="street_address" className="fr small-12 medium-9">
                        <Field
                          name="street_address"
                          component="input"
                          type="text"
                          placeholder="Address"
                          onChange={e => this.onValueChange('street_address', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );

        const form = () => (
            <div>
                <div className="row">
                    <label htmlFor="propertyCaption" className="pa1 fl small-12 medium-3">Property Caption <Astrik />
                    </label>
                    <div id="propertyCaption" className="fr small-12 medium-9">
                        <Field
                          name="caption"
                          component="input"
                          type="text"
                          placeholder="Property Caption"
                          onChange={e => this.onValueChange('caption', e.target.value)}
                          maxLength={propertyConfig.captionText.max}
                        />
                    </div>
                </div>

                <div className="row">
                    <label htmlFor="property-images" className="pa1 fl small-12 medium-3">Upload Photos <Astrik />
                    </label>
                    <div id="property-images" className="fr small-12 medium-9">
                        <button
                          onClick={this.onImagesAddClick}
                          className="w-25 bg-light-gray black pa2 b--gray ba pointer"
                        >Add</button>
                        <div>{images.property.length > 0 ? `${images.property.length} file selected` : ''}</div>
                        <div style={{ visibility: 'hidden' }}>
                            <input
                              type="file"
                              accept="image/*"
                              multiple="true"
                              onChange={e => this.onPicSelect(e, 'property')}
                              ref={ref => this.setRef(ref, 'property')}
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <label htmlFor="panorama_images" className="pa1 fl small-12 medium-3">Upload 360˚
                    </label>
                    <div id="panorama_images" className="fr small-12 medium-9">
                        <button
                          onClick={this.onPanoramaAddClick}
                          className="w-25 bg-light-gray black pa2 b--gray ba pointer"
                        >Add</button>
                        <div>{images.panorama.length > 0 ? `${images.panorama.length} file selected` : ''}</div>
                        <div style={{ visibility: 'hidden' }}>
                            <input
                              type="file"
                              accept="image/*"
                              multiple="true"
                              onChange={e => this.onPicSelect(e, 'panorama')}
                              ref={(ref) => { this.setRef(ref, 'panorama'); }}
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <label htmlFor="VideoLink" className="pa1 fl small-12 medium-3">Video Link
                    </label>
                    <div id="VideoLink" className="fr small-12 medium-9">
                        <Field
                          name="external_video_link"
                          component="input"
                          type="text"
                          placeholder="Video Url"
                          onChange={e => this.onValueChange('external_video_link', e.target.value)}
                        />
                    </div>
                </div>

                <div className="row">
                    <label htmlFor="HostEnail" className="pa1 fl small-12 medium-3">Host Email <Astrik />
                    </label>
                    <div id="HostEnail" className="fr small-12 medium-9">
                        <Field
                          name="hostUsername"
                          component="input"
                          type="text"
                          placeholder="Host email"
                          onChange={e => this.onValueChange('hostUsername', e.target.value)}
                        />
                    </div>
                </div>

                {location()}

                <div>
                    <div className="w-100">Description (optional)</div>
                    <div className="row">
                        <label htmlFor="PropertyUrl" className="pa1 fl small-12 medium-3">Property URL on Other platform
                        </label>
                        <div id="PropertyUrl" className="fr small-12 medium-9">
                            <Field
                              name="external_property_url"
                              component="input"
                              type="text"
                              placeholder="Property URL"
                              onChange={e => this.onValueChange('external_property_url', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <label htmlFor="PropertyUrl" className="pa1 fl small-12 medium-3">Character
                        </label>
                        <div id="PropertyUrl" className="fl small-12 medium-9">
                            <textarea
                              rows="4"
                              className="mv1 w-100 pa1 b--black-10"
                              placeholder="Character"
                              onChange={e => this.onValueChange('character', e.target.value)}
                            />
                        </div>
                    </div>

                    {
                        description_map.map(({ key, value }, i) => (
                            <DescriptionMap
                              onDescriptionChange={this.onDescriptionChange}
                              index={i}
                              key={`${key}_${i}`}
                              descKey={key}
                              descValue={value}
                              deleteKey={this.onDeleteDescription}
                            />
                        ))
                    }
                    <div className="row tc mb2">
                        <button
                          className="tc pa2 w-25 bg-green white"
                          onClick={this.onAddDescription}
                        >Add More Data</button>
                    </div>
                </div>
                <div className="f6 tl ma2 w-100"><Astrik /> indicated required fields</div>

                <button
                  type="submit"
                  className="pa2 bg-light-red ba b--light-red w-100 center tc pointer"
                  onClick={this.onSubmit}
                >Submit</button>
            </div>
        );

        const propertyCreatedEle = () => (
            <div className="bg-white ma4">
                <div className="tc f3">
                    Congratulations!! Your property successfully created.
                </div>
                <div className="tc mt1 mb5">
                    Our support team will be verifying your property details shortly.
                </div>
                <div className="tc row small-12 medium-9">
                    <Link
                      className="bg-green mv2 pa2 white small-12 medium-9"
                      to="/start-hosting"
                    >Create New Property</Link>
                </div>
            </div>
        );

        return (
            <div className="bg-white elt-max-width ma2 pa4 center">
                {
                    this.state.isLoading &&
                    <div className="fixed bg-black-20 right-0 bottom-0 top-0 left-0 text-align--center">
                        <div className="relative text-align--center" style={{ top: '50%' }}>
                            <Loader />
                        </div>
                    </div>
                }
                {
                    this.state.showLogin &&
                    <NoLoggedInUserModel
                      message="Please signin to create property"
                      isOpen
                      closeModal={this.closeLoginModel}
                    />
                }
                { this.state.propertyCreated ? propertyCreatedEle() : form() }
            </div>
        );
    }
}

// Decorate the form component
export default connect(null, {
    updateUser: ({ email }) => change('start-hosting', 'hostUsername', email),
    updateStreetAddress: streetAddress => change('start-hosting', 'street_address', streetAddress)

})(reduxForm({ form: 'start-hosting' })(StartHostingForm));

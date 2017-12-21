/* global angular window */

import moment from 'moment';
import $ from 'jquery';
import downPayment from '../services/calculateDownPayment.es6.js';
import utils from '../utils.js';
import analytics from '../lib/analytics.es6.js';

const EXPLORE = utils.EXPLORE;

/* eslint-disable no-use-before-define */

angular.module('explore').controller('ListingController', ListingController);

ListingController.$inject = [
    '$scope', '$rootScope', '$interval', '$filter', '$q',
    '$routeParams', '$timeout', '$http', '$sce', 'dataService', 'loginService',
    'ApiRequest', 'homePageService', 'ngDialog', 'getFormattedSrcset',
    'titleService', 'descriptionService', 'videoEmbedCode'
];

function ListingController(
    $scope, $rootScope, $interval, $filter, $q,
    $routeParams, $timeout, $http, $sce, dataService, loginService,
    ApiRequest, homePageService, ngDialog, getFormattedSrcset,
    titleService, descriptionService, videoEmbedCode
) {
    /* eslint-disable no-param-reassign */
    $scope.community_manager = {};
    $scope.configs = [];
    $scope.downPaymentAvailable = false;
    $scope.filter = {};
    $scope.filter.type = 1;
    $scope.getFormattedSrcset = getFormattedSrcset;
    $scope.isHomePage = false;
    $scope.isHostOrder = $routeParams.code && $routeParams.ref;
    $scope.isPartofCelebrity = false;
    $scope.isShowBackButton = false;
    $scope.listing = {};
    $scope.loveData = [];
    $scope.owner = {};
    $scope.packeageType = 1; // 1 == room, 2 == package
    $scope.paymentDetail = {};
    $scope.paymentDetail.code = '';
    $scope.paymentDetail.couponError = '';
    $scope.paymentDetail.days = 0;
    $scope.paymentDetail.discount = 0;
    $scope.paymentDetail.discountPer = 0;
    $scope.paymentDetail.exploreFee = 0;
    $scope.paymentDetail.oneDayPrice = 0;
    $scope.paymentDetail.tax = 0;
    $scope.paymentDetail.taxPercent = 2;
    $scope.paymentDetail.totalPrice = 0;
    $scope.paymentDetail.useDownPayment = false;
    $scope.posterImageAvailable = false;
    $scope.posterImageSrcSet = '';
    $scope.propImages = [];
    $scope.requestButtonText = '';
    $scope.review = [];
    $scope.showPackeageTypeTab = false;
    $scope.showReviews = {};
    $scope.showReviews.value = 3;
    $scope.surge = false;
    $scope.unavailableBookables = [];
    $scope.showAvailabilityModal = false;
    // declaration (requestedListingData) here, breaks pricing calculator
    // $scope.requestedListingData = {};

    // functions used in the view
    $scope.clickOnrequestButton = clickOnrequestButton;
    $scope.couponApply = couponApply;
    $scope.getFormattedSrcset = getFormattedSrcset;
    $scope.goToCommunity = goToCommunity;
    $scope.goToReviews = goToReviews;
    $scope.openGallery = openGallery;
    $scope.triggerPano = triggerPano;
    $scope.requestedValueUpdated = requestedValueUpdated;
    /* eslint-enable no-use-before-define */
    /* eslint-enable no-param-reassign */

    analytics.pageView({ title: 'Listing page' });

    let rzp1;

    // Get service tax
    const proConfig = dataService.getAppConfig();
    proConfig.then((value) => {
        $scope.configs = value.default_configuration;
        if (value.default_configuration.service_charge_pct) {
            $scope.paymentDetail.taxPercent = value.default_configuration.service_charge_pct;
        }
        if (value.default_configuration.check_avaialable_time_window) {
            $scope.check_avaialable_time_window = value.default_configuration.check_avaialable_time_window;
        }
        $scope.getFooterCities(value.supported_cities);
    });

    const collectLabelPolicies = (prev, curr) => {
        const next = Object.assign({}, prev);
        next[curr.name] = curr;
        next[curr.name].label = curr.name.replace(/[_-]/g, ' ').toLowerCase();
        return next;
    };

    const getPolicies = () => dataService.cancellation_policy()
              .then(policies => policies.reduce(collectLabelPolicies, {}));

    let downPaymentAvailable = false;
    const isDownPaymentAvailable = bookables =>
              bookables.some(bookable => bookable.downpayment_value_type !== 'DISABLED');


    let hostOrderUrl;
    $scope.guestDetails = null;

    const getHostOrderUrl = (code, ref) =>
              `${utils.EXPLORE.urlHelper.orders_by_host}?code=${code}&ref=${ref}`;

    /* TODO : move fetchHostOrder to dataService */
    const fetchHostOrder = (url) => {
        const deferred = $q.defer();
        $http({ url })
            .then((response) => {
                deferred.resolve(response);
            }).catch(() => {
                deferred.reject(Error({
                    message: 'Error in loading Payment Page. The link may be incorrect or expired.'
                }));
            });
        return deferred.promise;
    };

    /* TODO : move fetchGuestDetails to dataService */
    const fetchGuestDetails = (url) => {
        const deferred = $q.defer();
        $http({ url })
            .then((response) => {
                deferred.resolve(response);
            }).catch(() => {
                deferred.reject(Error({
                    message: 'Error in getting guest details'
                }));
            });
        return deferred.promise;
    };

    const setScopeLoveData = (data) => {
        $scope.loveData = [];
        $scope.loveData.push(data);
        $scope.autoFillLoveData(data);
    };

    function getHostOrder(code, ref) {
        fetchHostOrder(getHostOrderUrl(code, ref))
            .then((resp) => {
                const data = resp.data.results.length && resp.data.results[0];
                if (!data) {
                    return null;
                }
                setScopeLoveData(data);
                hostOrderUrl = data.url;
                if (data.state === 'DELETED') {
                    $scope.disableSubmit = true;
                }
                return fetchGuestDetails(data.owner);
            }).then((resp) => {
                $scope.guestDetails = resp.data;
            }).catch((error) => {
                if (error.message) {
                    $scope.showMessage(error.message);
                }
                console.log(error);
            });
    }

    function setPaymentDetails(hostOrder) {
        $scope.paymentDetail.totalPrice = parseInt(hostOrder.amount, 10);
        $scope.paymentDetail.tax = parseInt(hostOrder.fee, 10);

        $scope.paymentDetail.downPaymentTax = parseInt(hostOrder.downpayment_fee, 10);
        $scope.paymentDetail.downPayment = parseInt(hostOrder.downpayment_cost, 10);
        $scope.paymentDetail.totalDownPayment = parseInt(hostOrder.downpayment, 10);
    }

    const posterImageSrc = (listingImages, additionalPictures) => {
        const posterImage = listingImages
              .filter(imageObj => imageObj.ordering === -1).pop();

        const imageSrc = posterImage && getFormattedSrcset(
            posterImage.image,
            posterImage.image960x640,
            posterImage.image1640x1100
        );

        if (imageSrc) {
            return imageSrc;
        }

        const personPic = additionalPictures && additionalPictures[0];
        if (!personPic) {
            return null;
        }

        const small = personPic.image_custom || personPic.image;
        const medium = personPic.image_custom || personPic.image960x640;
        const large = personPic.image_custom || personPic.image1640x1100;

        return getFormattedSrcset(small, medium, large);
    };

    const setPosterImageSrcSet = () => {
        $scope.posterImageSrcSet = $scope.posterImageAvailable = posterImageSrc(
            $scope.listing.images, $scope.owner.additional_pictures
        );
    };

    let surgePrices = [];
    function getSurgePrice(nextUrl) {
        const url = nextUrl || `${EXPLORE.urlHelper.price}?property=${$scope.listing.id}`;

        const promise = ApiRequest.responseWithCredentails(url);
        promise.then((response) => {
            if (response.data.count) {
                surgePrices = surgePrices.concat(response.data.results);
            }

            if (response.data.next) {
                getSurgePrice(response.data.next);
            }
        });
    }

    function getSurgeDays(surgeFrom, surgeUntil, requestedFrom, requestedUntil) {
        if (surgeFrom.toDate() > requestedUntil.toDate() ||
            surgeUntil.toDate() < requestedFrom.toDate()) {
            return 0;
        }
        const startDate = surgeFrom.toDate() >= requestedFrom.toDate()
                ? surgeFrom : requestedFrom;

        const endDate = surgeUntil.toDate() <= requestedUntil.add(-1, 'days').toDate()
                ? surgeUntil : requestedUntil;

        return endDate.diff(startDate, 'days') + 1;
    }

    const fetchPropertyById = propertyId => dataService.getPropertyWithCode(propertyId)
        .then((value) => {
            if (typeof value !== 'object' || !value.results.length) {
                return null;
            }
            return value.results[0];
        });

    const getEnabledBookables = bookableItems =>
        bookableItems.filter(item => item.status === 'ENABLED');

    const getRatingStars = ratingScore => '★ '.repeat(ratingScore).trim();

    const defaultBookableItemsValues = bookableItems =>
        bookableItems.map((item) => {
            item.price = 0;
            // selected extra person
            item.extra_guests = 0;
            // how many extra person in one instances
            item.max_number_of_extra_person = 0;
            item.showExtraPerson = false;

            const numberOfGuests = parseInt(item.no_of_guests, 10);
            const maxGuests = parseInt(item.max_guests, 10);
            if (numberOfGuests < maxGuests) {
                item.showExtraPerson = true;
                item.max_number_of_extra_person = maxGuests - numberOfGuests;
            }

            item.showPrice = 0;
            item.packeageType = getPackageType(item.type);
            return item;
        });

    const getItemTypes = (bookableItems) => {
        const types = new Set(bookableItems.map(item => item.type));
        return [...types];
    };

    const fallbackImages = (listingImages) => {
        const noImage1640x1100 = listingImages.some(image => !image.image1640x1100);
        const noImage960x640 = listingImages.some(image => !image.image960x640);

        let resettedImages = listingImages;
        if (noImage1640x1100) {
            resettedImages = resettedImages.map((image) => {
                image.image1640x1100 = image.image;
                return image;
            });
        }

        if (noImage960x640) {
            resettedImages = resettedImages.map((image) => {
                image.image960x640 = image.image;
                return image;
            });
        }

        return resettedImages;
    };

    const getProcessedPropertyValue = (id) =>
        fetchPropertyById(id).then((property) => {
            if (!property) {
                return null;
            }
            // convert bookable_items to an array from of an object whose all keys are numbers
            property.bookable_items = Object.values(property.bookable_items);
            property.bookable_items = getEnabledBookables(property.bookable_items);
            property.bookable_items = defaultBookableItemsValues(property.bookable_items);
            property.startRating = getRatingStars(parseFloat(property.rating_score));
            property.images = fallbackImages(property.images);
            return property;
        });

    const setOtherValsBasedOnProperty = (property) => {
        titleService.setTitle(`${property.caption} | ${property.city}`, $scope);
        descriptionService.setDescription(property.character, $scope);

        $scope.getDetailOfOwner(property.owner);
        $scope.getDetailOfManager(property.community_manager);

        if (parseInt(property.number_of_reviews, 10) > 0) {
            $scope.getReview(property.id);
        }

        if (property.category) {
            $scope.groups = property.category.split(',');
            $scope.getDetailOfGroups($scope.groups);
        }

        $scope.quote = property.description_map ?
            getPropertyRole(Object.values(property.description_map), 'Quote') : '';

        const type = getItemTypes(property.bookable_items);
        if (type.length === 2) {
            $scope.showPackeageTypeTab = true;
            $scope.packeageType = 1;
        } else {
            $scope.showPackeageTypeTab = false;
            if (type[0] === 'PACKAGE') {
                $scope.packeageType = 2;
            }
        }

        if (property.videos.length && property.videos[0].external_video_link) {
            const embedCode = videoEmbedCode.get(property.videos[0].external_video_link,
                                                 '" style="width: 100%; min-height: 280px;"');
            $('#sidebar-video').html(embedCode);
        }

        if (property.config['default_date']) {
            const default_date = convertDateFormat(property.config['default_date'],
                                                   'YYYY-MM-DD', 'DD/MM/YYYY');
            $scope.requestedListingData.date_from = default_date;
        } else {
            utils.setDatePicker(parseInt($scope.configs.advance_booking_days, 10));
        }

        downPaymentAvailable = isDownPaymentAvailable(property.bookable_items);

        $scope.panoramaImages = property.panoramic_images.map(img => ({ image: img.image, id: img.id, panorama: true }));

        $scope.propImages = property.images.filter(image => image.ordering !== -1).concat($scope.panoramaImages);

        if ($scope.panoramaImages.length) {
            $scope.panorama = true;
        }

    };

    function getValuesOfProperty(id) {
        getProcessedPropertyValue(id).then((property) => {
            if (!property) {
                console.log('Error getting property value');
                return null;
            }

            $scope.listing = property;
            if (!$scope.requestedListingData) {
                $scope.initialiseRequestedData();
            }

            setOtherValsBasedOnProperty(property);
            getSurgePrice();
            if ($rootScope.alreadyLogin === 1 && !$scope.isHostOrder) {
                $scope.checkIfExistingLovePresent();
            }

            if ($scope.isHostOrder) {
                getHostOrder($routeParams.code, $routeParams.ref);
            }

            getPolicies().then((policies) => {
                $scope.cancellationPolicy = policies[$scope.listing.cancellation_policy].details;
            });

            window.eltInit($('*[data-init]').toArray());
        }).catch((e) => {
            console.log('Error getting Property value');
        });
    }

    $scope.filter.code = $routeParams.propCode;
    getValuesOfProperty($scope.filter.code);

    const getPropertyRoleValue = (obj, targetKey) => {
        if (Object.keys(obj).some(key => key === targetKey)) {
            return obj[targetKey].trim();
        }
        return null;
    };

    $rootScope.closePannellum = function() {
      $('#pano > .window > iframe').attr('src', '');
      $('#pano').removeClass('open');
    };

    $rootScope.viewPano = function(src) {
      $('#pano').addClass('open');
      const newSrc = window.location.origin+'/public/pannellum.htm?' +
              `panorama=${src}&autoLoad=true`;
      $('#pano > .window > iframe').attr('src', newSrc);
    };

    function triggerPano(image) {
      if(image.image) {
        $rootScope.viewPano(image.image);
      }
    }


    const getPropertyRole = (values, targetKey) =>
        values.reduce((curr, obj) => getPropertyRoleValue(obj, targetKey) || curr, null);

    const fetchDetailOfOwner = url => ApiRequest.responseWithCredentails(url)
        .then(({ data }) => {
            const owner = Object.assign({}, data);
            owner.picture = owner.picture || `${owner.social_profile_picture}?width=200&height=200`;

            const descMap = owner.details && owner.details.description_map;
            if (!descMap) {
                return owner;
            }

            const descMapValues = Object.values(descMap);
            owner.extraInfo = getPropertyRole(descMapValues, 'property_info');
            owner.celebrity_role = getPropertyRole(descMapValues, 'celebrity_role');
            owner.celebrity_apartment = getPropertyRole(descMapValues, 'celebrity_apartment');
            return owner;
        })
        .catch((e) => {
            console.log('Error fetching detailOfOwner. ', e);
        });

    const validGroups = (footerGroups, ownerGroups) => {
        const footerGroupNames = footerGroups.map(group => group.name);
        const validNames = ownerGroups.filter(group => footerGroupNames.find(g => g === group));
        if (validNames.length === 0) {
            return '';
        }
        // seperate all names by comma, end the last one with an "and".
        return validNames.reduce((acc, curr, i, arr) => {
            if (i === arr.length - 1) {
                return `${acc}, and ${curr}`;
            }
            return `${acc}, ${curr}`;
        });
    };

    $scope.getDetailOfOwner = url => fetchDetailOfOwner(url)
        .then((owner) => {
            $scope.owner = owner;
            setPosterImageSrcSet();
            const groupInterval = $interval(() => {
                if ($rootScope.footerGroups) {
                    $scope.owner.groups = validGroups($rootScope.footerGroups, owner.groups_joined);
                    $interval.cancel(groupInterval);
                }
            });
        });

    const fetchDetailOfManager = url => ApiRequest.responseWithCredentails(url)
        .then(({ data }) => {
            if (!data) {
                return null;
            }

            const descMap = data.details && data.details.description_map;

            data.picture = data.picture || `${data.social_profile_picture}?width=200&height=200`;

            // One of the objects has 'property_role', which we need below.
            data.extraInfo = descMap && getPropertyRole(Object.values(descMap), 'property_role');
            return data;
        })
        .catch((e) => {
            console.log('detailsOfManager fetch error', e);
        });


    $scope.getDetailOfManager = url => fetchDetailOfManager(url)
        .then((manager) => {
            $scope.community_manager = manager;
        });

    const fetchGroupsDetails = groups => Promise.all(
        groups.map(homePageService.getGroupData)
    );

    $scope.getDetailOfGroups = groups => {

        fetchGroupsDetails(groups).then((groupsData) => {
            $scope.allGroups = groupsData.map(val => val.count && val.results[0])
                .filter(val => val && val.status.toLowerCase() === 'published');
        });
    };

    $scope.allUsers = [];
    $scope.getUserInfo = (url) => {
        if ($scope.allUsers.indexOf(url) === -1) {
            dataService.getValueFromUrlWithKey(url)
                .then((value) => {
                    $scope.allUsers[value.url] = value;
                });
        }
    };

    const fetchReviewById = propertyId => dataService.getReviewForProperty(propertyId);
    const fetchReviewByUrl = url => dataService.getValueFromUrl(url);

    const reviewsWithFixedImage = reviews => reviews.map(review => {
        review.author_social_picture = review.author_social_picture &&
                `${review.author_social_picture}?width=200&height=200`;
        return review;
    });

    $scope.getReview = (property, fetchType = 'id') => {
        const fetchMethod = fetchType === 'id' ? fetchReviewById : fetchReviewByUrl;
        fetchMethod(property)
            .then(response => {
                const reviews = reviewsWithFixedImage(response.results);
                $scope.review = $scope.review.concat(reviews);
                if (response.next) {
                    $scope.getReview(response.next, 'url');
                }
            });
    };

    // Open map in new window
    $scope.openInNewWindow = function() {
        const url = `https://maps.google.com/maps?q=${$scope.listing.latitude},` +
                    `${$scope.listing.longitude}(${$scope.listing.caption})&iwloc=A&hl=es`;
        window.open(url);
    };

    $scope.goToBack = function() {
        window.history.back();
    };
    /* if ($rootScope.previous_page) {
      backUrl = $rootScope.previous_page;
      $rootScope.previous_page = "";
      $scope.isShowBackButton = true;
      }*/

    if (window.history.length > 1) {
        $scope.isShowBackButton = true;
    } else {
        $scope.isShowBackButton = false;
    }

    function goToCommunity(name) {
        window.location.href = `/community/${name}`;
    }

    let GallaryOpened = false;
    const lightGalleryImages = (listingImages) =>
        listingImages.map((listingImage) => {
            const image = {};
            image.src = listingImage.image960x640 || listingImage.image;
            image.thumb = listingImage.image960x640 || listingImage.image;
            image.subHtml = listingImage.caption;
            return image;
        });

    // open gallary
    function openGallery(listingImages, ind) {
        const galleryImages = lightGalleryImages(listingImages);

        const $cl = window.$(this).lightGallery({
            dynamic: true,
            dynamicEl: galleryImages

        });

        $cl.on('onAfterOpen.lg', () => {
            if ($cl.data('lightGallery'))
                $cl.data('lightGallery').slide(ind);
        });

        $cl.on('onCloseAfter.lg', () => {
            if ($cl.data('lightGallery'))
                $cl.data('lightGallery').destroy(true);
            $cl.off('onCloseAfter.lg');
        });

        GallaryOpened = true;
        $scope.$on('$routeChangeStart', () => {
            if (GallaryOpened) {
                $('.lg-close').click();
                GallaryOpened = false;
            }
        });
    }

    // booking section
    $scope.filter = {};
    $scope.filter.selectedCheckIN = '';
    $scope.filter.selectedCheckOUT = '';

    $scope.$watch('[requestedListingData.date_from,requestedListingData.date_until]', (newValue) => {
        if ($scope.requestedListingData && (newValue[0] || newValue[1])) {
            $scope.requestedListingData.date_from = newValue[0];
            $scope.requestedListingData.date_until = newValue[1];
            $scope.requestedValueUpdated();
            showDownPaymentOption();
        }
    });

    function displaySurgeData() {
        if (!$scope.requestedListingData.date_from ||
            ($scope.packeageType === 1 && !$scope.requestedListingData.date_from)) {
            return;
        }

        $scope.surge = surgeApplicable();
        setSurgeDisplayData();

        function surgeApplicable() {
            return surgePrices.some(overlaps);
        }

        function setSurgeDisplayData() {
            angular.forEach($scope.requestedListingData.bookables, setSurgeData);

            function setSurgeData(bookable) {
                bookable.surgeData = [];
                bookable.surge = false;

                if (!bookable.requested) {
                    return;
                }

                let date = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY');
                const endDate = moment($scope.requestedListingData.date_until, 'DD/MM/YYYY');

                surgePrices.forEach(display);

                if (endDate.diff(date) !== 0 && bookable.surgeData.length) {
                    const price = bookable.daily_price;
                    const dateRange = `${date.format('MMM DD')} to ${endDate.format('MMM DD')}`;

                    bookable.surgeData.push({ dateRange, price });
                }

                function display(surgePrice) {
                    if (surgePrice.bookable_item !== bookable.url) {
                        return;
                    }

                    const surgeStart = moment(surgePrice.date_from, 'YYYY-MM-DD');
                    const surgeEnd = moment(surgePrice.date_until, 'YYYY-MM-DD');

                    let price;
                    let dateRange;
                    let dateUntil;

                    if (!(date.isBetween(surgeStart, surgeEnd, null, '[]') ||
                        endDate.isBetween(surgeStart, surgeEnd, null, '[]') ||
                        surgeStart.isBetween(date, endDate))) {
                        return;
                    }


                    if (date.isBetween(surgeStart, surgeEnd, null, '[]')) {
                        price = bookable.daily_price + surgePrice.price_delta;

                        dateUntil = endDate.diff(surgeEnd, 'days') > 0 ?
                            surgeEnd : endDate;

                        addToSurgeData();

                        bookable.surge = true;
                    } else if (surgeStart.isBetween(date, endDate, null, '[]')) {
                        price = bookable.daily_price;

                        dateUntil = moment(surgeStart).add(-1, 'days');

                        addToSurgeData();

                        date = surgeStart;

                        price = bookable.daily_price + surgePrice.price_delta;

                        dateUntil = endDate.diff(surgeEnd, 'days') > 0 ?
                            surgeEnd : endDate;

                        addToSurgeData();

                        bookable.surge = true;
                    }

                    date = dateUntil.add(1, 'days');

                    function addToSurgeData() {
                        if (date.diff(dateUntil) === 0) {
                            dateRange = dateUntil.format('MMM DD');
                        } else {
                            dateRange = `${date.format('MMM DD')} to ${dateUntil.format('MMM DD')}`;
                        }

                        bookable.surgeData.push({ dateRange, price });
                    }
                }
            }
        }

        function overlaps(surgePrice) {
            let overlaps = false;

            const surgeStart = moment(surgePrice.date_from, 'YYYY-MM-DD');
            const surgeEnd = moment(surgePrice.date_until, 'YYYY-MM-DD');

            const requestStart = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY');
            const requestEnd = moment($scope.requestedListingData.date_until, 'DD/MM/YYYY');

            if (surgeStart.isBetween(requestStart, requestEnd, null, '[]') ||
                surgeEnd.isBetween(requestStart, requestEnd, null, '[]')) {
                if ($scope.requestedListingData.bookables[surgePrice.bookable_item].requested) {
                    overlaps = true;
                }
            }

            return overlaps;
        }
    }

    const getSurgeCost = (bookable, surgePriceList, requestedListingData) =>
        surgePriceList.reduce((acc, curr) => {
            if (bookable.url !== curr.bookable_item) {
                return acc;
            }
            const surgeFrom = moment(curr.date_from, 'YYYY-MM-DD');
            const surgeUntil = moment(curr.date_until, 'YYYY-MM-DD');
            const requestedFrom = moment(requestedListingData.date_from, 'DD/MM/YYYY');
            const requestedUntil = moment(requestedListingData.date_until, 'DD/MM/YYYY');

            const surgeDays = getSurgeDays(surgeFrom, surgeUntil, requestedFrom, requestedUntil);
            return acc + (curr.price_delta * surgeDays);
        }, 0);

    function showDownPaymentOption() {
        function downPaymentSetByHost(hostOrder, isHostOrder) {
            return (isHostOrder && (parseInt(hostOrder.amount, 10) !== parseInt(hostOrder.downpayment, 10)));
        }

        // downpayment set by host overrides client side calculation
        // also select downpayment option by default for hostOrder
        if (downPaymentSetByHost($scope.loveData[0], $scope.isHostOrder)) {
            $scope.downPaymentAvailable = true;
            $scope.paymentDetail.useDownPayment = true;
            return;
        }

        const paymentDetail = $scope.paymentDetail;

        const bookableWithDownPaymentSelected = function() {
            let selected = false;
            angular.forEach($scope.requestedListingData.bookables, (bookable) => {
                if (bookable.requested > 0) {
                    $scope.listing.bookable_items.forEach((bookableItem) => {
                        if (bookableItem.url === bookable.url) {
                            if (bookableItem.downpayment_value_type !== 'DISABLED') {
                                selected = true;
                            }
                        }
                    });
                }
            });

            $scope.downPaymentAvailable = selected;
            return selected;
        };

        if (downPaymentAvailable && bookableWithDownPaymentSelected()) {
            paymentDetail.downPayment = downPayment($scope.packeageType, $scope.requestedListingData, $scope.listing.bookable_items);
            paymentDetail.exploreFee = getExploreFee();

            // set payment gateway fees for downpayment
            paymentDetail.downPaymentTax = Math.round((paymentDetail.downPayment +
                paymentDetail.exploreFee) * paymentDetail.taxPercent / 100);

            paymentDetail.totalDownPayment = Math.round(paymentDetail.downPayment + paymentDetail.downPaymentTax +
                paymentDetail.exploreFee);

            if ($scope.paymentDetail.totalPrice < paymentDetail.downPayment) {
                paymentDetail.downPayment = paymentDetail.totalPrice - paymentDetail.tax;
                paymentDetail.downPaymentTax = paymentDetail.tax;
                paymentDetail.totalDownPayment = paymentDetail.totalPrice;
            }

            if ($scope.isHostOrder) {
                setPaymentDetails($scope.loveData[0]);
            }
        }
    }

    function requestedValueUpdated(urlKey) {
        if (urlKey) {
            const currentBookable = $scope.requestedListingData.bookables[urlKey];
            if (currentBookable && currentBookable.requested === 0) {
                currentBookable.extra_guests = 0;
            }

            if (currentBookable.max_extra_guest && currentBookable.max_extra_guest > 0 && currentBookable.extra_guests && currentBookable.extra_guests > (currentBookable.max_extra_guest * currentBookable.requested)) {
                currentBookable.extra_guests = 0;
            }
        }

        $scope.showTotalPrice();
        displaySurgeData();

        if (checkDateSubSet($scope.loveData, $scope.requestedListingData) &&
            $scope.checkBookabeSubSet() &&
            isInsideTimeWindow($scope.loveData, $scope.check_avaialable_time_window)) {
            $scope.requestButtonText = 'Book Now';
            $scope.availabilityChecked = 1;
            showDownPaymentOption();
        } else {
            if (checkDateSetSame($scope.loveData, $scope.requestedListingData) && $scope.checkBookabeSetSame()) {
                if ($scope.loveData[0].state === 'NOTIFICATION_SENT') {
                    // hack to get statup tour request video working
                    if ($scope.listing.code === 'startuptour' && $scope.listing.config['default_date']) {
                        $scope.requestButtonText = 'Video Request Sent';
                    } else if ($scope.listing.code === 'startuptour2') {
                        $scope.requestButtonText = 'Application Sent';
                    } else {
                        $scope.requestButtonText = 'Notification Sent';
                        $scope.availabilityChecked = 0;
                    }
                } else if ($scope.loveData[0].state === 'HOST_REJECTED') {
                    $scope.requestButtonText = 'Not Accepted';
                    $scope.availabilityChecked = 0;
                } else {
                    if ($scope.loveData[0].state === 'PAYMENT_PENDING') {
                        $scope.requestButtonText = 'Pay Now';
                        $scope.availabilityChecked = 1;
                    } else if ($scope.loveData[0].state === 'PAYMENT_CONFIRMED') {
                        $scope.requestButtonText = 'Booking Completed';
                        $scope.availabilityChecked = 1;
                    } else if ($scope.loveData[0].state === 'DELETED') {
                        $scope.requestButtonText = 'Link Expired';
                    } else {
                        $scope.requestButtonText = 'Check availability';
                        $scope.availabilityChecked = 0;
                    }
                }
            } else {
                // hack to get statup tour request video working
                if ($scope.listing.code === 'startuptour' && $scope.listing.config['default_date']) {
                    $scope.requestButtonText = 'Request Video';
                } else if ($scope.listing.code === 'startuptour2') {
                    $scope.requestButtonText = 'Apply for Free';
                } else {
                    $scope.requestButtonText = 'Check availability';
                }
                $scope.availabilityChecked = 0;

                // hide downpayment section of sidebar as values are stale
                $scope.downPaymentAvailable = false;
            }
        }
    }

    const isInsideTimeWindow = (loveData, checkAvaialableTimeWindow) => {
        if (!loveData || !loveData[0] || loveData[0].state !== 'ACCEPTED') {
            return false;
        }

        const quantity = Object.values(loveData[0].quantity_map)[0];
        if (!quantity) {
            return false;
        }

        const acceptedTime = quantity.time_accepted || quantity.time_checked;
        if (!acceptedTime) {
            return false;
        }

        let loveAcceptedTime = getLocalDate(acceptedTime, 'yyyy-MM-dd HH:mm:ss', 'local');

        loveAcceptedTime = moment(loveAcceptedTime, 'YYYY-MM-DD HH:mm:ss').toDate();
        const currentTime = moment().toDate();

        let timeDiffInHour = Math.abs(currentTime.getTime() - loveAcceptedTime.getTime());
        timeDiffInHour = Math.ceil(timeDiffInHour / (1000 * 60 * 60));

        return timeDiffInHour <= parseInt(checkAvaialableTimeWindow, 10);
    };

    const getTime = (dt, fmt) => moment(dt, fmt);
    const getDates = (loveData, requestedListingData) => {
        const data = loveData && loveData[0];
        /* check if valid dates are available below */
        if (!data.date_from || !data.date_until ||
            !requestedListingData.date_from || !requestedListingData.date_until) {
            return false;
        }

        const loveDateFrom = getTime(data.date_from, 'YYYY-MM-DD');
        const loveDateUntil = getTime(data.date_until, 'YYYY-MM-DD');
        const userDateFrom = getTime(requestedListingData.date_from, 'DD/MM/YYYY');
        const userDateUntil = getTime(requestedListingData.date_until, 'DD/MM/YYYY');
        return { loveDateFrom, loveDateUntil, userDateFrom, userDateUntil };
    };

    const checkDateSubSet = (loveData, requestedListingData) => {
        const data = loveData && loveData[0];
        if (!data || data.state !== 'ACCEPTED') {
            return false;
        }
        const { loveDateFrom, loveDateUntil, userDateFrom, userDateUntil } = getDates(loveData, requestedListingData);
        return loveDateFrom &&
            userDateFrom.isBetween(loveDateFrom, loveDateUntil, null, '[]') &&
            userDateUntil.isBetween(loveDateFrom, loveDateUntil, null, '[]');
    };

    const checkDateSetSame = (loveData, requestedListingData) => {
        const data = loveData && loveData[0];
        if (!data || data.state === 'INITIAL_STATE') {
            return false;
        }
        const { loveDateFrom, loveDateUntil, userDateFrom, userDateUntil } = getDates(loveData, requestedListingData);
        return loveDateFrom &&
            userDateFrom.isSame(loveDateFrom) && userDateUntil.isSame(loveDateUntil);
    };

    const checkBookableSet = (bookables, loveData, cmp) => {
        return Object.entries(bookables).every(([url, bookableSelected]) => {
            const bookableObj = loveData[0].quantity_map[url];

            // for checking bookables subset
            if (bookableObj &&
                (cmp(bookableObj.requested, bookableSelected.requested) ||
                 bookableSelected.requested === 0)) {
                return false;
            }

            if (!bookableObj && bookableSelected.requested > 0) {
                return false;
            }

            if (bookableObj &&
                bookableObj.extra_guests &&
                (cmp(bookableObj.extra_guests, bookableSelected.extra_guests) ||
                 bookableSelected.extra_guests === 0)) {
                return false;
            }

            if (bookableObj && !bookableObj.extra_guests &&
                bookableSelected.extra_guests > 0) {
                return false;
            }

            if (!bookableObj && bookableSelected.extra_guests > 0) {
                return false;
            }
            return true;
        });
    };

    $scope.checkBookabeSubSet = function() {
        if (!$scope.loveData || !$scope.loveData[0] || !$scope.loveData[0].state === 'ACCEPTED') {
            return false;
        }

        if ($scope.loveData[0].quantity_map.length !== $scope.requestedListingData.bookables.length) {
            return true;
        }
        return checkBookableSet($scope.requestedListingData.bookables, $scope.loveData, (a, b) => a < b);
    };

    $scope.checkBookabeSetSame = function() {
        if (!$scope.loveData || !$scope.loveData[0] || $scope.loveData[0].state === 'INITIAL_STATE') {
            return false;
        }

        if ($scope.loveData[0].quantity_map.length !== $scope.requestedListingData.bookables.length) {
            return true;
        }
        return checkBookableSet($scope.requestedListingData.bookables, $scope.loveData, (a, b) => a !== b);
    };

    const exploreFeeForAllBookables = (bookables, reqListingData, bookingDays) => {
        const requestedQuantity = (bookableUrl, requestedBookables) => {
            const bookable = Object.values(requestedBookables).filter(b => b.url === bookableUrl);
            return bookable ? bookable[0].requested : 0;
        };
        return bookables.reduce((total, bookable) => {
            const requested = requestedQuantity(bookable.url, reqListingData.bookables);

            switch (bookable.explore_fee_type) {
            case 'DISABLED':
                return total;

            case 'AMOUNT':
                return total + (bookingDays * bookable.explore_fee * requested);

            case 'PERCENT':
                const surgeCost = getSurgeCost(bookable, surgePrices, $scope.requestedListingData);
                return total + ((bookingDays * bookable.daily_price + surgeCost) *
                                bookable.explore_fee / 100 * requested);
            default:
                return total;
            }
        }, 0);
    };

    const getExploreFee = function() {
        const calculateClientSide = function() {
            const { date_from, date_until } = $scope.requestedListingData;
            let bookingDays = totalBookingDays($scope.packeageType, date_from, date_until);

            const total = exploreFeeForAllBookables(
                $scope.listing.bookable_items, $scope.requestedListingData, bookingDays
            );

            return Math.round(total);
        };

        return calculateClientSide();
    };

    let totalPriceForDiscount;
    let couponDiscount = 0;

    const totalBookingDays = (packageType, dateFrom, dateUntil) => {
        if (packageType === 1 && dateFrom && dateUntil) {
            const from = moment(dateFrom, 'DD/MM/YYYY').toDate();
            const until = moment(dateUntil, 'DD/MM/YYYY').toDate();
            return dayDifference(from, until);
        }

        if (packageType !== 1 && dateFrom) {
            return 1;
        }

        return 0;
    };

    const totalPropertyPrice = (bookingDays, surgePriceList, bookables, requestedListingData) =>
        bookables.reduce((totalPrice, bookable) => {
            if (!(bookable.requested > 0)) {
                return totalPrice;
            }

            const extraPersonCharge = bookable.extra_guests ?
                    bookingDays * (bookable.extra_person_charge * bookable.extra_guests) : 0;

            const surgeCost = getSurgeCost(bookable, surgePriceList, requestedListingData);
            const bookableTotalPrice = (bookable.daily_price * bookingDays * bookable.requested);
            return (totalPrice + bookableTotalPrice + surgeCost + extraPersonCharge);
        }, 0);

    $scope.showTotalPrice = () => {
        let bookingDays = 1;
        let dateValid = false;

        dateValid = bookingDays = totalBookingDays(
            $scope.packeageType,
            $scope.requestedListingData.date_from,
            $scope.requestedListingData.date_until
        );

        if (dateValid) {
            const bookables = Object.values($scope.requestedListingData.bookables) || [];
            const propertyTotalPrice = totalPropertyPrice(
                bookingDays, surgePrices,
                bookables, $scope.requestedListingData);

            $scope.paymentDetail.days = bookingDays;
            const exploreFee = getExploreFee();
            totalPriceForDiscount = $scope.paymentDetail.totalPrice = propertyTotalPrice;
            $scope.paymentDetail.exploreFee = exploreFee;
            $scope.paymentDetail.oneDayPrice = propertyTotalPrice / $scope.paymentDetail.days;
            $scope.paymentDetail.totalPrice = $scope.paymentDetail.totalPrice > couponDiscount ?
                $scope.paymentDetail.totalPrice - couponDiscount : 0;
            $scope.paymentDetail.totalPrice += exploreFee;
            $scope.paymentDetail.tax = $scope.paymentDetail.totalPrice * $scope.paymentDetail.taxPercent / 100;
            $scope.paymentDetail.tax = Math.round(parseFloat($scope.paymentDetail.tax.toFixed(2)));
            $scope.paymentDetail.totalPrice += $scope.paymentDetail.tax;
        }

        if ($scope.isHostOrder) {
            setPaymentDetails($scope.loveData[0]);
        }
    };

    $scope.loveProperty = function() {
        if (!$rootScope.alreadyLogin) {
            $scope.doLogin();
            return;
        }

        // disable check until modal is fixed
        // if (!utils.userRequiredFieldsPresent($rootScope.userDetails)) {
        // $('#extrainfo-modal').addClass('open');
        // return;
        // }

        if (!$scope.IsMemberBookingListing()) {
            return;
        }

        if (!$scope.checkAllFieldsPresent()) {
            return;
        }

        const minStayError = checkMinStay($scope.listing.bookable_items, $scope.requestedListingData);
        if (minStayError) {
            $scope.showMessage(minStayError);
            return;
        }

        if (!$scope.checkLoveDataSame()) {
            if ($scope.loveData.length) {
                confirmRequestModification();
                return;
            }

            if ($scope.listing.instabook) {
                $scope.doCheckAvailable();
                return;
            }

            const msg = 'Please provide some details about yourself that would help the ' +
                  'host to accept your reservation.';
            $scope.showMessage(msg, (inputValue) => {
                if (inputValue === false)
                    return false;
                if (inputValue !== '') {
                    $scope.requestedListingData.visitor_message = inputValue;
                    $scope.doCheckAvailable();
                }
            });

            return;
        }

        if ($scope.loveData[0].state === 'NOTIFICATION_SENT') {
            $scope.showMessage('Notification already sent to Host');
        } else if ($scope.loveData[0].state === 'HOST_REJECTED') {
            let message = 'Host has not accepted your request';

            if ($scope.loveData && $scope.loveData[0].host_message) {
                message = 'Host has not accepted your request. ' +
                    `Message from Host : ${$scope.loveData[0].host_message}`;
            }

            $scope.showMessage(message);
        }
    };

    $scope.checkIfExistingLovePresent = function() {
        const pastLove = dateUntil => dateUntil.isBefore(moment(), 'days');
        const promise = dataService.getAllLoveProperty();
        promise.then((value) => {
            $scope.loveData = [];
            let flag = 0;
            angular.forEach(value.results, (loopVal) => {
                if (loopVal.property_details.url === $scope.listing.url) {
                    flag = 1;
                    $scope.loveUrl = loopVal.url;

                    if (!pastLove(moment(loopVal.date_until, 'YYYY-MM-DD'))) {
                        $scope.loveData.push(loopVal);
                    }
                }
            });

            if (value.next && flag === 0) {
                $scope.getUserLove(value.next);
            } else {
                if ($scope.loveData.length > 0) {
                    $scope.autoFillLoveData(JSON.parse(JSON.stringify($scope.loveData[0])));
                } else {
                    $scope.initialiseRequestedData();
                }
            }
        });
    };

    const getBookableExploreFee = (bookables) => {
        switch (bookables.explore_fee_type) {
        case 'DISABLED':
            return 0;

        case 'PERCENT':
            return (bookables.daily_price * bookables.explore_fee) / 100;

        case 'AMOUNT':
            return bookables.explore_fee;

        default:
            return 0;
        }
    };

    const structureRequestedData = bookables =>
        bookables.reduce((reqListingData, bookable) => {
            const extraGuestValue = bookable.max_guests - bookable.no_of_guests;
            const exploreFee = getBookableExploreFee(bookable);
            const defaultValue = {
                requested: 0,
                packageType: getPackageType(bookable.type),
                daily_price: bookable.daily_price,
                max_extra_guest: extraGuestValue,
                extra_person_charge: bookable.guest_charge,
                extra_person_requested: 0,
                downpayment_value_type: bookable.downpayment_value_type,
                downpayment_value: bookable.downpayment_value,
                explore_fee_type: bookable.explore_fee_type,
                // calculated explore fee is what is calculated client side
                // and is for 1 instance and 1 day, exploreFee is recieved
                // from the server and is total exploreFee for the booking
                calculated_explore_fee: exploreFee,
                url: bookable.url,
                extra_guests: 0
            };
            reqListingData[bookable.url] = defaultValue;
            return reqListingData;
        }, {});

    $scope.initialiseRequestedData = () => {
        if ($scope.listing.bookable_items && !$scope.requestedListingData) {
            $scope.requestedListingData = {};
            $scope.requestedListingData.bookables = structureRequestedData($scope.listing.bookable_items);

            $scope.requestedListingData.date_from = $scope.requestedListingData.date_from || '';
            $scope.requestedListingData.date_until = $scope.requestedListingData.date_until || '';
        }
    };

    const requestedListingDataBookables = (quantityMap, bookableItems) =>
        Object.entries(quantityMap).reduce((listingDataBookables, [url, val]) => {
            const bookable = Object.assign({ url }, val);
            const bookableItem = bookableItems.find(item => item.url === url);
            if (!bookableItem) {
                return listingDataBookables;
            }

            bookable.daily_price = bookableItem.daily_price;
            bookable.packageType = getPackageType(bookableItem.type);
            bookable.extra_person_charge = bookableItem.guest_charge;
            bookable.max_extra_guest = bookableItem.max_guests - bookableItem.no_of_guests;
            bookable.extra_guests = bookable.extra_guests ? bookable.extra_guests : 0;

            listingDataBookables[url] = bookable;

            return listingDataBookables;
        }, {});

    const getRequestButtonText = (state) => {
        const stateToButtonText = {
            ACCEPTED: 'Book Now',
            PAYMENT_PENDING: 'Pay Now',
            PAYMENT_CONFIRMED: 'Booking Completed',
            HOST_REJECTED: 'Not Accepted',
            NOTIFICATION_SENT: 'Notification Sent',
            DELETED: 'Link Expired'
        };
        return state in stateToButtonText ? stateToButtonText[state] : '';
    };

    $scope.autoFillLoveData = function(loveValue) {
        if (!$scope.requestedListingData) {
            $scope.requestedListingData = {};
            $scope.requestedListingData.bookables = {};
        }

        if (!loveValue || !loveValue.quantity_map) {
            $scope.initialiseRequestedData();
            return null;
        }

        $scope.loveUrl = loveValue.url;
        const bookables = requestedListingDataBookables(loveValue.quantity_map, $scope.listing.bookable_items);
        Object.assign($scope.requestedListingData.bookables, bookables);

        if (loveValue.date_from) {
            $scope.requestedListingData.date_from = convertDateFormat(
                loveValue.date_from, 'YYYY-MM-DD', 'DD/MM/YYYY'
            );
        }
        if (loveValue.date_until) {
            $scope.requestedListingData.date_until = convertDateFormat(
                loveValue.date_until, 'YYYY-MM-DD', 'DD/MM/YYYY'
            );
        }

        if (!$scope.listing.config.default_date) {
            const advanceBookingDays = parseInt($scope.configs.advance_booking_days, 10);
            const dateFrom = $scope.requestedListingData.date_from;
            if ($scope.packeageType === 2) {
                utils.setDatePicker(advanceBookingDays, dateFrom);
            } else {
                utils.setDatePicker(advanceBookingDays, dateFrom, $scope.requestedListingData.date_until);
            }
        }

        $scope.requestButtonText = getRequestButtonText(loveValue.state);
        if (loveValue.state === 'ACCEPTED') {
            $scope.availabilityChecked = 1;
        }

        displaySurgeData();

    };

    $scope.checkAllFieldsPresent = function() {
        if (!$scope.requestedListingData) {
            $scope.showMessage('Internal error, please refresh the page and continue');
            return false;
        }

        const { bookables, date_from, date_until } = $scope.requestedListingData;

        const listingDataDateFrom = moment(date_from, 'DD/MM/YYYY');
        const nowTemp = new Date();
        const currentDate = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
        const isTodayCheckIn = listingDataDateFrom.valueOf() === currentDate.getTime();
        const checkInDate = listingDataDateFrom.toDate();
        const isPastCheckInDate = checkInDate < currentDate;

        // hack to get statup tour request video working
        if ($scope.packeageType !== 1 &&
            $scope.listing.code === 'startuptour' &&
            $scope.listing.config.default_date) {
            angular.forEach(bookables, (bookable) => {
                bookable.requested = 1;
            });
            return true;
        }

        let message;

        if (isPastCheckInDate) {
            message = 'Please check-in date cannot be in past';
        }

        if ($scope.packeageType === 1 && (!date_from || !date_until)) {
            message = message || 'Please select your check-in and check-out dates';
        }

        if ($scope.packeageType === 2 && (!date_from)) {
            message = message || 'Please select your check-in date';
        }

        if (!Object.values(bookables).some(b => b && b.requested > 0)) {
            message = message || 'Please select atleast one stay/experience';
        }

        if (isTodayCheckIn && nowTemp.getHours() >= 24 - $scope.configs.min_hours_for_booking) {
            message = message || 'Booking is closed for today. Please try for next day.';
        }

        if (message) {
            $scope.showMessage(message);
            return false;
        }
        return true;
    };

    const getBookableCaption = (url, bookableItems) => {
        const item = bookableItems.find(i => i.url === url);
        return item && item.caption;
    };

    const getAvailabilityInfo = (quantityMap, bookableItems) => Object.entries(quantityMap)
            .map(entry => Object.assign({
                available: entry[1].available,
                requested: entry[1].requested,
                caption: getBookableCaption(entry[0], bookableItems)
            }));

    const bookableAvailable = quantityMap =>
        Object.values(quantityMap)
            .some(i => i.available);

    $scope.doCheckAvailable = function() {
        if (!$scope.loveUrl) {
            const propertyCode = $scope.listing && $scope.listing.code;
            analytics.fbpTrack('AddToCart', {
                content_name: propertyCode
            });

            const loveResponse = dataService.loveProperty($scope.listing.url);
            loveResponse.then((value) => {
                if (typeof value === 'object') {
                    // for new love request for this listing
                    $scope.loveUrl = value.url;
                    $scope.doCheckAvailable();
                } else {
                    // when love request is already present for same listing
                }
            });
        } else {
            let params = {};
            params.date_from = convertDateFormat($scope.requestedListingData.date_from, 'DD/MM/YYYY', 'YYYY-MM-DD');
            if ($scope.packeageType === 1) {
                params.date_until = convertDateFormat($scope.requestedListingData.date_until, 'DD/MM/YYYY', 'YYYY-MM-DD');
            } else {
                params.date_until = convertDateFormat($scope.requestedListingData.date_from, 'DD/MM/YYYY', 'YYYY-MM-DD');
            }

            params.property = $scope.listing.url;
            if ($scope.requestedListingData.visitor_message)
                params.visitor_message = $scope.requestedListingData.visitor_message;
            params.payment_gateway = 'RAZOR_PAY';
            if ($scope.paymentDetail.couponCode)
                params.coupon = $scope.paymentDetail.couponCode;

            const arr = {};
            angular.forEach($scope.requestedListingData.bookables, (bookableValue, key) => {
                if (bookableValue.requested > 0 && $scope.packeageType === bookableValue.packageType) {
                    if (bookableValue.requested === true) {
                        bookableValue.requested = 1;
                    }
                    if (bookableValue.extra_guests) {
                        arr[key] = {
                            requested: bookableValue.requested,
                            extra_guests: bookableValue.extra_guests
                        };
                    } else {
                        arr[key] = {
                            requested: bookableValue.requested
                        };
                    }
                }
            });

            params.quantity_map = arr;
            params = utils.GetJSONstringfyifNeeded(params);

            $scope.paymentDetail.checking = 1;
            const pro = dataService.checkAvailableProperty(params, `${$scope.loveUrl}check_available/`);
            pro.then((value) => {
                $scope.paymentDetail.checking = 0;
                if (typeof value === 'object') {
                    $scope.loveData = [];
                    $scope.loveData.push(value);
                    $scope.loveUrl = value.url;
                    $scope.autoFillLoveData(JSON.parse(JSON.stringify($scope.loveData[0])));

                    if (value.state === 'ACCEPTED') {
                        $scope.availabilityChecked = 1;
                        $scope.availabilityData = value;
                        showDownPaymentOption();
                    } else if (value.state === 'NOTIFICATION_SENT') {
                        // hack to get statup tour request video working
                        if ($scope.listing.code === 'startuptour' && $scope.listing.config['default_date']) {
                            $scope.showMessage('Please check your mail to get' +
                                               ' information about the video.');
                        } else if ($scope.listing.code === 'startuptour2') {
                            $scope.showMessage('Thanks for applying. We will get back to you soon.');
                        } else {
                            $scope.requestedListingData.visitor_message = '';
                            $scope.showMessage('Notification sent to Host, please check back to confirm availability.' + ' Also please add explore@explorelifetraveling.com to your contact list to avoid ' + 'emails going to spam folder.');
                            $scope.closeCheckAvailability();
                        }
                    // if we reach this far than atleast one of the requested bookables
                    // has requested > available
                    // inform the user if a subset of their booking is possible
                    } else if (bookableAvailable($scope.loveData[0].quantity_map)) {
                        $scope.unavailableBookables = getAvailabilityInfo(
                            $scope.loveData[0].quantity_map,
                            $scope.listing.bookable_items
                        );

                        $scope.showAvailabilityModal = true;
                    } else {
                        $scope.showMessage('Property is not available.Please book property for other dates.');
                    }

                    $scope.requestButtonText = getRequestButtonText(value.state);
                } else
                    $scope.showMessage(value);
            });
        }
    };

    $scope.requestABook = function() {
        if ($rootScope.alreadyLogin) {
            if ($scope.checkAllFieldsPresent()) {
                $scope.bookNow();
            }
        } else {
            $scope.doLogin();
        }
    };

    const quantityMap = (bookables, packageType) =>
        Object.entries(bookables).reduce((acc, [url, bookable]) => {
            if (!(bookable.requested > 0) || bookable.packageType !== packageType) {
                return acc;
            }
            // Checks if bookable.requested is a boolean true, and assigns int 1, if yes.
            // This was probably the old structure, we don't see bookable.requested
            // as boolean anywhere now
            // bookable.requested = bookable.requested === true ? 1 : bookable.requested;
            acc[url] = { requested : bookable.requested };

            if (bookable.extra_guests) {
                acc[url].extra_guests = bookable.extra_guests;
            }

            return acc;
        }, {});

    $scope.bookNow = function() {
        $scope.paymentDetail.checking = 1;

        const { bookables, date_from, date_until } = $scope.requestedListingData;

        let params = {};
        params.date_from = convertDateFormat(date_from, 'DD/MM/YYYY', 'YYYY-MM-DD');
        params.date_until = $scope.packeageType === 1 ?
            convertDateFormat(date_until, 'DD/MM/YYYY', 'YYYY-MM-DD') : params.date_from;

        params.property = $scope.listing.url;
        params.payment_gateway = 'RAZOR_PAY';

        if ($scope.paymentDetail.code) {
            params.coupon = $scope.paymentDetail.code;
        }

        const arr = quantityMap(bookables, $scope.packeageType);

        params.quantity_map = arr;
        params = utils.GetJSONstringfyifNeeded(params);
        const pro = dataService.orderSend(params);
        pro.then((value) => {
            $scope.paymentDetail.checking = 0;
            if (typeof value === 'object') {
                const amount = $scope.paymentDetail.useDownPayment ?
                    value.downpayment : value.amount;
                $scope.payment(value.url, params, amount);
            } else {
                $scope.showMessage(value);
            }
        });
    };

    const loveDataRequestedDataSame = (bookables, loveData) =>
        Object.entries(bookables).reduce((acc, [url, reqVal]) => {
            const bookableValueInLove = loveData.quantity_map[url];
            if (!reqVal) {
                return acc;
            }

            if (!bookableValueInLove && reqVal.requested > 0) {
                return false;
            }

            if (!bookableValueInLove) {
                return acc;
            }

            acc = acc && (reqVal.requested === bookableValueInLove.requested);
            acc = bookableValueInLove.extra_guests ?
                acc && bookableValueInLove.extra_guests === reqVal.extra_guests :
                acc && !(reqVal.extra_guests > 0);

            return acc;
        }, true);

    $scope.checkLoveDataSame = function() {
        if (!($scope.loveData.length > 0)) {
            return false;
        }

        const referencedLoveData = Object.assign({}, $scope.loveData[0]);
        const { bookables, date_from, date_until } = $scope.requestedListingData;
        const loveDataDateFrom = convertDateFormat(referencedLoveData.date_from, 'YYYY-MM-DD', 'DD/MM/YYYY');
        const loveDataDateUntil = convertDateFormat(referencedLoveData.date_until, 'YYYY-MM-DD', 'DD/MM/YYYY');

        let allDataSame = loveDataRequestedDataSame(bookables, referencedLoveData);

        return allDataSame && (date_from === loveDataDateFrom && date_until === loveDataDateUntil);
    };


    const minStayErrorMessage = (requestedBookables, allBookablesData, dayDiff) => {
        const bookableUrls = Object.keys(requestedBookables);
        const bookablesData = allBookablesData.filter(i => bookableUrls.includes(i.url));

        return Object.values(requestedBookables).reduce((message, bookable) => {
            const bookableData = bookablesData.find(i => i.url === bookable.url);
            if (bookable.requested > 0 && bookableData.minimum_stay > dayDiff) {
                return message ?
                    `${message}, ${bookableData.caption} = ${bookableData.minimum_stay} days` :
                    `${bookableData.caption} = ${bookableData.minimum_stay} days`;
            }
            return message;
        }, '');
    };

    const checkMinStay = function(bookableItems, reqListingData) {
        const { bookables } = reqListingData;
        let { date_from, date_until } = reqListingData;
        let dayDiff = 1;
        if (date_from && date_until) {
            date_from = moment(date_from, 'DD/MM/YYYY').toDate();
            date_until = moment(date_until, 'DD/MM/YYYY').toDate();
            dayDiff = dayDifference(date_from, date_until);
        }

        const errorMessageForMinimumStay = minStayErrorMessage(bookables, bookableItems, dayDiff);
        return errorMessageForMinimumStay &&
            `Minimum stay for ${errorMessageForMinimumStay}. ` +
            'Please fill in correct date';
    };

    $scope.showCouponArea = () => {
        if ($scope.paymentDetail.oneDayPrice <= 0) {
            $scope.showMessage('Total is zero, can\'t apply any coupon');
            return;
        }

        $scope.showCoupon = !$scope.showCoupon;
    };

    const couponErrorMessage = (coupon, start, end) => {
        if (coupon.redeemed_count >= coupon.total_count) {
            return 'Promo code already used.';
        } else if (coupon.valid_until !== null && new Date(end) - new Date(start) <= 0) {
            return 'Promo code expired.';
        }
        return '';
    };

    // on coupon apply
    function couponApply() {
        $scope.paymentDetail.couponError = '';
        $scope.paymentDetail.couponSuccess = '';
        $scope.paymentDetail.discount = 0;
        $scope.paymentDetail.discountPer = 0;
        const pro = dataService.getCouponDetails($scope.paymentDetail.code);
        pro.then((value) => {
            if (value.count !== 1) {
                $scope.paymentDetail.couponError = 'Promo code invalid';
                return null;
            }
            const coupon = value.results[0];

            const start = new Date();
            let end = null;
            start.setHours(0, 0, 0, 0);
            if (coupon.valid_until) {
                end = new Date(coupon.valid_until);
                end.setHours(23, 59, 59, 999);
            }

            $scope.paymentDetail.couponError = couponErrorMessage(coupon, start, end);

            if (!$scope.paymentDetail.couponError) {
                if (coupon.type === 'PERCENT') {
                    $scope.paymentDetail.discountPer = coupon.value;
                    couponDiscount = totalPriceForDiscount * coupon.value / 100;
                    $scope.paymentDetail.couponValue = `${coupon.value}%`;
                } else {
                    $scope.paymentDetail.discount = coupon.value;
                    couponDiscount = coupon.value;
                    $scope.paymentDetail.couponValue = `₹${coupon.value}`;
                }
                $scope.paymentDetail.code = coupon.code;
                $scope.paymentDetail.couponSuccess = 'coupon applied successfully.';
                $scope.showTotalPrice();
            }
            return null;
        });
    }

    if ($scope.listing.code === 'startuptour' && $scope.listing.config['default_date']) {
        $scope.requestButtonText = 'Request Video';
    } else if ($scope.listing.code === 'startuptour2') {
        $scope.requestButtonText = 'Apply for Free';
    } else {
        $scope.requestButtonText = 'Check availability';
    }
    $scope.availabilityChecked = 0;
    $scope.loveUrl = '';

    $scope.paymentDetail.checking = 0;

    function clickOnrequestButton() {
        if ($scope.isHostOrder) {
            if ($scope.loveData[0].state === 'PAYMENT_CONFIRMED' || $scope.loveData[0].state === 'DELETED') {
                return;
            }
            completeHostOrder();
            return;
        }

        if ($scope.availabilityChecked === 0) {
            // love property
            $scope.loveProperty();
        } else if ($scope.availabilityChecked === 1) {
            // for order
            $scope.requestABook();
        }
    }

    $scope.$watch('alreadyLogin', (newValue) => {
        if (newValue === 1 && !$scope.isHostOrder) {
            if ($scope.listing.code) {
                $scope.checkIfExistingLovePresent();
            }
        } else if (newValue === 0) {
            $scope.love = [];
        }
    });

    $scope.$watch(() => $rootScope.userDetails, () => {
        $scope.userDetails = $rootScope.userDetails;
    });

    $scope.userDetails = $rootScope.userDetails;

    const memberOfListingGroups = (user, listing) => {
        const userGroups = user.groups_joined;
        const availableToGroups = listing.category.split(',');
        return availableToGroups.some(g => userGroups.includes(g));
    };

    $scope.IsMemberBookingListing = function() {
        $scope.userDetails = $rootScope.userDetails;
        if (!$scope.userDetails) {
            return false;
        }

        if ($scope.listing.config.member_only_booking !== 'true') {
            return true;
        }

        if (!memberOfListingGroups($scope.userDetails, $scope.listing)) {
            $scope.showMessage('This property is only available to the community members. ' +
                               'To book this property please join one of the following communities ' +
                               `: "${$scope.listing.category}"`);
            return false;
        }
        return true;
    };

    function completeHostOrder() {
        let amount = $scope.paymentDetail.useDownPayment ?
            $scope.loveData[0].downpayment : $scope.loveData[0].amount;

        amount = parseInt(amount, 10);

        const orderId = hostOrderUrl.split('/')[hostOrderUrl.split('/').length - 2];
        const url = `${EXPLORE.urlHelper.orders_by_host}${orderId}/?ref=${$routeParams.ref}&code=${$routeParams.code}`;

        if (amount > 0) {
            $scope.paymentSuccess = false;
            $scope.orderCloseByTimeout = false;


            const closeTimeout = $timeout(() => {
                $scope.closeRazorpay();
            }, 20 * 60 * 1000);

            const options = {
                key: 'rzp_live_s0tl4TqJp0niIm', // 'rzp_test_lDLPc94665cXrV',
                amount: amount * 100,
                currency: 'INR',
                name: $scope.listing.caption,
                description: $scope.listing.caption,
                image: $scope.listing.images[0].image,
                notes: {
                    elt_order_id: orderId
                },
                handler: (response) => {
                    const params = {
                        amount_paid: amount,
                        receipt_information: response.razorpay_payment_id,
                        payment_gateway: 'RAZOR_PAY'
                    };

                    $http({
                        url,
                        data: JSON.stringify(params),
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8'
                        }
                    })
                        .success(completeOrder)
                        .error((response) => {
                            let message = '';
                            if (typeof response !== 'string') {
                                angular.forEach(response, (detail, errorType) => {
                                    message += (`${errorType} : ${detail}`);
                                });

                                $scope.showMessage(message);

                                return;
                            }

                            $scope.showMessage('Error in placing your order. Contact support@explore.com');
                        });
                },
                prefill: {
                    name: $scope.guestDetails.full_name,
                    email: $scope.guestDetails.email,
                    contact: $scope.guestDetails.details.phone_number
                },
                theme: {
                    color: '#F37254'
                },
                modal: {
                    ondismiss: () => {
                        $timeout.cancel(closeTimeout);
                    }
                }
            };
            rzp1 = new Razorpay(options);
            rzp1.open();
        } else {
            const params = {
                amount_paid: amount,
                receipt_information: 'No amount due',
                payment_gateway: 'PAYU'
            };

            $http({
                url,
                data: JSON.stringify(params),
                method: 'PUT'
            }).success(completeOrder);
        }

        function completeOrder(response) {
            if (typeof response !== 'object') {
                console.error('response', response);
                return;
            }
            $scope.requestButtonText = 'Booking Completed';
            $scope.disableSubmit = true;
            showSuccessModal(response);
        }

        function showSuccessModal(response) {
            $rootScope.paymentDetails = {
                paymentId: orderId,
                date_from: response.date_from,
                date_until: response.date_until,
                caption: $scope.listing.caption,
                totalPrice: response.amount_paid
            };

            $rootScope.paymentDetails.paymentItem = [];

            angular.forEach(response.quantity_map, (bookable) => {
                const requestDetails = {};

                requestDetails.caption = bookable.caption.
                    replace($scope.listing.caption, '');
                requestDetails.requested = bookable.requested;

                $rootScope.paymentDetails.paymentItem.push(requestDetails);
            });

            $('#payment-success-modal').addClass('open');
        }
    }

    function showPaymentSuccessMessage() {
        function copyToRootScope() {
            function getAmountPaid() {
                if ($scope.paymentDetail.useDownPayment) {
                    return $scope.paymentDetail.totalDownPayment;
                }

                return $scope.paymentDetail.totalPrice;
            }
            $rootScope.paymentDetails = {
                paymentId: $scope.filter.PaymentId,
                date_from: $scope.requestedListingData.date_from,
                date_until: $scope.requestedListingData.date_until,
                caption: $scope.listing.caption,
                paymentItem: $scope.filter.PaymentItem,
                totalPrice: getAmountPaid()
            };
        }
        copyToRootScope();

        $('#payment-success-modal').addClass('open');
    }

    $scope.paymentSuccess = false;
    // for razor pay
    $scope.payment = function(orderUrl, params, amount) {
        if (parseInt(amount, 10) > 0) {
            $scope.paymentSuccess = false;
            $scope.orderCloseByTimeout = false;
            const orderId = orderUrl.split('/')[orderUrl.split('/').length - 2];
            const closeTimeout = $timeout(() => {
                $scope.closeRazorpay();
            }, 20 * 60 * 1000); // close razor pay screen if it is open more than 20 mins
            const options = {
                key: 'rzp_live_s0tl4TqJp0niIm', // 'rzp_test_lDLPc94665cXrV'
                amount: Math.ceil(amount * 100),
                currency: 'INR',
                name: $scope.listing.caption,
                description: $scope.listing.caption,
                image: $scope.listing.images[0].image,
                notes: {
                    elt_order_id: orderId
                },
                handler: (response) => {
                    const propertyCode = $scope.listing.code;
                    analytics.fbpTrack('Purchase', {
                        value: amount,
                        currency: 'INR',
                        content_name: propertyCode
                    });

                    $scope.paymentSuccess = true;
                    params = utils.GetJSONifNeeded(params);
                    params.amount_paid = amount;
                    params.receipt_information = response.razorpay_payment_id;
                    params = utils.GetJSONstringfyifNeeded(params);
                    const promisePayment = dataService.orderAddPaymentId(params, orderUrl);
                    promisePayment.then((val) => {
                        if (!val) {
                            $scope.paymentSuccess = false;
                            $rootScope.orderId = orderId;
                            $('#order-failed-modal').addClass('open');
                            return;
                        }

                        $timeout.cancel(closeTimeout);
                        $scope.requestButtonText = 'Booking completed';
                        $scope.availabilityChecked = 2;
                        $scope.filter.PaymentItem = [];
                        angular.forEach(val.quantity_map, (orderedBookable) => {
                            const bookableItemMap = {};
                            bookableItemMap.caption = orderedBookable.caption
                                .replace(val.bookings[0].property.caption, '');
                            bookableItemMap.requested = orderedBookable.requested;
                            $scope.filter.PaymentItem.push(bookableItemMap);
                        });
                        $scope.filter.PaymentId = utils.getIdfromUrl(val.url);
                        showPaymentSuccessMessage();
                        if ($scope.loveUrl)
                            dataService.loveDelete($scope.loveUrl);
                        else if ($scope.oldLovaData.url)
                            dataService.loveDelete($scope.oldLovaData.url);
                    });
                },
                prefill: {
                    name: $scope.userDetails.full_name,
                    email: $scope.userDetails.email,
                    contact: $scope.userDetails.details.phone_number
                },
                theme: {
                    color: '#F37254'
                },
                modal: {
                    ondismiss: () => {
                        $timeout.cancel(closeTimeout);
                        setTimeout(() => {
                            if ($scope.paymentSuccess === false && $scope.orderCloseByTimeout === false) {
                                dataService.orderDelete(orderUrl);
                            }
                        }, 1000);
                    }
                }
            };
            rzp1 = new Razorpay(options);
            rzp1.open();
        } else {
            $scope.paymentSuccess = true;
            params = utils.GetJSONifNeeded(params);
            params.receipt_information = 'No amount due';
            params.payment_gateway = 'PAYU';
            params = utils.GetJSONstringfyifNeeded(params);
            const promisePayment = dataService.orderAddPaymentId(params, orderUrl);
            promisePayment.then((val) => {
                $scope.requestButtonText = 'Booking completed';
                $scope.availabilityChecked = 2;
                $scope.filter.PaymentItem = [];
                angular.forEach(val.quantity_map, (orderedBookable) => {
                    const bookableItemMap = {};
                    bookableItemMap.caption = orderedBookable.caption
                        .replace(val.bookings[0].property.caption, '');
                    bookableItemMap.requested = orderedBookable.requested;
                    $scope.filter.PaymentItem.push(bookableItemMap);
                });
                $scope.filter.PaymentId = utils.getIdfromUrl(val.url);
                showPaymentSuccessMessage();
                if ($scope.loveUrl)
                    dataService.loveDelete($scope.loveUrl);
                else if ($scope.oldLovaData.url)
                    dataService.loveDelete($scope.oldLovaData.url);
            });
        }
    };

    $scope.closeRazorpay = function() {
        if ($scope.paymentSuccess === false) {
            $scope.orderCloseByTimeout = true;
            rzp1.close();
        }
    };

    function goToReviews() {
        $('html, body').animate({
            scrollTop: $('#reviews').offset().top
        }, 1000);
    }

    const dayDifference = (firstDate, secondDate) => {
        const date2 = new Date(secondDate);
        const date1 = new Date(firstDate);
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return (diffDays);
    };

    $scope.closeCheckAvailability = function() {
        $('.bp-content .close').click();
    };

    const getLocalDate = (date, date_format, time_zone) => {
        let local_date = '';

        // ToDo: Add strict check for dateFormat
        if (date) {
            date = date.replace(' ', 'T');
        }

        if (time_zone) {
            if (time_zone === 'local') {
                local_date = $filter('date')(new Date(date), date_format);
            } else {
                local_date = $filter('date')(new Date(date), date_format, time_zone);
            }
        } else {
            local_date = moment(date, date_format).format(date_format);
        }
        return local_date;
    };

    const convertDateFormat = (date, input_format, desired_format) => {
        let output_date = '';
        if (date && desired_format) {
            output_date = moment(date, input_format).format(desired_format);
        }
        return output_date;
    };

    function getPackageType(type) {
        if (type === 'ROOM') {
            return 1;
        } else if (type === 'PACKAGE') {
            return 2;
        }
    }

    function confirmRequestModification() {
        function copyLoveData() {
            $rootScope.rootLoveData = {
                date_from: $scope.loveData[0].date_from,
                date_until: $scope.loveData[0].date_until
            };

            $rootScope.lovedBookables = [];

            angular.forEach($scope.loveData[0].quantity_map, (value, url) => {
                const data = {};
                let lovedBookable;

                $scope.listing.bookable_items.forEach((bookable) => {
                    if (bookable.url === url) {
                        lovedBookable = bookable;
                    }
                });

                if (!lovedBookable) {
                    return;
                }

                data.caption = lovedBookable.caption;
                data.requested = value.requested;
                $rootScope.lovedBookables.push(data);
            });
        }

        function copyRequestedData() {
            const dateFrom = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY').
                    format('YYYY-MM-DD');
            const dateUntil = moment($scope.requestedListingData.date_until, 'DD/MM/YYYY').
                    format('YYYY-MM-DD');

            $rootScope.rootRequestData = {
                date_from: dateFrom,
                date_until: $scope.packeageType === 1 ? dateUntil : dateFrom
            };

            $rootScope.requestedBookables = [];

            angular.forEach($scope.requestedListingData.bookables, (value, url) => {
                if (value.requested) {
                    const data = {};
                    let requestedBookable;

                    $scope.listing.bookable_items.forEach((bookable) => {
                        if (bookable.url === url) {
                            requestedBookable = bookable;
                        }
                    });

                    data.caption = requestedBookable.caption;
                    data.requested = value.requested;
                    $rootScope.requestedBookables.push(data);
                }
            });
        }

        // copy data to rootscope
        copyLoveData();
        copyRequestedData();
        $('#modify-request-modal').addClass('open');
    }

    $rootScope.modifyRequest = function() {
        $scope.closePopUp();

        if ($scope.listing.instabook) {
            $scope.doCheckAvailable();
        } else {
            const msg = 'Please provide some details about yourself that would help the ' +
                        'host to accept your reservation.';
            $scope.showMessage(msg, (inputValue) => {
                if (inputValue === false)
                    return false;
                if (inputValue !== '') {
                    $scope.requestedListingData.visitor_message = inputValue;
                    $scope.doCheckAvailable();
                }
            });
        }
    };
}

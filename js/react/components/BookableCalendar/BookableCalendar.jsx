import React from 'react';
import moment from 'moment';
import cls from 'classnames';
import { connect } from 'react-redux';
import { DayPickerRangeController } from 'react-dates';

import './BookableCalendar.scss';
import PriceEl from '../PriceEl/PriceEl.jsx';
import { actions } from '../../reducers';
import idFromURLEnd from '../../lib/idFromURLEnd.js';
import Loader from '../Loader/Loader.jsx';

const format = 'YYYY-MM-DD';
const dateInBetween = (date, range) => {
    if (!date || !range) {
        return false;
    }
    const { date_from, date_until } = range;
    const startDate = moment(date_from);
    const endDate = moment(date_until).endOf('day');

    return startDate.valueOf() <= date.valueOf() && date.valueOf() <= endDate.valueOf();
};

const getBorderRadius = (isOneDay, isFirst, isLast) => {
    if (isOneDay) {
        return '5px';
    } else if (isFirst) {
        return '5px 0 0 5px';
    } else if (isLast) {
        return '0 5px 5px 0';
    }
    return '0px';
};

// const getBorderWidth = (isOneDay, isFirst, isLast) => {
//     if (isOneDay) {
//         return '1px';
//     } else if (isFirst) {
//         return '1px 0 1px 1px';
//     } else if (isLast) {
//         return '1px 1px 1px 0px';
//     }
//     return '1px 0px';
// };

const getDateRange = (date, ranges) => {
    if (!date) {
        return false;
    }
    for (let i = ranges.length - 1; i >= 0; i -= 1) {
        if (dateInBetween(date, ranges[i])) {
            return ranges[i];
        }
    }
    return false;
};

const getDefaultDates = (currentDate) => {
    const currentDateString = currentDate.format(format);
    return {
        startDate: moment(currentDateString).subtract(1, 'month').startOf('month').format(format),
        endDate: moment(currentDateString).add(1, 'month').endOf('month').format(format)
    };
};

const defaultState = () => ({
    focusedInput: 'startDate',
    isFocused: false,
    dateRanges: [],
    datesUnavailable: [],
    showCalendar: true,

    priceValue: null,
    specialPriceDates: [],
    bookingDates: [],
    isLoading: true
});

const getDateRangesToAdd = (dateRanges, startDate, endDate, addFlag = true) => {
    const startRange = dateRanges.filter(({ date_from, date_until }) =>
        moment(date_from) < startDate && startDate <= moment(date_until)
    )[0];
    const endRange = dateRanges.filter(({ date_from, date_until }) =>
        moment(date_from) <= endDate && endDate < moment(date_until)
    )[0];
    const ranges = [];
    if (addFlag) {
        ranges.push({ date_from: startDate.format(format), date_until: endDate.format(format) });
    }
    if (startRange) {
        const { date_from, price_delta } = startRange;
        ranges.push({ date_from, price_delta, date_until: startDate.subtract(1, 'day').format(format) });
    }
    if (endRange) {
        const { date_until, price_delta } = endRange;
        ranges.push({ date_from: endDate.add(1, 'day').format(format), date_until, price_delta });
    }
    return ranges;
};

const getOverLapRanges = (dateRanges, startDate, endDate) =>
    dateRanges.filter(({ date_from, date_until }) => {
        const dateFrom = moment(date_from);
        const dateUntil = moment(date_until);
        return (startDate <= dateFrom && dateFrom <= endDate) ||
            (startDate <= dateUntil && dateUntil <= endDate) ||
            (dateFrom <= startDate && startDate <= dateUntil);
    });

const generateRangeDetails = (results, ranges, dates) => {
    results.map((obj) => {
        ranges.push(obj);
        // const id = idFromURLEnd(obj.url);
        let startDate = moment(obj.date_from);
        const endDate = moment(obj.date_until);
        while (startDate <= endDate) {
            if (dates.filter(date => date.valueOf() === startDate.valueOf()).length === 0) {
                dates.push(startDate);
            }
            startDate = moment(startDate.format(format)).add(1, 'day');
        }
        return false;
    });
    return { ranges, dates };
};

const getDatesPresentCount = (dates, startDate, endDate) =>
    dates.filter(date => startDate <= date && date <= endDate).length;

const resetDateState = () => ({
    focusedInput: 'startDate',
    startDate: null,
    endDate: null,
    showUnavailableButton: false,
    showAvailableButton: false,
    showAddPriceButton: false,
    showDeletePriceButton: false
});

class BookableCalendar extends React.Component {
    static propTypes = {
        fetchUnvailableDates: React.PropTypes.func.isRequired,
        updateUnvailableDates: React.PropTypes.func.isRequired,
        deleteUnavailableDates: React.PropTypes.func.isRequired,
        fetchSpecialPrices: React.PropTypes.func.isRequired,
        updateSpecialPrice: React.PropTypes.func.isRequired,
        deleteSpecialPrice: React.PropTypes.func.isRequired,
        modifySpecialPrice: React.PropTypes.func.isRequired,
        fetchBookings: React.PropTypes.func.isRequired,
        bookable: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);

        this.state = defaultState();
        this.resetValues();
        this.loadingCount = 0;

        this.onFocusChange = this.onFocusChange.bind(this);
        this.onDatesChange = this.onDatesChange.bind(this);
        this.onPrevMonthClick = this.onPrevMonthClick.bind(this);
        this.onNextMonthClick = this.onNextMonthClick.bind(this);

        // For Unavailable dates change
        this.setUnavailableDates = this.setUnavailableDates.bind(this);
        this.removeUnavailableDates = this.removeUnavailableDates.bind(this);

        // For special price change
        this.setRef = this.setRef.bind(this);
        this.setSpecialPrice = this.setSpecialPrice.bind(this);
        this.changeSpecialPrice = this.changeSpecialPrice.bind(this);
        this.onPriceDeltaChange = this.onPriceDeltaChange.bind(this);
        // this.onSpecialPriceSelect = this.onSpecialPriceSelect.bind(this);
        this.removeSpecialPrices = this.removeSpecialPrices.bind(this);
        // this.removeDeletedPriceDates = this.removeDeletedPriceDates.bind(this);
    }

    componentDidMount() {
        this.currentDate = moment();
        const { startDate, endDate } = getDefaultDates(this.currentDate);
        this.fetchData(this.props.bookable, startDate, endDate);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.bookable.id !== nextProps.bookable.id) {
            this.currentDate = moment();
            const { startDate, endDate } = getDefaultDates(this.currentDate);
            this.setState(defaultState());
            this.resetValues();
            this.fetchData(nextProps.bookable, startDate, endDate);
        }
    }

    onFocusChange(focusedInput) {
        if (focusedInput) {
            this.setState({ focusedInput });
        } else {
            this.setState({ focusedInput: 'startDate' });
        }
    }

    onDatesChange({ startDate, endDate }) {
        this.startDate = startDate ? startDate.startOf('day') : null;
        this.endDate = startDate && endDate ? endDate.startOf('day') : null;

        let showUnavailableButton = false;
        let showAvailableButton = false;
        let showAddPriceButton = false;
        let showDeletePriceButton = false;

        if (this.startDate) {
            const tempEndDate = this.endDate || this.startDate;

            const unavailableCount = getDatesPresentCount(this.state.datesUnavailable, this.startDate, tempEndDate);
            const totalCount = tempEndDate.diff(this.startDate, 'days') + 1;

            if ((totalCount - unavailableCount) === 0) {
                showAvailableButton = true;
            } else {
                showUnavailableButton = true;
                if (unavailableCount !== 0) {
                    showAvailableButton = true;
                }
            }

            const priceCount = getDatesPresentCount(this.state.specialPriceDates, this.startDate, tempEndDate);
            if ((totalCount - priceCount) === 0) {
                showAddPriceButton = true;
                showDeletePriceButton = true;
            } else {
                showAddPriceButton = true;
                if (priceCount !== 0) {
                    showDeletePriceButton = true;
                }
            }
        }

        this.setState({
            startDate: this.startDate,
            endDate: this.endDate,
            showUnavailableButton,
            showAvailableButton,
            showAddPriceButton,
            showDeletePriceButton
        });
        return true;
    }

    onPrevMonthClick() {
        this.enableDateChange = false;
        setTimeout(() => {
            this.currentDate = this.currentDate.subtract(1, 'month');
            const { startDate, endDate } = getDefaultDates(this.currentDate);
            this.fetchData(this.props.bookable, startDate, endDate);
        }, 100);
    }

    onNextMonthClick() {
        this.enableDateChange = false;
        setTimeout(() => {
            this.currentDate = this.currentDate.add(1, 'month');
            const { startDate, endDate } = getDefaultDates(this.currentDate);
            this.fetchData(this.props.bookable, startDate, endDate);
        }, 100);
    }

    onPriceDeltaChange(e) {
        const { bookable } = this.props;
        this.priceDelta = e.target.value - bookable.dailyPrice;
    }

    getCalendarDate(startDate, endDate) {
        if (this.enableDateChange) {
            this.startDate = startDate;
            this.endDate = endDate;
            return { startDate, endDate };
        }
        return {};
    }

    setUnavailableDates() {
        const { startDate, endDate } = this;
        this.setState({ startDate, endDate });
        if (startDate) {
            const tempEndDate = endDate || moment(startDate.format(format));
            const ranges = getOverLapRanges(this.unavailableRanges, startDate, tempEndDate);
            const toAddRanges = getDateRangesToAdd(this.unavailableRanges, startDate, tempEndDate);
            if (ranges.length > 0) {
                ranges.map((range) => {
                    this.fetchRemoveUnavailableAPI(range, () => {
                        if (this.loadingCount === 0) {
                            toAddRanges.map(({ date_from, date_until }) => {
                                this.fetchSetUnavailableAPI(moment(date_from), moment(date_until));
                                return false;
                            });
                        }
                    });
                    return false;
                });
            } else {
                this.fetchSetUnavailableAPI(startDate, tempEndDate);
            }
        }
    }

    setRef(element) {
        this.priceInput = element;
    }

    setSpecialPrice() {
        const { startDate, endDate } = this;
        this.setState({ startDate, endDate });
        if (startDate) {
            const tempEndDate = endDate || moment(startDate.format(format));
            const ranges = getOverLapRanges(this.specialPriceRanges, startDate, tempEndDate);
            const toAddRanges = getDateRangesToAdd(this.specialPriceRanges, startDate, tempEndDate);
            if (ranges.length > 0) {
                ranges.map((range) => {
                    this.fetchRemoveSpecialPriceAPI(range, () => {
                        if (this.loadingCount === 0) {
                            toAddRanges.map(({ date_from, date_until, price_delta }) => {
                                this.fetchSetSpecialPriceAPI(moment(date_from), moment(date_until), price_delta);
                                return false;
                            });
                        }
                    });
                    return false;
                });
            } else {
                this.fetchSetSpecialPriceAPI(startDate, tempEndDate);
            }
        }
    }

    getBookedDay(date) {
        return getDateRange(date, this.bookedDateRanges);
    }

    clickedPriceRange(date) {
        return getDateRange(date, this.specialPriceRanges);
    }

    clickedUnavailableRange(date) {
        return getDateRange(date, this.unavailableRanges);
    }

    showLoader() {
        this.loadingCount += 1;
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
    }

    hideLoader() {
        this.loadingCount -= 1;
        if (this.loadingCount === 0 && this.state.isLoading) {
            this.setState({ isLoading: false });
            this.enableDateChange = true;
        }
    }

    fetchData(bookable, startDate, endDate) {
        const { fetchUnvailableDates, fetchSpecialPrices, fetchBookings } = this.props;
        this.showLoader();
        fetchUnvailableDates({ bookableItem: bookable.id, startDate, endDate }).then((data) => {
            this.updateDates(data.results);
            this.hideLoader();
        }).catch((err) => {
            this.hideLoader();
            throw Error(err);
        });

        this.showLoader();
        fetchSpecialPrices({ startDate, endDate, bookableItem: bookable.id }).then((data) => {
            this.updatePriceDates(data.results);
            this.hideLoader();
        }).catch((err) => {
            this.hideLoader();
            throw Error(err);
        });

        this.showLoader();
        fetchBookings({ startDate, endDate, bookableItem: bookable.id }).then((data) => {
            this.updateBookingDates(data.results);
            this.hideLoader();
        }).catch((err) => {
            this.hideLoader();
            throw Error(err);
        });
    }

    changeSpecialPrice() {
        const { modifySpecialPrice, bookable } = this.props;
        const { startDate, endDate } = this.state;

        const priceRange = this.specialPriceRanges.filter(range =>
            range.date_from === startDate.format(format) && range.date_until === endDate.format(format)
        )[0];

        if (priceRange && this.priceDelta !== null) {
            const id = idFromURLEnd(priceRange.url);

            this.showLoader();
            modifySpecialPrice(id, {
                bookableItem: bookable.url,
                startDate: priceRange.date_from,
                endDate: priceRange.date_until,
                priceDelta: this.priceDelta
            }).then((data) => {
                this.priceDelta = null;
                this.updatePriceDates([data]);
                this.hideLoader();
            }).catch((err) => {
                throw Error(err);
            });
        }
    }

    resetValues() {
        this.priceInput = null;
        this.reloadCalendar = true;
        this.enableDateChange = true;
        this.currentDate = moment();
        this.priceDelta = null;
        this.unavailableRanges = [];
        this.specialPriceRanges = [];
        this.bookedDateRanges = [];
    }

    removeDeletedPriceDates(selectedPriceRange) {
        const updatedRanges = this.specialPriceRanges.filter(range => range.url !== selectedPriceRange.url);
        this.specialPriceRanges = [];
        this.setState({ specialPriceDates: [] });
        // this.selectedSpecialPrice = null;
        this.updatePriceDates(updatedRanges);
    }

    removeSpecialPrices() {
        const { startDate, endDate } = this.state;
        // this.setState({ startDate, endDate });
        if (startDate) {
            const tempEndDate = endDate || moment(startDate.format(format));
            const ranges = getOverLapRanges(this.specialPriceRanges, startDate, tempEndDate);
            const toAddRanges = getDateRangesToAdd(this.specialPriceRanges, startDate, tempEndDate, false);
            if (ranges.length > 0) {
                ranges.map((range) => {
                    this.fetchRemoveSpecialPriceAPI(range, () => {
                        if (this.loadingCount === 0) {
                            toAddRanges.map(({ date_from, date_until, price_delta }) => {
                                this.fetchSetSpecialPriceAPI(moment(date_from), moment(date_until), price_delta);
                                return false;
                            });
                        }
                    });
                    return false;
                });
            } else {
                this.fetchSetSpecialPriceAPI(startDate, tempEndDate);
            }
        }
    }

    removeDeletedUnavailableDates(selectedRange) {
        const updatedRanges = this.unavailableRanges.filter(range => range.url !== selectedRange.url);
        this.unavailableRanges = [];
        this.setState({ datesUnavailable: [] });
        this.reloadCalendar = true;
        this.updateDates(updatedRanges);
    }

    fetchRemoveSpecialPriceAPI(selectedRange, callback) {
        const { deleteSpecialPrice } = this.props;
        if (selectedRange) {
            const id = idFromURLEnd(selectedRange.url);
            this.showLoader();
            deleteSpecialPrice(id).then(() => {
                this.removeDeletedPriceDates(selectedRange);
                this.hideLoader();
                if (callback) {
                    callback();
                }
            }).catch((err) => {
                this.hideLoader();
                if (callback) {
                    callback();
                }
                throw Error(err);
            });
        }
    }

    fetchRemoveUnavailableAPI(selectedRange, callback) {
        const { deleteUnavailableDates } = this.props;
        if (selectedRange) {
            const id = idFromURLEnd(selectedRange.url);
            this.showLoader();
            deleteUnavailableDates(id).then(() => {
                this.removeDeletedUnavailableDates(selectedRange);
                this.hideLoader();
                if (callback) {
                    callback();
                }
            }).catch((err) => {
                this.hideLoader();
                throw Error(err);
            });
        }
    }

    removeUnavailableDates() {
        const { startDate, endDate } = this.state;
        // this.setState({ startDate, endDate });
        if (startDate) {
            const tempEndDate = endDate || moment(startDate.format(format));
            const ranges = getOverLapRanges(this.unavailableRanges, startDate, tempEndDate);
            const toAddRanges = getDateRangesToAdd(this.unavailableRanges, startDate, tempEndDate, false);
            if (ranges.length > 0) {
                ranges.map((range) => {
                    this.fetchRemoveUnavailableAPI(range, () => {
                        if (this.loadingCount === 0) {
                            toAddRanges.map(({ date_from, date_until }) => {
                                this.fetchSetUnavailableAPI(moment(date_from), moment(date_until));
                                return false;
                            });
                        }
                    });
                    return false;
                });
            } else {
                this.fetchSetUnavailableAPI(startDate, tempEndDate);
            }
        }
    }

    fetchSetSpecialPriceAPI(startDate, endDate, priceDelta) {
        const { updateSpecialPrice, bookable } = this.props;
        const delta = priceDelta || this.priceDelta;
        if (startDate && endDate && delta) {
            this.showLoader();
            updateSpecialPrice({
                bookableItem: bookable.url,
                startDate: startDate.format(format),
                endDate: endDate.format(format),
                priceDelta: delta
            }).then((data) => {
                this.priceInput.value = null;
                this.priceDelta = null;
                this.setState({
                    ...resetDateState(),
                    showCalendar: false
                });
                this.updatePriceDates([data]);
                this.setState({ priceValue: null });
                this.hideLoader();
            }).catch((err) => {
                this.hideLoader();
                throw Error(err);
            });
        }
    }


    fetchSetUnavailableAPI(startDate, endDate) {
        const { updateUnvailableDates, bookable, owner } = this.props;
        this.showLoader();
        updateUnvailableDates({
            bookableItem: bookable.url,
            startDate: startDate.format(format),
            endDate: endDate.format(format),
            owner: owner.url
        }).then((data) => {
            this.reloadCalendar = true;
            this.setState(resetDateState());
            this.updateDates([data]);
            this.hideLoader();
        }).catch((err) => {
            this.hideLoader();
            throw Error(err);
        });
    }

    updateDates(results) {
        const state = this.getCalendarDate(null, null);
        const { ranges, dates } = generateRangeDetails(results, this.unavailableRanges, this.state.datesUnavailable);
        this.unavailableRanges = ranges;

        if (this.reloadCalendar) {
            this.reloadCalendar = false;
            this.setState({ showCalendar: false });
        }
        this.setState(Object.assign(state, {
            datesUnavailable: dates,
            showCalendar: true
        }));
    }


    updatePriceDates(results) {
        const state = this.getCalendarDate(null, null);
        const { ranges, dates } = generateRangeDetails(results, this.specialPriceRanges, this.state.specialPriceDates);
        this.specialPriceRanges = ranges;

        this.setState(Object.assign(state, {
            specialPriceDates: dates,
            showCalendar: true
        }));
    }

    updateBookingDates(results) {
        const state = this.getCalendarDate(null, null);
        const { ranges, dates } = generateRangeDetails(results, this.bookedDateRanges, this.state.bookingDates);
        this.bookedDateRanges = ranges;

        this.setState(Object.assign(state, {
            bookingDates: dates
        }));
    }

    render() {
        const { bookable } = this.props;
        const { datesUnavailable } = this.state;
        const isDayHighlighted = day => datesUnavailable.some(day2 => day.format(format) === day2.format(format));

        const DayComponent = (day) => {
            const bookedDay = this.getBookedDay(day);
            const isBookedDayOne = day.format(format) === bookedDay.date_from;
            const isBookedDayLast = day.format(format) === bookedDay.date_until;
            const isOneDayBooking = bookedDay.date_from === bookedDay.date_until;

            const specialPrice = (date) => {
                const range = this.clickedPriceRange(date);

                return (
                    <div
                      className="absolute red bottom-0 w-100"
                      role="presentation"
                    >
                        {
                            range ?
                                <PriceEl small price={bookable.dailyPrice + range.price_delta} />
                            :
                                <PriceEl small price={bookable.dailyPrice} />
                        }
                    </div>
                );
            };
            return (
                <div className="relative w-100 h-100">
                    <div className="absolute top-0 left-0 w-100 h-100">
                        {day.format('D')}
                    </div>
                    {
                        bookedDay && (
                            <div
                              className="absolute bg-green white w-100"
                              style={{
                                  top: '20px',
                                  height: '20px',
                                  fontSize: '10px',
                                  lineHeight: '20px',
                                  borderRadius: getBorderRadius(isOneDayBooking, isBookedDayOne, isBookedDayLast)
                              }}
                            >
                                {
                                    (isBookedDayOne || day.date() === 1) && bookedDay.owner_info.full_name
                                }
                            </div>
                        )
                    }
                    {specialPrice(day)}
                </div>
            );
        };

        const calendar = () => (
            <div>
                <DayPickerRangeController
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  onDatesChange={this.onDatesChange}
                  focusedInput={this.state.focusedInput}
                  onFocusChange={this.onFocusChange}
                  isDayHighlighted={day1 => isDayHighlighted(day1)}
                  renderDay={day => DayComponent(day)}
                  numberOfMonths={1}
                  onPrevMonthClick={this.onPrevMonthClick}
                  onNextMonthClick={this.onNextMonthClick}
                  isFocused
                  initialVisibleMonth={() => this.currentDate}
                />
            </div>
        );

        return (
            <div className="BookableDetails relative" style={{ minHeight: '460px' }}>
                <div className="relative pb3 full-width-Cal">
                    { this.state.showCalendar && calendar()}
                </div>
                <div className="tl relative small-10">
                    <input
                      ref={this.setRef}
                      type="number"
                      placeholder="Enter price change"
                      className="mh1 mv0 pa1 small-10"
                      onChange={this.onPriceDeltaChange}
                      disabled={!this.state.showAddPriceButton}
                      value={this.state.priceValue}
                    />
                    <button
                      className={cls('white pv3 ma1 small-5 f4', (this.state.showAddPriceButton ? 'bg-green hover-bg-dark-green' : 'bg-black-10'))}
                      onClick={this.setSpecialPrice}
                      disabled={!this.state.showAddPriceButton}
                    >
                        Set Price
                    </button>
                    <button
                      className={cls('white pv3 ma1 small-5 f4', (this.state.showDeletePriceButton ? 'bg-red hover-bg-dark-red' : 'bg-black-10'))}
                      onClick={this.removeSpecialPrices}
                      disabled={!this.state.showDeletePriceButton}
                    >
                        Delete
                    </button>
                </div>
                <div className="tl relative small-10">
                    <button
                      className={cls('white pv3 ma1 small-5 f4', (this.state.showUnavailableButton ? 'bg-gray hover-bg-bark-gray' : 'bg-black-10'))}
                      onClick={this.setUnavailableDates}
                      disabled={!this.state.showUnavailableButton}
                    >
                        Unavailable
                    </button>
                    <button
                      className={cls('white pv3 ma1 small-5 f4', (this.state.showAvailableButton ? 'bg-green hover-bg-dark-green' : 'bg-black-10'))}
                      onClick={this.removeUnavailableDates}
                      disabled={!this.state.showAvailableButton}
                    >
                        Available
                    </button>
                </div>
                {
                    this.state.isLoading &&
                    <div className="absolute h-100 w-100 top-0 tc bg-black-05 pa6">
                        <Loader />
                    </div>
                }
            </div>
        );
    }
}

export default connect(
    null, {
        fetchUnvailableDates: actions.property.fetchUnvailableDates,
        updateUnvailableDates: actions.property.updateUnvailableDates,
        deleteUnavailableDates: actions.property.deleteUnavailableDates,
        fetchSpecialPrices: actions.property.fetchSpecialPrices,
        updateSpecialPrice: actions.property.updateSpecialPrice,
        deleteSpecialPrice: actions.property.deleteSpecialPrice,
        modifySpecialPrice: actions.property.modifySpecialPrice,
        fetchBookings: actions.property.fetchBookings
    }
)(BookableCalendar);

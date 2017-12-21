var EXPLORE = window.EXPLORE = EXPLORE || {};
EXPLORE.urlHelper = require('config');

window.GetJSONifNeeded = function(data) {
    try {
        if (data)
            if (typeof data == "object")
                return data;
            else
                return JSON.parse(data);
    } catch (ex) {
        console.log(ex);
    }
}

window.GetJSONstringfyifNeeded = function(data) {
    try {
        if (data)
            if (typeof data == "object")
                return JSON.stringify(data);
            else
                return data;
    } catch (ex) {
        console.log(ex);
    }
}

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};

window.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

window.parseBoolean = function(str) {
    return /true/i.test(str);
}

/**
 * Foundation datepicker specific conversion.
 * https://github.com/najlepsiwebdesigner/foundation-datepicker/blob/3fed1bc7101d37dbef89e91e5ae64c6bf11d02e1/js/foundation-datepicker.js#L552
 *
 * It seems to be using UTC to show the date, but passes the local
 * date to the `onRender` function. Hence, we need to derive a local
 * date based on the UTC UI dates in the date picker, for comparisons.
 */
function getLocalBasedOnUTC(d) {
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

function nextDate(d) {
    var x = new Date(d);
    x.setDate(x.getDate() + 1);
    return x;
}

function isDateBetween(date, start, end) {
    if (!date || !start) {
        return false;
    }

    var x = moment(date);

    if (!end) {
        return x.isSameOrAfter(start);
    }
    return x.isBetween(start, end, null, '[]');
}

window.setDatePicker = function(advance_booking_days, check_in_date, check_out_date) {
    var now = moment().startOf('day').toDate();
    var lastDate = advance_booking_days ? now.addDays(advance_booking_days) : null;

    var $ci = $('input[name=check-in]'),
        $co = $('input[name=check-out]'),
        checkin, checkout;

    checkin = $ci.fdatepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        onRender: function(date) {
            return isDateBetween(getLocalBasedOnUTC(date), now, lastDate) ? '' : 'disabled';
        }
    }).on('changeDate', function(ev) {
        checkin.hide();
        $co.focus();
    }).data('datepicker');

    checkout = $co.fdatepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        onRender: function(date) {
            var checkoutDate = nextDate(getLocalBasedOnUTC(checkin.date));
            return isDateBetween(getLocalBasedOnUTC(date), checkoutDate, lastDate) ? '' : 'disabled';
        }
    }).on('changeDate', function(ev) {
        checkout.hide();
    }).data('datepicker');

    if (check_in_date) {
        var checkInDate = moment(check_in_date, 'DD/MM/YYYY').toDate();
        checkin.update(checkInDate);
    }
    if (check_out_date) {
        var checkOutDate = moment(check_out_date, 'DD/MM/YYYY').toDate();
        checkout.update(checkOutDate);
    }
};

window.showDatePicker = function() {
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    $('.date-picker').fdatepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        onRender: function(date) {
            return date.valueOf() >= now.valueOf() ? 'disabled' : '';
        }
    }).data('datepicker');
}


Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

window._calculateAge = function(birthday) { // birthday is a date
    var dates = birthday.split("/");
    var d = new Date();
    var userday = dates[0];
    var usermonth = dates[1];
    var useryear = dates[2];
    var curday = d.getDate();
    var curmonth = d.getMonth() + 1;
    var curyear = d.getFullYear();
    var age = curyear - useryear;
    if ((curmonth < usermonth) || ((curmonth == usermonth) && curday < userday)) {
        age--;
    }
    return age;
}

window.parseDate = function(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1] - 1, mdy[2]);
}

window.daydiff = function(first, second) {
    first = parseDate(first);
    second = parseDate(second);
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

var throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

window.readImgFromFile = function(input, holderId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $(holderId).attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

window.getIdfromUrl = function(url) {
    var id = "";
    if (url) {
        id = url.split("/");

        id = id[id.length - 2];
    }
    return id;
}

window.userRequiredFieldsPresent = function(userDetails) {

    function profilePicPresent() {
        return userDetails.picture ||
            userDetails.social_profile_picture.indexOf('profile_images/default-user.jpg') === -1 ||
            userDetails.social_picture;
    }

    if (!userDetails.details.about
        || !profilePicPresent()) {
        return false;
    }

    return true;
}

window.hasDefaultEmail = function(userDetails) {
    if (userDetails.email.indexOf("example.com") === -1) {
        return false;
    }
    userDetails.email = "";
    return true;
}

function checkForLocalStorage() {
    try {
        localStorage.test = 1;
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

var getUserKey = function() {
    function getFromCookie() {
        var token = document.cookie.replace(/(?:(?:^|.*;\s*)userKey\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        if (token === 'undefined') {
            token = undefined;
        }
        return token;
    }

    if (checkForLocalStorage()) {
        return localStorage.userKey;
    }

    return getFromCookie();
};

var getToken = function() {
    var userKey = getUserKey();
    var key;

    if (userKey) {
        key = 'Token ' + userKey;
    }

    return key;
};

var deleteCookies = function() {
    var deleteCookie = function(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    var cookies = ['isLogin', 'userKey'];
    cookies.forEach(deleteCookie);
};

module.exports = {
    GetJSONifNeeded: window.GetJSONifNeeded,
    GetJSONstringfyifNeeded: window.GetJSONstringfyifNeeded,
    getIdfromUrl: window.getIdfromUrl,
    throttle: throttle,
    getToken: getToken,
    checkForLocalStorage: checkForLocalStorage,
    deleteCookies: deleteCookies,
    EXPLORE: window.EXPLORE,
    userRequiredFieldsPresent: window.userRequiredFieldsPresent,
    setDatePicker: window.setDatePicker
};

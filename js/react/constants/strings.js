export default ({
    couponMessages: {
        success: 'Coupon applied successfully.',
        invalid: 'Promo code invalid.',
        used: 'Promo code already used.',
        expired: 'Promo code expired.'
    },
    hostMenuItems: {
        properties: {
            awaiting: {
                caption: 'Awaiting Bookings',
                href: '/host'
            },
            upcoming: {
                caption: 'Upcoming Bookings',
                href: '/host/properties/upcoming'
            },
            history: {
                caption: 'Past Bookings',
                href: '/host/properties/history'
            },
            myProperties: {
                caption: 'My Listings',
                href: '/host/properties'
            }
        },
        experiences: {
            awaiting: {
                caption: 'Awaiting Day Lounges',
                href: '/host/experiences/pending'
            },
            upcoming: {
                caption: 'Upcoming Day Lounges',
                href: '/host/experiences/upcoming'
            },
            history: {
                caption: 'Past Day Lounges',
                href: '/host/experiences/history'
            },
            myExperiences: {
                caption: 'My Day Lounges',
                href: '/host/experiences'
            }
        }
    }

});

import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import './Footer.scss';
import exploreLogoImg from '../../../../images/explore-logo.png';
import messages from '../../constants/messages.js';
import DotList from '../DotList/DotList.jsx';

const communityUrl = (name) => {
    if (name.toLowerCase().trim() === 'see all') {
        return '/find-your-people';
    }
    return `/community/${name}`;
};

const Footer = (props) => {
    const { cities, groupNames, showMessageModal } = props;
    const wrapInAnchorTag = (content, i, { pathname, search = '' }) => (
        <Link
          className="f5 link no-underline white-80"
          to={{ pathname, search }}
          key={i}
        >{content} </Link>
    );

    const cityLinks = cities && cities.map((c, i) =>
        wrapInAnchorTag(c.city || c.state, i, {
            pathname: '/search',
            search: `city=${c.city}&state=${c.state}`
        })
    );

    const groupLinks = groupNames && groupNames.map((name, i) =>
        wrapInAnchorTag(name, i, { pathname: communityUrl(name) })
    );

    const showContactusMessage = () => showMessageModal(
        messages.CONTACT_US_MODAL_TITLE,
        messages.CONTACT_US_MODAL_MESSAGE
        );
    return (
        <footer className="site__footer">
            <div className="row">
                <div className="column medium-2">
                    <img src={exploreLogoImg} alt="Explore Life Traveling" />
                </div>
                <div className="column medium-10">
                    <div className="f-main-menu">
                        <nav>
                            <Link
                              className="f5 link no-underline white-80"
                              to="/about"
                            >About Us</Link>
                            <a
                              className="f5 link no-underline white-80 pl3"
                              onClick={showContactusMessage}
                            >Contact Us</a>
                            <Link
                              className="f5 link no-underline white-80 pl3"
                              to="/privacy"
                            >Privacy Policy</Link>
                            <a
                              className="f5 link no-underline white-80 pl3"
                              href="https://docs.google.com/forms/d/e/1FAIpQLSdFB1pgUa6isrn416h9mJV1KhGBpxh94JnMmtl6HVR0HBL0nw/viewform" // eslint-disable-line max-len
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                                Send Request
                            </a>
                            <Link
                              className="f5 link no-underline white-80 pl3"
                              to="/start-hosting"
                            >List Your Property</Link>
                            <a
                              className="f5 link no-underline white-80 pl3"
                              href="https://docs.google.com/forms/d/e/1FAIpQLSetTRDad5Dp7gKzlAEy5pWdN-JLPILJdlsKlG6AVUtDgSVodA/viewform" // eslint-disable-line max-len
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                                Refer a Host
                            </a>
                            <a
                              className="f5 link no-underline white-80 pl3"
                              href="https://angel.co/explorelifetraveling/jobs"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                                Careers
                            </a>
                        </nav>
                    </div>
                    <div className="footer-menu">
                        <div className="label">Cities</div>
                        <nav> <DotList list={cityLinks} /> </nav>
                    </div>
                    <div className="footer-menu">
                        <div className="label">Communities</div>
                        <nav> <DotList list={groupLinks} /> </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
};

Footer.propTypes = {
    cities: PropTypes.arrayOf(PropTypes.shape({
        city: PropTypes.string,
        state: PropTypes.string
    })),
    groupNames: PropTypes.arrayOf(PropTypes.string),
    showMessageModal: PropTypes.func
};

export default Footer;

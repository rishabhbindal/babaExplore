import React from 'react';

import { Link } from 'react-router-dom';

import './Logo.scss';
import exploreLogoImg from '../../../../images/explore-logo.png';

export default () => (
    <Link to="/" className="Logo">
        <img src={exploreLogoImg} alt="Explore Life Traveling" />
    </Link>
);

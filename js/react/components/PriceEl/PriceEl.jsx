import React, { PropTypes } from 'react';
import cls from 'classnames';

import './PriceEl.scss';

const PriceEl = ({ bold, small, large, lineThrough, price, klassName }) => {
    const defaultFontSize = (small ? 'f6' : 'f5');

    const freeClass = cls(
        'PriceEl__free',
        defaultFontSize,
        { 'f4': large }
    );
    if (price === 0) {
        return <span className={freeClass}>Free</span>;
    }

    const klass = cls(
        klassName,
        defaultFontSize,
        { 'PriceEl__price--bold': bold },
        { 'f4': large },
        { 'PriceEl--large': large },
        { strike: lineThrough }
    );
    const currClass = cls(
        'PriceEl__curr',
        defaultFontSize,
        { 'PriceEl__curr--bold': bold },
        { 'f4': large },
        { 'PriceEl__curr--top': large },
        { strike: lineThrough }
    );

    return (
        <span>
            <span className={currClass}>{price < 0 ? '-' : ''}₹</span>
            <span className={klass}>{Math.abs(price)}</span>
        </span>
    );
};

PriceEl.defaultProps = {
    bold: false,
    small: false,
    large: false,
    lineThrough: false,
    klassName: ""
};

PriceEl.propTypes = {
    bold: PropTypes.bool,
    small: PropTypes.bool,
    large: PropTypes.bool,
    lineThrough: PropTypes.bool,
    price: PropTypes.number,
    klassName: PropTypes.string
};

export default PriceEl;

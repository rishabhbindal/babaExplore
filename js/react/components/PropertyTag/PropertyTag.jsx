import React, { PropTypes } from 'react';
import './PropertyTag.scss';

const PropertyTag = ({ label }) => (<div className="PropertyTag">{ label }</div>);

PropertyTag.propTypes = {
    label: PropTypes.string
};

export default PropertyTag;

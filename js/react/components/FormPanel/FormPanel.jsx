import React, { PropTypes } from 'react';

import './FormPanel.scss';

const FormPanel = ({ children }) =>
    <div className="FormPanel">{children}</div>;

FormPanel.propTypes = {
    children: PropTypes.node
};

export default FormPanel;

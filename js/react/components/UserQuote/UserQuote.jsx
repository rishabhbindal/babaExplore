import React, { PropTypes } from 'react';

import './UserQuote.scss';

const UserQuote = ({ name, quote }) => (
    <div className="UserQuote">
        <div className="UserQuote_name">{name}</div>
        {quote}
    </div>
);
UserQuote.propTypes = {
    name: PropTypes.string,
    quote: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default UserQuote;

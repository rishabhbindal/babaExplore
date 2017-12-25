import React, { PropTypes } from 'react';

import './UserQuote.scss';

const UserQuote = ({ name, quote }) => (
    <div className="UserQuote">
        <div className="block">
            <div className="font-size-14">{name}</div>
            <div className="font-size-11">Local Host</div>
        </div>
        <div className="divider"></div>
        <div className="block quote-block">
          {quote}
        </div>
    </div>

            


);
UserQuote.propTypes = {
    name: PropTypes.string,
    quote: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default UserQuote;

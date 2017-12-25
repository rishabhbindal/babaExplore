import React, { PropTypes } from 'react';
import InputNum from 'rc-input-number';

import './ELTNumInput.scss';

/* import 'rc-input-number/assets/index.css';*/

const NumInput = ({ autoFocus, max, min, input, ...props }) => (
    <span className="ELTNumInput">
        <InputNum
          autoFocus={autoFocus}
          max={max}
          min={min}
          {...input}
          style={{
              width: 34
          }}
        />
    </span>
);

NumInput.propTypes = {
    autoFocus: PropTypes.bool,
    input: PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    max: PropTypes.number,
    min: PropTypes.number
};

export default NumInput;

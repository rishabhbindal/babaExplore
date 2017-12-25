import React, { PropTypes } from 'react';

class BottomBookingDisabledInput extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bold: PropTypes.bool
    }

    static defaultProps = {
        value: '',
        bold: false
    }

    render() {
        const { value, bold } = this.props;

        /* borderBottom: '2px solid lightgray',*/
        return (
            <input
              className="w3 input-reset"
              style={{
                  backgroundColor: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: 0,
                  padding: 0,
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: bold ? 'bold' : 'normal',
                  fontFamily: 'arial'
              }}
              type="text"
              value={value}
              disabled
            />
        );
    }
}

export default BottomBookingDisabledInput;

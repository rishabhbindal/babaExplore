import React, { PropTypes } from 'react';

class CheckIconSolid extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        bgColor: PropTypes.string,
        className: PropTypes.string,
        viewBox: PropTypes.string
    }

    static defaultProps = {
        height: 16,
        width: 16,
        bgColor: 'gray',
        style: {},
        className: '',
        viewBox: '0 0 32 32'
    }

    render() {
        const { height, width, bgColor, style, viewBox, className } = this.props;

        return (
            <svg
              fill={bgColor}
              height={height}
              width={width}
              viewBox={viewBox}
              className={className}
              xmlns="http://www.w3.org/2000/svg"
              style={style}
            >
                <path fill="#fe5459" d="M27 4l-15 15-7-7-5 5 12 12 20-20z" />
            </svg>
        );
    }
}

export default CheckIconSolid;

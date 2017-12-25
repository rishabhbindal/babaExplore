import React, { PropTypes } from 'react';

class PlusIcon extends React.Component {
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
                <path fill="#fe5459" d="M31 12h-11v-11c0-0.552-0.448-1-1-1h-6c-0.552 0-1 0.448-1 1v11h-11c-0.552 0-1 0.448-1 1v6c0 0.552 0.448 1 1 1h11v11c0 0.552 0.448 1 1 1h6c0.552 0 1-0.448 1-1v-11h11c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1z" />
            </svg>
        );
    }
}

export default PlusIcon;

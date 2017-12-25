import React, { PropTypes } from 'react';

class PinIcon extends React.Component {
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
        viewBox: '0 0 24 24'
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
                <path fill="#fff" d="M12 0c-5.512 0-10 4.488-10 10 0 1.769 0.513 3.606 1.531 5.463 0.787 1.444 1.881 2.906 3.244 4.35 2.3 2.431 4.575 3.956 4.669 4.019 0.169 0.113 0.363 0.169 0.556 0.169s0.387-0.056 0.556-0.169c0.094-0.063 2.369-1.587 4.669-4.019 1.369-1.444 2.456-2.906 3.244-4.35 1.012-1.856 1.531-3.7 1.531-5.463 0-5.512-4.488-10-10-10zM12 21.769c-1.9-1.406-8-6.356-8-11.769 0-4.413 3.588-8 8-8s8 3.588 8 8c0 5.412-6.106 10.362-8 11.769z" />
                <path fill="#fff" d="M12 6c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM12 12c-1.1 0-2-0.9-2-2s0.9-2 2-2c1.1 0 2 0.9 2 2s-0.9 2-2 2z" />
            </svg>
        );
    }
}

export default PinIcon;

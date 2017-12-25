import React, { PropTypes } from 'react';

class UploadIcon extends React.Component {
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
        viewBox: '0 0 45 45'
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
                <path d="M44.45,13.436c-0.474-0.591-1.192-0.936-1.95-0.936H40c0-1.381-1.119-2.5-2.5-2.5H35V7.5C35,6.119,33.881,5,32.5,5h-30   C1.119,5,0,6.119,0,7.5v30C0,38.881,1.119,40,2.5,40h5h11.859v-8.919h-3.125c-0.505,0-0.961-0.306-1.155-0.771   c-0.193-0.469-0.086-1.006,0.271-1.362l8.75-8.749c0.487-0.488,1.278-0.488,1.769,0l8.75,8.75c0.356,0.357,0.464,0.895,0.271,1.361   s-0.648,0.771-1.154,0.771h-3.125V40H32.5h5c1.172,0,2.188-0.814,2.439-1.958l5-22.5C45.105,14.802,44.925,14.027,44.45,13.436z    M32.5,10H30c-1.381,0-2.5,1.119-2.5,2.5h-15c-1.172,0-2.187,0.814-2.44,1.958l-5,22.5C5.02,37.139,5.002,37.32,5.002,37.5H2.5v-30   h30V10z" fill="#D80027" />
            </svg>
        );
    }
}

export default UploadIcon;

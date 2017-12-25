import React, { PropTypes } from 'react';

class LoaderIcon extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        bgColor: PropTypes.string
    }

    static defaultProps = {
        height: 16,
        width: 16,
        bgColor: 'gray'
    }

    render() {
        return (
            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#000" className="Loader__svg">
                <title>Circular Progress</title>
                <g fill="none" fillRule="evenodd">
                    <g strokeWidth="4">
                        <circle
                          id="loader-oval"
                          cx="22"
                          cy="22"
                          r="20"
                          strokeOpacity="0.15"
                          strokeMiterlimit="10"
                          strokeWidth="4"
                        />
                        <path
                          id="loader-arc"
                          d="M348.037,247.074a20,20,0,0,1,20,20"
                          transform="translate(-326.037 -245.074)"
                          strokeLinecap="round"
                          strokeMiterlimit="10"
                          strokeWidth="4"
                        />
                    </g>
                </g>
            </svg>
        );
    }
}

export default LoaderIcon;

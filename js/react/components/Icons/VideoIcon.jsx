import React, { PropTypes } from 'react';

class VideIcon extends React.Component {
    static propTypes = {
        bgColor: PropTypes.string
    }

    static defaultProps = {
        bgColor: 'gray'
    }

    render() {
        const { bgColor } = this.props;

        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <g>
                    <path fill={bgColor} d="M48,37.5454545 L48,11.3636364 C48,8.96363636 46.0363636,7 43.6363636,7 L4.36363636,7 C1.96363636,7 0,8.96363636 0,11.3636364 L0,37.5454545 C0,39.9454545 1.96363636,41.9090909 4.36363636,41.9090909 L43.6363636,41.9090909 C46.0363636,41.9090909 48,39.9454545 48,37.5454545 Z" />
                    <polygon fill="white" points="18 13.5 18 34.5 34.5 24" />
                </g>
            </svg>
        );
    }
}

export default VideIcon;

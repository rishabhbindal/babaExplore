import React, { PropTypes } from 'react';

class PhotoIcon extends React.Component {
    static propTypes = {
        bgColor: PropTypes.string
    }

    static defaultProps = {
        bgColor: 'gray'
    }

    render() {
        const { bgColor } = this.props;

        return (
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M4 8h16v10H4z" fill="currentColor" />
                <path fill={bgColor} d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z" />
            </svg>
        );
    }
}

export default PhotoIcon;

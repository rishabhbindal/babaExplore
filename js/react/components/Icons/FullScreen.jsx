import React, { PropTypes } from 'react';

class FullScreen extends React.Component {
    static propTypes = {
        bgColor: PropTypes.string
    }

    static defaultProps = {
        bgColor: 'gray'
    }

    render() {
        const { bgColor } = this.props;

        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                <path
                  fill={bgColor}
                  d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"
                />
            </svg>
        );
    }
}

export default FullScreen;

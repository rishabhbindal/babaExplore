import React, { PropTypes } from 'react';

class Minimise extends React.Component {
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
                  d="M3 12.5h2.5V15H7v-4H3v1.5zm2.5-7H3V7h4V3H5.5v2.5zM11 15h1.5v-2.5H15V11h-4v4zm1.5-9.5V3H11v4h4V5.5h-2.5z"
                />
            </svg>
        );
    }
}

export default Minimise;

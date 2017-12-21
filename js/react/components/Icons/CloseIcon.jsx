import React, { PropTypes } from 'react';

class CloseIcon extends React.Component {
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
                <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
            </svg>
        );
    }
}

export default CloseIcon;

import React, { PropTypes } from 'react';

class Image extends React.Component {
    static propTypes = {
        circle: PropTypes.bool,
        small: PropTypes.string,
        medium: PropTypes.string,
        large: PropTypes.string,
        caption: PropTypes.string,
        preferred: PropTypes.oneOf(['small', 'large', 'medium']),
        width: PropTypes.number,
        height: PropTypes.number
    }
    static defaultProps = {
        circle: false,
        small: null,
        medium: null,
        large: null,
        caption: '',
        preferred: 'small',
        width: 45,
        height: null
    }

    render() {
        const { small, medium, large, caption, preferred } = this.props;
        const { width, height, circle } = this.props;

        if (!small && !medium && !large) {
            return null;
        }

        const style = {
            width,
            height: height || width
        };

        if (circle) {
            Object.assign(style, {
                height: width,
                borderRadius: width,
                left: -width / 2,
                top: -width / 2
            });
        }

        return (
            <img
              style={style}
              className="Image"
              src={this.props[preferred] || small || medium || large}
              alt={caption}
            />
        );
    }
}

export default Image;

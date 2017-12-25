import React, { PropTypes } from 'react';

class IsNotDisplayNone extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string
    }

    static defaultProps = {
        className: ''
    }

    state = {
        isVisible: false
    }

    componentDidMount() {
        if (this.el && !!this.el.offsetParent) {
            this.setState({ isVisible: true });
        }
    }

    componentDidUpdate() {
        if (this.el && !!this.el.offsetParent && !this.state.isVisible) {
            this.setState({ isVisible: true });
        }
    }

    render() {
        return (
            <div className={this.props.className} ref={(el) => { this.el = el; }}>
                {this.state.isVisible && this.props.children}
            </div>
        );
    }
}

export default IsNotDisplayNone;

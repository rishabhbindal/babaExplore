import React, { PropTypes } from 'react';
import getScript from '../lib/getScript.js';

class ScriptLoader extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        id: PropTypes.string.isRequired,
        onLoad: PropTypes.bool,
        src: PropTypes.string.isRequired
    }

    static defaultProps = {
        onLoad: false
    }

    state = {
        done: false
    }

    componentWillMount() {
        const { src, id } = this.props;

        if (process.env.ELT_IS_NOT_BROWSER === 'true') {
            return;
        }

        if (document.getElementById(id)) {
            this.setState({ done: true });
            return;
        }

        const onLoad = this.props.onLoad ? () => this.setState({ done: true }) : () => {};
        getScript({ src, id, onLoad });
    }

    render() {
        if (this.state.done) {
            return this.props.children || null;
        }

        return null;
    }
}

export default ScriptLoader;

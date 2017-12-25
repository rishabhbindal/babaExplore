import React, { PropTypes } from 'react';
import getScript from '../lib/getScript.js';

class GoogleMapLoader extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    state = {
        done: false
    }

    componentWillMount() {
        if (process.env.ELT_IS_NOT_BROWSER === 'true') {
            return;
        }

        const id = 'elt_google_map';
        if (document.getElementById(id)) {
            this.setState({ done: true });
            return;
        }

        const callbackFnName = `mapLoadCallback${Math.round(Math.random() * 1000)}`;
        window[callbackFnName] = () => {
            this.setState({ done: true });
            window[callbackFnName] = null;
        };

        const src = `https://maps.googleapis.com/maps/api/js?key=${process.env.ELT_MAP_API_KEY}&callback=${callbackFnName}&libraries=places`;
        getScript({ src, id });
    }

    render() {
        if (this.state.done) {
            return this.props.children;
        }

        return null;
    }
}

export default GoogleMapLoader;

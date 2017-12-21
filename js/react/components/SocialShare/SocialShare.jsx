import React, { PropTypes } from 'react';

import './SocialShare.scss';
import ScriptLoader from '../ScriptLoader.jsx';

/* import fb from './fb.svg';*/
class SocialShare extends React.Component {
    static propTypes = {
        title: PropTypes.string
    }

    static defaultProps = {
        title: null
    }

    componentDidMount() {
        window.a2a_config = { icon_color: 'transparent' };
    }

    render() {
        const { title } = this.props;

        /* eslint-disable jsx-a11y/anchor-has-content */
        return (
            <div style={{ minHeight: '3rem' }} >
                <ScriptLoader
                  id="addtoany_script"
                  src="//static.addtoany.com/menu/page.js"
                  onLoad
                />
                <div
                  className="SocialShare a2a_kit a2a_kit_size_32 a2a_default_style"
                  data-a2a-title={title}
                >
                    <a className="SocialShare__button a2a_button_facebook" />
                    <a className="SocialShare__button a2a_button_twitter" />
                    <a className="SocialShare__button a2a_button_whatsapp" />
                    <a className="SocialShare__button a2a_button_google_plus" />
                    <a className="SocialShare__button a2a_button_email" />
                </div>
            </div>
        );
        /* eslint-enable jsx-a11y/anchor-has-content */
    }
}

export default SocialShare;

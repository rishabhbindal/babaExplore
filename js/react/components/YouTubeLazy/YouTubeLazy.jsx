import React, { PropTypes } from 'react';

import getYoutubeVideoId from '../../lib/getYoutubeVideoId.js';

import './YouTubeLazy.scss';

class YouTubeLazy extends React.Component {
    static propTypes = {
        url: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);
        this.onPlayClick = this.onPlayClick.bind(this);
        this.state = {
            ytid: null,
            iframe: null
        };
    }

    componentWillMount() {
        const { url } = this.props;
        const ytid = getYoutubeVideoId(url);

        this.setState({ ytid });
    }

    onPlayClick() {
        this.setState({ iframe: true });
    }

    render() {
        const { ytid, iframe } = this.state;

        const source = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;

        if (iframe) {
            const src = `https://www.youtube.com/embed/${this.state.ytid}?rel=0&showinfo=0&autoplay=1&frameborder=0&modestbranding=1`;
            return (
                <div className="youtube">
                    <iframe
                      width="100%"
                      src={src}
                      frameBorder="0"
                      allowFullScreen
                    />
                </div>
            );
        }

        return (
            <div className="youtube YouTubeLazy" onClick={this.onPlayClick}>
                { source && <img src={source} alt="test" />}
                <div className="play-button" />
            </div>
        );
    }
}

export default YouTubeLazy;

import React, { PropTypes } from 'react';

/**
 * Mostly copied from `trimText` in main.es6.js
 */
const truncateText = (text = '', limit = 80) => {
    const trex = `^(.{${limit}}[^\\s]*).*`;
    const ttxt = text.replace(/<[^>]+>/gm, '')
        .replace(/\r?\n|\r/g, '')
        .replace(new RegExp(trex), '$1');
    return `${ttxt} `;
};


class TruncatedText extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        limit: PropTypes.number,
        quoted: PropTypes.bool
    }

    static defaultProps = {
        text: '',
        limit: 120,
        quoted: false
    }

    constructor(props) {
        super(props);
        this.showAll = this.showAll.bind(this);
        this.state = {
            showAll: false
        };
    }
    showAll() {
        this.setState({ showAll: true });
        return false;
    }
    render() {
        const { text, limit, quoted } = this.props;
        const dontTruncate = this.state.showAll || text.length <= limit;
        const showTxt = {
            __html: (dontTruncate ? text : truncateText(text, limit))
        };

        return (
            <span>
                {text.length && quoted && showTxt ? <q dangerouslySetInnerHTML={showTxt} ></q> : <span  dangerouslySetInnerHTML={showTxt} ></span>}
                <a
                  onClick={this.showAll}
                  style={{ display: dontTruncate ? 'none' : 'inline', fontWeight: 'bold' }}
                >
                    read more
                </a>
            </span>
        );
    }
}

export default TruncatedText;

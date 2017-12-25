import React, { PropTypes } from 'react';
import cls from 'classnames';

import './DotList.scss';

const minItems = 4;

class DotList extends React.Component {
    static propTypes = {
        list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
        italic: PropTypes.bool
    }

    static defaultProps = {
        list: [],
        italic: false
    }

    render() {
        const { list } = this.props;

        if (!Array.isArray(list) || !list.length) {
            return null;
        }

        const entryClass = cls('ttc DotList__entry', {
            'DotList__entry--italic': this.props.italic
        });

        const showMore = list.length > minItems && !(this.state && this.state.showMore);

        let items = list;
        if (!(this.state && this.state.showMore)) {
            items = items.slice(0, minItems);
        }

        return (
            <ul className="list pl0 ma0">
                {items.map((e, i) => <li key={i} className={entryClass}>{e}</li>)}
                { showMore && <li className={entryClass}>
                    <button
                      className="f5 link no-underline white-80 pointer"
                      onClick={() => this.setState({ showMore: true })}
                    >
                        + more
                    </button>
                </li> }
            </ul>
        );
    }
}

export default DotList;

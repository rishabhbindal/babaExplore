import React, { PropTypes } from 'react';
import Truncate from 'react-truncate';
import Button from '../Button/Button.jsx';

class TruncateTextBetter extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        lines: PropTypes.number,
        quoted: PropTypes.bool,
        reset: PropTypes.bool
    }

    static defaultProps = {
        text: null,
        lines: 1,
        quoted: false,
        reset: false
    }

    constructor(props) {
        super(props);
        this.showMore = this.showMore.bind(this);
        this.showLess = this.showLess.bind(this);
        this.state = {
            showMore: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.reset && nextProps.reset) {
            this.showLess();
        }
    }

    showMore() {
        this.setState({ showMore: true });
    }

    showLess() {
        this.setState({ showMore: false });
    }

    render() {
        const { lines, text } = this.props;

        if (this.state.showMore) {
            return (
                <div>
                    {text}
                    <Button plain onClick={this.showLess}>Show less</Button>
                </div>
            );
        }

        return (
            <Truncate
              lines={lines}
              ellipsis={<span>... <Button plain onClick={this.showMore}>Show more</Button></span>}
            >
                {text}
            </Truncate>
        );
    }
}

export default TruncateTextBetter;

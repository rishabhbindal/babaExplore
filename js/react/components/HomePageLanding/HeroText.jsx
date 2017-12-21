import React, { PropTypes } from 'react';

import ReactTimeout from 'react-timeout';

class HeroText extends React.Component {

    static propTypes = {
        changeHeroText: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.changeHeroText = this.changeHeroText.bind(this);

        this.state = {
            currentIndex: 0,
            heroText: []
        };
    }
    componentDidMount() {
        this.props.setInterval(this.changeHeroText, 3000);
    }

    changeHeroText() {
        const { text } = this.props;
        let { currentIndex } = this.state;
        if (currentIndex == text.length) { currentIndex = 0; }
        const _text = text[currentIndex++];

        this.setState({
            currentIndex,
            heroText: _text.split(' ')
        });
    }

    render() {
        const { heroText } = this.state;

        return (
            <div>
                {
          heroText.length > 0 && heroText.map((text, id) => (
              <h1 key={id}>{ text }</h1>
          ))
        }
            </div>
        );
    }
}

export default ReactTimeout(HeroText);

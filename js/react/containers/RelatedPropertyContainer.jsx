import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { appState, appActions } from '../reducers';
import { eventPropertyType } from '../data-shapes/property.js';

import PropertyImagesCollage from '../components/PropertyImagesCollage/PropertyImagesCollage.jsx';
import ELTSlider from '../components/ELTSlider/ELTSlider.jsx';
import TruncateTextBetter from '../components/TruncateTextBetter/TruncateTextBetter.jsx';

const mapStateToProps = (state, { propCodes }) => {
    const relatedProperties = propCodes.map(code =>
        appState.property.getProperty(state, code)).filter(p => p);
    return { relatedProperties };
};

class RelatedPropertyContainer extends React.Component {
    static defaultProps = {
        propCodes: [],
        titleText: '',
        link: '',
        relatedProperties: []
    };

    static propTypes = {
        propCodes: PropTypes.arrayOf(PropTypes.string),
        relatedProperties: PropTypes.arrayOf(eventPropertyType),
        titleText: PropTypes.string,
        link: PropTypes.string,
        fetchProperty: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { fetchProperty, propCodes } = this.props;
        propCodes.forEach(code => fetchProperty(code));
    }

    render() {
        const { relatedProperties, titleText, link } = this.props;

        if (!relatedProperties.length) {
            return null;
        }

        return (<div>
            <h6 className="mb3" style={{ minHeight: '3rem' }}>
                {titleText}
            </h6>
            <ELTSlider>
                { relatedProperties.map((prop) => {
                    const { caption } = prop;
                    return (
                        <div>
                            <h5>
                                {caption}
                            </h5>
                            <div className="dib w-100">
                                <Link to={`/${link}/${prop.code}`}>
                                    <PropertyImagesCollage property={prop} />
                                </Link>
                            </div>
                            <p className="h4 overflow-scroll">
                                <TruncateTextBetter text={prop.character} lines={4} />
                            </p>
                        </div>
                    );
                }) }
            </ELTSlider>
        </div>);
    }
}

export default connect(mapStateToProps, {
    fetchProperty: appActions.property.fetchProperty
})(RelatedPropertyContainer);

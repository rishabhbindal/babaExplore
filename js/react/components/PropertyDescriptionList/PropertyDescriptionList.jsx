import React, { PropTypes } from 'react';
import PropertyDescriptionItem from '../PropertyDescriptionItem/PropertyDescriptionItem.jsx';
import './PropertyDescriptionList.scss';

class PropertyDescriptionList extends React.Component {
    static propTypes = {
        descriptionList: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired
        })),
        updateDescription: PropTypes.func.isRequired,
        isEditable: PropTypes.bool
    };

    static defaultProps = {
        isEditable: false
    };

    constructor(props) {
        super(props);
        this.state = {
            showListEnabled: false
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(e, index) {
        const { updateDescription } = this.props;
        updateDescription(e.target.name, e.target.value, index);
    }

    showList = () => {
        this.setState({
            showListEnabled: true
        });
    }

    dropDownOnChange(key) {
        this.setState({
            policyDescription: key
        });
    }

    render() {
        const { descriptionList, isEditable } = this.props;
        const lstStyle = {};
        if (this.state.showListEnabled) {
            lstStyle.display = 'block';
        }

        return (
            <div className="PropertyDescriptionList">
                <div
                  className="PropertyDescriptionList__list"
                >
                    <PropertyDescriptionItem
                      {...this.props}
                      description={descriptionList[0]}
                      isEditable={isEditable}
                      index={0}
                      onChange={this.onChange}
                    />


                    <button
                      onClick={this.showList}
                      className="PropertyDescriptionList__show"
                      style={this.state.showListEnabled ? { display: 'none' } : {}}
                    >
                        + Show more details
                    </button>

                    <div
                      className="PropertyDescriptionList__list-more"
                      style={lstStyle}
                    >
                        {
                            descriptionList.map((description, index) => (
                                index > 0 &&
                                <PropertyDescriptionItem
                                  {...this.props}
                                  description={description}
                                  key={description.title}
                                  index={index}
                                  onChange={this.onChange}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default PropertyDescriptionList;

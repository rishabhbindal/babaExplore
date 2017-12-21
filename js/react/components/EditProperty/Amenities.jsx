import React, { PropTypes } from 'react';
import cls from 'classnames';

import propertyConfig from '../../constants/property.js';
import CloseIcon from '../Icons/CloseIcon.jsx';
import PlusIcon from '../Icons/PlusIcon.jsx';
import DotList from '../DotList/DotList.jsx';

class Amenities extends React.Component {
    static propTypes = {
        list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
        isEditable: PropTypes.bool,
        updateAmenities: PropTypes.func.isRequired
    };

    static defaultProps = {
        list: [],
        isEditable: false
    };

    constructor(props) {
        super(props);

        this.state = {
            list: props.list.map(amenity => amenity)
        };
        this.inputElem = null;

        this.onChange = this.onChange.bind(this);
        this.removeAmenity = this.removeAmenity.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.setRef = this.setRef.bind(this);
    }


    onAdd() {
        this.addAmenity();
    }

    onChange(e) {
        const { updateAmenities } = this.props;
        updateAmenities(e.target.value);
    }

    setRef(input) {
        this.inputElem = input;
    }

    addAmenity() {
        if (this.inputElem.value === '') {
            return;
        }
        const { updateAmenities } = this.props;
        const list = this.state.list;
        list.push(this.inputElem.value);
        updateAmenities(this.inputElem.value);
        this.setState({ list });
        this.inputElem.value = '';
    }

    removeAmenity(amenity) {
        const { updateAmenities } = this.props;
        const { list } = this.state;
        updateAmenities(amenity, false);
        list.splice(list.indexOf(amenity), 1);
        this.setState({ list });
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.addAmenity();
            return false;
        }
        return true;
    }

    render() {
        const { isEditable } = this.props;
        const { list } = this.state;

        if (!isEditable) {
            return <DotList list={list} italic />;
        }

        const entryClass = cls('ba b--black-10 bg-black-05 br4 list f5 relative dib lh-copy-l pl3 ma1 pr3', {
            pr4: isEditable
        });

        return (
            <div>
                {
                    isEditable &&
                    <div className="ma0">
                        <input
                          ref={this.setRef}
                          onKeyPress={this.handleKeyPress}
                          placeholder={`Add amenities ( max ${propertyConfig.amenityText.max} characters)`}
                          className="mv1 w-70 pa1 w-third-ns f6"
                          maxLength={propertyConfig.amenityText.max}
                        />
                        <button
                          className="ba bg-white hover-bg-light-white ml0 mr2 pa0 f6 br0 bl-0 b--black-30 pointer"
                          onClick={this.onAdd}
                          style={{ fontSize: '12px', height: '28px', width: '36px', lineHeight: '28px' }}
                        >
                            <PlusIcon style={{ width: '12px', height: '12px' }} />
                        </button>
                    </div>
                }
                <ul className="list pl0 ma0">
                    {
                        list.map((amenity, i) => (
                            <li key={i} className={entryClass}>
                                {amenity}
                                {
                                    isEditable &&
                                    <button
                                      onClick={() => this.removeAmenity(amenity)}
                                      className="absolute normal f5 right-1 pointer"
                                      style={{ top: '4px', color: '#5e5d5a', right: '5px' }}
                                    >
                                        <CloseIcon style={{ width: '16px', height: '16px' }} />
                                    </button>
                                }
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}

export default Amenities;

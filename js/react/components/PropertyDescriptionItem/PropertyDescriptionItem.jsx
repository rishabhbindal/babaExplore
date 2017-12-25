import React, { PropTypes } from 'react';
import cls from 'classnames';
import Dropdown from '../Dropdown/Dropdown.jsx';
import propertyConst from '../../constants/property.js';
import { eventPropertyType } from '../../data-shapes/property.js';

class PropertyDescriptionItem extends React.Component {
    static propTypes = {
        property: eventPropertyType.isRequired,
        updatePolicy: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        isEditable: PropTypes.bool,
        index: PropTypes.number
    };

    static defaultProps = {
        isEditable: false,
        index: 0
    };

    constructor(props) {
        super(props);
        const { property, cancellationPolicies } = this.props;
        this.state = {};

        this.dropDownOnChange = this.dropDownOnChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const { cancellationPolicies, property } = this.props;
        if (!cancellationPolicies && nextProps.cancellationPolicies) {
            const policy = nextProps.cancellationPolicies.filter(policy => policy.name === property.cancellationPolicy)[0];
            this.setState({ policyDescription: policy.details });
        }
    }

    dropDownOnChange = (value) => {
        const { cancellationPolicies, updatePolicy } = this.props;
        const obj = cancellationPolicies.filter(policy => policy.name === value)[0];
        this.setState({ policyDescription: obj.details });
        updatePolicy(value);
    }

    policyKeys = () => {
        const { cancellationPolicies } = this.props;
        return cancellationPolicies.map(obj => obj.name);
    }

    render() {
        const { property, description, isEditable, index, onChange } = this.props;
        const { title, content } = description;

        const editField = () => (
            title !== propertyConst.descriptionKeys.cancellationPolicy ?
            (
                <textarea
                  className="b--black-10 "
                  name={title}
                  rows="4"
                  defaultValue={content}
                  onChange={e => onChange(e, index)}
                />
            ) : (
                <div>
                    <Dropdown
                      id="myDropdown"
                      options={this.policyKeys()}
                      selected={property.cancellationPolicy}
                      labelField="description"
                      onChange={this.dropDownOnChange}
                    />
                    <p>{this.state.policyDescription}</p>
                </div>
            )
        );

        return (
            <div key={title} className="PropertyDescription pt2">
                <div className={cls('b-black pa2 pt3 relative', { ba: isEditable })} >
                    <h6 className={cls('bg-white ph2 normal', isEditable && 'absolute')} style={{ top: '-10px' }}>{title}</h6>
                    {
                        isEditable ? editField() : (<p className="PropertyDescription__text ph2">{content}</p>)
                    }
                </div>
            </div>
        );
    }
}

export default PropertyDescriptionItem;

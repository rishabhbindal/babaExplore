import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import uuid from 'uuid';
import cls from 'classnames';

class ButtonCheckboxField extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        isChecked: PropTypes.bool,
        name: PropTypes.string.isRequired,
        normalize: PropTypes.func,
        selectedLabel: PropTypes.string,
        unselectedLabel: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }

    static defaultProps = {
        id: null,
        normalize: v => v,
        isChecked: false,
        selectedLabel: 'Chosen',
        unselectedLabel: 'Choose'
    }

    componentWillMount() {
        this.fieldId = uuid.v4();
    }

    render() {
        const { name, normalize, isChecked, id, unselectedLabel, selectedLabel, onChange } = this.props;

        const buttonCls = 'f6 b link ph2 pv2 mb2 dib white flex items-center shadow-hover bg-animate';

        return (
            <div className="ButtonCheckboxField w-100">
                <div className="flex items-center mb2">
                    <Field
                      className="absolute o-0"
                      style={{ zIndex: -1 }}
                      id={id || this.id}
                      name={name}
                      normalize={normalize}
                      component="input"
                      type="checkbox"
                      onChange={onChange}
                    />
                    <label
                      className="w-100 ma0"
                      style={{ margin: 0 }}
                      htmlFor={id || this.id}
                    >
                        {!isChecked ?
                            (
                                <div className={cls(buttonCls, 'bg-red hover-bg-light-red')}>
                                    <div className="w1 h1 bg-white mr2 br-100" />
                                    {unselectedLabel}
                                </div>
                            ) : (
                                <div className={cls(buttonCls, 'bg-green hover-bg-green relative')}>
                                    <div className="h1 w1 mr2 bg-white relative br-100">
                                        <div
                                          className="absolute ba b--green"
                                          style={{
                                              left: 6,
                                              top: 2,
                                              width: 5,
                                              height: 10,
                                              borderWidth: '0 2px 2px 0',
                                              transform: 'rotate(45deg)'
                                          }}
                                        />
                                    </div>
                                    {selectedLabel}
                                </div>
                            )
                        }
                    </label>
                </div>
            </div>
        );
    }
}

export default ButtonCheckboxField;

import React, { PropTypes } from 'react';
import { Field } from 'redux-form';

import UserAvatar from '../../UserAvatar/UserAvatar.jsx';

import { userPropType } from '../../../data-shapes/user.js';

import './ProfilePicField.scss';

class FileInput extends React.Component {
    render() {
        const { input, setRef, onPicSelect, meta: { error, touched } } = this.props;
        return (
            <div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => onPicSelect(e, input.onChange)}
                  ref={(ref) => { setRef(ref); }}
                />
                <div className="FileInput__error">
                    {touched && error}
                </div>
            </div>
        );
    }
}
FileInput.propTypes = {
    input: PropTypes.object,
    setRef: PropTypes.func,
    onPicSelect: PropTypes.func,
    meta: PropTypes.shape({
        error: PropTypes.string,
        touched: PropTypes.bool
    })
};

class ProfilePicField extends React.Component {
    static propTypes = {
        userData: userPropType
    }

    constructor(props) {
        super(props);
        this.setRef = this.setRef.bind(this);
        this.showSelect = this.showSelect.bind(this);
        this.fileInputField = this.fileInputField.bind(this);
        this.onPicSelect = this.onPicSelect.bind(this);
        this.setPreviewUrl = this.setPreviewUrl.bind(this);

        this.state = { imagePreviewUrl: null };
    }

    componentDidMount() {
        const { userData } = this.props;
        this.setPreviewUrl(userData);
    }

    componentWillReceiveProps(nextProps) {
        const { userData } = nextProps;
        this.setPreviewUrl(userData);
    }

    componentWillUnmount() {
        this.inputElem = null;
    }

    onPicSelect(e, onChange) {
        const { submitOnChange, onSubmit } = this.props;
        e.preventDefault();
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        onChange(file);

        reader.onloadend = () => {
            this.setState({ imagePreviewUrl: reader.result });
            if (submitOnChange) {
                onSubmit({picture: file});
            }
        };

        reader.readAsDataURL(file);
    }

    setPreviewUrl(userData) {
        if (!this.state.imagePreviewUrl && userData.profilePic.indexOf('default-user') === -1) {
            this.setState({ imagePreviewUrl: userData.profilePic });
        }
    }

    setRef(ref) {
        this.inputElem = ref;
    }

    showSelect() {
        this.inputElem.click();
    }

    fileInputField(props) {
        return (
            <FileInput
              {...props}
              setRef={this.setRef}
              onPicSelect={this.onPicSelect}
            />
        );
    }

    render() {
        const { userData, extralarge } = this.props;
        const picCover = !this.state.imagePreviewUrl && (
            <div className="ProfilePicField__overlay">
                Add photo
            </div>
        );

        const size = extralarge ? 'extralarge' : 'large';

        return (
            <div>
                <UserAvatar
                  img={this.state.imagePreviewUrl || 'images/user@2x.jpg'}
                  desc={userData.name}
                  size={size}
                  onClick={this.showSelect}
                >
                    {picCover}
                </UserAvatar>

                <Field
                  type="file"
                  component={this.fileInputField}
                  name="picture"
                />
            </div>
        );
    }
}


export default ProfilePicField;

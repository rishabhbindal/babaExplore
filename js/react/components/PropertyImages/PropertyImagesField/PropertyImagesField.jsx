import React, { PropTypes } from 'react';
import { Field } from 'redux-form';

// import './PropertyImagesField.scss';
import PlusIcon from '../../Icons/PlusIcon.jsx';
import UploadIcon from '../../Icons/UploadIcon.jsx';

const FileInput = (props) => {
    const { input, setRef, onPicSelect, meta: { error, touched } } = props;
    return (
        <div style={{ visibility: 'hidden' }}>
            <input
              type="file"
              accept="image/*"
              // style={{ display: 'none' }}
              multiple="true"
              onChange={e => onPicSelect(e, input.onChange)}
              ref={(ref) => { setRef(ref); }}
            />
            <div className="FileInput__error">
                {touched && error}
            </div>
        </div>
    );
};

FileInput.propTypes = {
    input: PropTypes.object.isRequired,
    setRef: PropTypes.func.isRequired,
    onPicSelect: PropTypes.func.isRequired,
    meta: PropTypes.shape({
        error: PropTypes.string,
        touched: PropTypes.bool
    }).isRequired
};

class PropertyImagesField extends React.Component {
    static propTypes = {
        // userData: userPropType
        addImageFile: PropTypes.func.isRequired,
        resetImageFiles: PropTypes.func.isRequired,
        setUpdateCount: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.setRef = this.setRef.bind(this);
        this.fileInputField = this.fileInputField.bind(this);
        this.onPicSelect = this.onPicSelect.bind(this);
        this.onClick = this.onClick.bind(this);

        this.state = { imagePreviewUrl: null, selectedCount: 0 };
    }

    componentWillUnmount() {
        this.inputElem = null;
    }

    onPicSelect(e, onChange) {
        const { setUpdateCount } = this.props;
        e.preventDefault();

        const files = e.target.files;
        const { resetImageFiles } = this.props;

        if (files.length === 0) {
            this.setState({ selectedCount: 0 });
            return;
        }
        resetImageFiles();
        onChange(files);

        const length = files.length;
        setUpdateCount(length);
        for (let i = 0; i < length; i += 1) {
            this.readAndLoadFile(files[i], i);
        }
        this.setState({ selectedCount: length });
    }

    onClick() {
        if (this.inputElem) {
            this.inputElem.click();
        }
    }

    setRef(ref) {
        this.inputElem = ref;
    }

    readAndLoadFile(file, index) {
        /* global FileReader */
        const reader = new FileReader();
        const { addImageFile } = this.props;
        reader.onloadend = () => {
            addImageFile(file, index);
        };
        reader.readAsDataURL(file);
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
        return (
            <div className="relative" onClick={this.onClick} role="presentation">
                <div className="aspect-ratio aspect-ratio--16x9">
                    <div className="db bg-black-10 bg-center cover aspect-ratio--object text-center flex justify-center items-center">
                        <div style={{ height: '40px' }}>
                            <PlusIcon style={{ width: '40px' }} />
                            <p className="ma0">ADD</p>
                            <Field
                              type="file"
                              component={this.fileInputField}
                              name="property-images"
                            />
                        </div>
                    </div>
                    {
                        this.state.selectedCount > 0 &&
                        <div
                          className="absolute br-100 bw1 z-9999"
                          style={{ width: '30px', height: '30px', right: '5px', top: '5px' }}
                          title={`${this.state.selectedCount} files selected`}
                        >
                            <UploadIcon style={{ width: '16px', margin: '0px' }} />
                            <div
                              className="w-100 h-100 absolute top-0 f6"
                              style={{ width: '16px', height: '16px', margin: '0px 0px 0px 17px' }}
                            >
                                {this.state.selectedCount}
                            </div>
                        </div>
                    }

                </div>
            </div>
        );
    }
}


export default PropertyImagesField;

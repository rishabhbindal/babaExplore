import React, { PropTypes } from 'react';
import cls from 'classnames';
import { Field } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

import userImg from '../../../../images/user@2x.jpg';

/**
 * @see https://github.com/erikras/redux-form/issues/71
 */
class FileInput extends React.Component {
    static propTypes = {
        input: PropTypes.shape({
            value: PropTypes.object,
            onChange: PropTypes.func
        })
    }

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { input: { onChange } } = this.props;
        onChange(e.target.files[0]);
    }

    render() {
        const { input: { value } } = this.props;

        return (
            <input
              type="file"
              accept="image/*"
              value={value}
              onChange={this.onChange}
            />
        );
    }
}

const SignupPic = (props) => {
    const { handleSubmit, submitFailed, submitError, gotoPage } = props;
    const { submitting, pristine, invalid } = props;
    const startOver = (e) => {
        e.preventDefault();
        gotoPage(1);
    };

    const buttonText = submitFailed ? 'Goto first step' : 'Create Profile';
    const heading = submitFailed ? 'ERROR' : 'Smile! You’re ready';
    const message = submitFailed ? submitError :
        'Just need a picture of your pretty face—your face,' +
            'not your cat, and a close-up is best.';

    const submitField = (
        <div>
            <label className="avatar large-avatar" htmlFor="avatar">
                <div className="image">
                    <img src={userImg} alt="" />
                    <div className="overlay">
                        <span>Add photo</span>
                    </div>
                </div>
            </label>
            <Field
              type="file"
              name="picture"
              component={FileInput}
            />
        </div>
    );

    return (
        <form onSubmit={submitFailed ? startOver : handleSubmit}>
            <h6>{heading}</h6>
            <p>{message}</p>
            { !submitFailed && submitField }

            <ButtonLoader
              expanded
              showSpinner={submitting}
              size="large"
              type="submit"
            >
                {buttonText}
            </ButtonLoader>
        </form>
    );
};


export default SignupPic;

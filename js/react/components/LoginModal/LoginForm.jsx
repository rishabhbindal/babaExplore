import React from 'react';
import { Field, reduxForm } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import FBLoginButtonContainer from '../../containers/FBLoginButtonContainer.jsx';
import InputField from '../InputField/InputField.jsx';
import {
    createValidator,
    emailValidation,
    textValidation
} from '../../lib/validations.js';

const LoginForm = (props) => {
    const { handleSubmit, submitting, loginFailed,
            loginErrorMessage, shouldRedirectAfterSignup, showForgotPassword
    } = props;
    const error = loginFailed ? loginErrorMessage : '';
    return (
        <div>
            <div className="mt2 w-50" style={{ margin: 'auto' }}>
                <FBLoginButtonContainer buttonText="Facebook Login" />
            </div>
            <div
              className="w-100 tc mv4"
              style={{
                  position: 'relative',
                  border: '1px solid #ffbcbd'
              }}
            >
                <span className="tc Login-modal-separator">or</span>
            </div>
            <form onSubmit={handleSubmit} className="pa4 pv0">
                <fieldset className="mb2">
                    <Field
                      component={InputField}
                      type="email"
                      name="email"
                      varient="signin-modal"
                      placeholder="Email"
                      normalize={val => val && val.trim()}
                      align="left"
                    />
                    <Field
                      component={InputField}
                      type="password"
                      name="password"
                      varient="signin-modal"
                      placeholder="Password"
                      align="left"
                      normalize={val => val && val.trim()}
                    />
                </fieldset>
                { error && <div className="pb2 ph4 b f6 tc">
                    {error}
                </div> }
                <ButtonLoader
                  expanded
                  type="submit"
                  rounded
                  largeText
                  showSpinner={submitting}
                >
                    SIGN IN
                </ButtonLoader>
            </form>
            <div className="pa2 f6 pb0 w-100 tc">
                <button onClick={showForgotPassword} className="SignUp--modal--forgotpass">
                    Forgot Password ?
                </button>
            </div>
        </div>
    );
};

export default reduxForm({
    form: 'login',
    validate: createValidator({
        email: emailValidation,
        password: textValidation
    })
})(LoginForm);

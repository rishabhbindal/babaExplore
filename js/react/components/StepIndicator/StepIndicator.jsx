import React, { PropTypes } from 'react';
import cls from 'classnames';

import './StepIndicator.scss';

const StepIndicator = ({ step, maxStep, gotoStep }) => {
    const stepN = parseInt(step, 10);
    const stepCls = i => cls('Step__li', { Step__current: i < stepN });
    const totalSteps = [...Array(parseInt(maxStep, 10)).keys()];

    const stepsEl = totalSteps.map(i => (
        <a
          key={i}
          title={`Go to step ${i + 1}`}
          onClick={() => i < stepN - 1 ? gotoStep(i + 1) : {}}
          className={stepCls(i)}
        />
    ));

    return <div className="Step"> {stepsEl} </div>;
};

StepIndicator.propTypes = {
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gotoStep: PropTypes.func
};

export default StepIndicator;

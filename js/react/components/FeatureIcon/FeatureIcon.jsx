import React from 'react';
import cls from 'classnames';

import { featureIconType } from '../../data-shapes/featureIcon.js';

class FeatureIcon extends React.Component {
    static propTypes = { ...featureIconType }

    render() {
        const { className, label, image } = this.props;

        return (
            <div className="dib gray text-center" style={{ width: '5rem' }}>
                { className && <i className={cls('f2', className)} /> }
                { !className && <img src={image} alt="" /> }
                <p className="db f6 lh-title relative">{label}</p>
            </div>
        );
    }
}

export default FeatureIcon;

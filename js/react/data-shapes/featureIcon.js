import { PropTypes } from 'react';

const { string } = PropTypes;

export const featureIconType = {
    image: string,
    className: string,
    label: string
};

export const featureIconTransform = icon => ({
    className: icon.class_name,
    label: icon.name,
    image: icon.image
});

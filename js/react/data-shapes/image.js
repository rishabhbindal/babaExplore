import { PropTypes } from 'react';
import idFromURLEnd from '../lib/idFromURLEnd.js';

const { shape, string, number } = PropTypes;

export const imageSetTransform = imgs => ({
    id: imgs.id || parseInt(idFromURLEnd(imgs.url || "")),
    caption: imgs.caption,
    description: imgs.description,
    fallbackImage: imgs.image960x640 || imgs.image1640x1100 || imgs.image || imgs.image_custom,
    small: imgs.image,
    medium: imgs.image960x640,
    large: imgs.image1640x1100,
    custom: imgs.image_custom
});

export const imageSetPropType = shape({
    id: number,
    caption: string,
    description: string,
    fallbackImage: string,
    small: string,
    medium: string,
    large: string,
    custom: string
});

export const escapeBrackets = (img) => {
    const escapedImg = {};
    Object.keys(img).forEach((key) => {
        if (['small', 'medium', 'large', 'fallbackImage', 'custom'].includes(key)) {
            escapedImg[key] = img[key] && img[key].replace('(', '\\(').replace(')', '\\)');
            return;
        }
        escapedImg[key] = img[key];
    });
    return escapedImg;
};

import { PropTypes } from 'react';

const { string, shape, arrayOf } = PropTypes;
import { imageSetPropType } from './image.js';
import { videoPropType } from './video.js';

export const eventType = shape({
    url: string,
    caption: string,
    description: string,
    images: arrayOf(imageSetPropType),
    videos: videoPropType,
    propertyCode: string,
    status: string
});

export const eventTransform = ({
  url,
  caption,
  description,
  images,
  videos,
  property_code,
  clickable_url,
  status
}) => {
    const customImage = (images && images.length) ? {
        src: images[0].image_custom,
        caption: images[0].caption
    } : null;

    let specialEventImage = null;
    if (images && images.length) {
        const img = images.find(image => (image.caption === 'homepage_image'));
        if (img) {
            specialEventImage = {
                src: img.image_custom,
                caption: img.caption
            };
        }
    }

    const coverImage = images.length ? {
        src: images[0].image,
        caption: images[0].caption
    } : null;

    const coverVideo = videos.length && videos[0].external_video_link;

    return {
        url,
        caption,
        status,
        description,
        customImage,
        coverImage,
        coverVideo,
        specialEventImage,
        clickableUrl: clickable_url && clickable_url.replace(/^.*\/\/[^\/]+/, ''),
        propertyCode: property_code
    };
};

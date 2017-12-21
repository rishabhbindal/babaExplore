import { PropTypes } from 'react';

const { shape, string, number } = PropTypes;

const toInt = n => parseInt(n, 10);

export const videoTransform = vid => ({
    id: vid.id,
    caption: vid.caption,
    url: vid.external_video_link,
    ordering: toInt(vid.ordering)
});

export const videoPropType = shape({
    id: number,
    caption: string,
    ordering: number,
    url: string
});

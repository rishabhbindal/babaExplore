import { PropTypes } from 'react';
import { imageSetPropType, imageSetTransform } from './image.js';

const { string, shape, arrayOf, number, array } = PropTypes;

export const groupPropType = shape({
    url: string,
    tags: string,
    name: string,
    icons: arrayOf(shape),
    config: shape({
        showMembers: string
    }),
    images: arrayOf(imageSetPropType),
    coverImage: imageSetPropType,
    status: string,
    members: arrayOf(string),
    ordering: number,
    information: string,
    groupAdmins: arrayOf(string),
    welcomeMessage: string,
    awaitingResponses: array,
    noOfAwaitingResponses: number
});


export const groupTransform = ({
    url,
    name,
    tags,
    icons,
    config,
    images,
    status,
    members,
    ordering,
    information,
    join_policy,
    group_admins,
    welcome_message,
    awaiting_responses,
    no_of_awaiting_responses

}) => {
    const coverImage = (images.length && images.length > 1) ? images[1] : images[0];

    return {
        url,
        tags,
        name,
        icons,
        status,
        members,
        ordering,
        information,
        joinPolicy: join_policy,
        groupAdmins: group_admins,
        welcomeMessage: welcome_message,
        awaitingResponses: awaiting_responses,
        coverImage: coverImage && imageSetTransform(coverImage),
        config: { showMembers: config && config.show_members },
        images: images.map(image => imageSetTransform(image)),
        noOfAwaitingResponses: no_of_awaiting_responses
    };
};

export const groupRequestPropType = shape({
    url: string,
    state: string,
    ownerId: number,
    joinMessage: string,
    groupDetails: groupPropType,
    adminMessage: string
});

export const groupRequestTransform = ({
    url,
    owner,
    state,
    join_message,
    group_details,
    admin_message
}) => ({
    url,
    state,
    ownerId: owner,
    joinMessage: join_message,
    adminMessage: admin_message,
    groupName: group_details.name,
    groupDetails: groupTransform(group_details)
});

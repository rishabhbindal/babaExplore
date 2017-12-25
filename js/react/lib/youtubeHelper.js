export const isYoutubeUrlMatched = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    return url.match(regExp);
};

export const getYoutubeVideoId = (url) => {
    const match = isYoutubeUrlMatched(url);

    if (match && match[2].length === 11) {
        return match[2];
    }

    return null;
};

export const youtubeImageHqUrl = url => `https://img.youtube.com/vi/${getYoutubeVideoId(url)}/hqdefault.jpg`;
export const youtubeImageUrl = url => `https://img.youtube.com/vi/${getYoutubeVideoId(url)}/default.jpg`;

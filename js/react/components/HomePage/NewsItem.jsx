import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

const NewsItem = (news) => {
    const { newsItem } = news;
    const { caption, description, external_url, coverImage } = newsItem;
    return (
        <div className="news__item">
            <div className="image">
                <img src={coverImage} alt="" />
            </div>
            <div className="text">
                <h5>{ caption }</h5>
                <p>{ description }</p>
                <Link to={external_url} className="small-link" target="_blank">read more</Link>
            </div>
        </div>
    );
};

export default NewsItem;

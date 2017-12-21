import React, { PropTypes } from 'react';
import ReactPaginate from 'react-paginate';
import './Pagination.scss';
import { toInt } from './../../lib/helpers.js';
import { parseQuery, stringifyQuery } from './../../lib/queryString.js';

const Pagination = ({ count, nextUrl, previousUrl, onChange }) => {
    const handlePaginationChange = ({ selected }) => {
        const offset = selected * 25;
        const url = (previousUrl || nextUrl);
        const parser = document.createElement('a'); // eslint-disable-line no-undef
        parser.href = url;
        const params = parseQuery(parser.search);
        return onChange(offset, `${parser.pathname}?${stringifyQuery({ ...params, offset })}`);
    };

    const stripParams = (url) => {
        const regex = /[?&]([^=#]+)=([^&#]*)/g;
        let params = {};
        let match;
        while(match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    };

    const getCurrentPageNumber = (url) => {
        const off = stripParams(url).offset || 0;
        return toInt((toInt(off) / 25) - 1);
    };

    let currentPage = 0;
    if (nextUrl) {
        currentPage = getCurrentPageNumber(nextUrl);
    } else if (previousUrl) {
        currentPage = getCurrentPageNumber(previousUrl);
    }

    return (
        <ReactPaginate
          breakLabel={<a href="">...</a>}
          breakClassName="Pagination-Break"
          disableInitialCallback={true}
          pageCount={Math.ceil(count / 25) || 1}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePaginationChange}
          containerClassName="Pagination"
          subContainerClassName="Pagination-Pages"
          activeClassName="Pagination-Active"
          initialPage={currentPage}
        />
    );
};

Pagination.propTypes = {
    count: PropTypes.number,
    nextUrl: PropTypes.string,
    previousUrl: PropTypes.string,
    onChange: PropTypes.func
};

export default Pagination;

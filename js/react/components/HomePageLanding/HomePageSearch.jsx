import React, { PropTypes } from 'react';
import { withRouter, Link } from 'react-router-dom';

import InlineSvg from 'react-inlinesvg';
import { stringifyQuery } from '../../lib/queryString.js';
import SearchFormContainer from './../../containers/SearchFormContainer.jsx';

class HomePageSearch extends React.Component {
    constructor(props) {
        super(props);
        this.showSearchPage = this.showSearchPage.bind(this);
        this.onNewSearch = this.onNewSearch.bind(this);
    }

    showSearchPage() {
        this.props.history.push('/search-filter');
    }

    onNewSearch(searchParams) {
        const { history } = this.props;

        history.push({
            pathname: '/search',
            search: stringifyQuery(searchParams)
        });
    }

    render() {
        const { promotedSearchPages, searchTitle } = this.props;

        const iconsSection = promotedSearchPages.length > 0 && (
            promotedSearchPages.map((page, id) => (
                <div className="icon-option" key={id}>
                    <Link
                      to={page.url}
                      style={{ color: 'white' }}
                    >
                        { page.svg ? (<InlineSvg src={page.svg} />) : (<img src={page.image} />) }
                        <strong>{ page.name }</strong>
                    </Link>
                </div>
            ))
        );

        return (
            <section className="search__housing">
                <div className="row flush">
                    <div style={{float:'right'}}>
                        <div style={{width:'50%',paddingBottom:'50px'}} className="show-for-medium">
                            <SearchFormContainer
                              onSubmit={this.onNewSearch}
                              page={'HOME_PAGE'}
                              redirectTo={'/search'}
                            />

                        </div>
                    </div>
                    <div className="hide-for-medium">
                            <div className="city__select">
                                    <SearchFormContainer
                                      onSubmit={this.onNewSearch}
                                      page={'HOME_PAGE'}
                                      redirectTo={'/search'}
                                      mobileFriendly
                                    />
                            </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default withRouter(HomePageSearch);

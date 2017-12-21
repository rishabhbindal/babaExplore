import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import CommunityInfo from '../components/CommunityInfo/CommunityInfo.jsx';

import { actions, getState as appState } from '../reducers';


const mapStateToProps = (state) => {
    const communities = appState.appConfig.groups(state);

    return { communities };
};

const TitleSection = ({ title, caption }) => (
    <section className="CommunitiesHeader">
        <div className="row">
            <div className="CommunitiesHeader--title">
                <h1>{ title }</h1>
                <small>{ caption }</small>
            </div>
        </div>
    </section>
);

TitleSection.propTypes = {
    caption: PropTypes.string,
    title: PropTypes.string
};

class CommunitiesPageContainer extends React.Component {
    static propTypes = {
        fetchGroups: PropTypes.func.isRequired,
        communities: PropTypes.arrayOf(PropTypes.object)
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        this.props.fetchGroups();
    }

    render() {
        const { communities } = this.props;
        return (
            <div>
                <TitleSection
                  title="Find your people"
                  caption="Specialised communities give you access to exclusive properties."
                />
                <hr />
                <div className="row">
                    {
                        !!communities.length &&
                        communities.map((community, id) => <CommunityInfo {...community} key={id} />)
                    }
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchGroups: actions.appConfig.fetchGroups
})(CommunitiesPageContainer);

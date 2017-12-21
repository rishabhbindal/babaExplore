import React, { PropTypes } from 'react';

import ELTSlider from '../ELTSlider/ELTSlider.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import TruncateTextBetter from '../TruncateTextBetter/TruncateTextBetter.jsx';

import { userPropType } from '../../data-shapes/user.js';

import './PromotedUsers.scss';

const carouselSettings = {
    adaptiveHeight: false,

    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    slidesToScroll: 1,
    infinite: true,

    slidesToShow: 1,
    speed: 300,
    arrows: false,
    dots: true
};

class PromotedUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { users } = this.props;
        return (
            <div style={{ overflow: 'auto' }}>
                <div className="PromotedUsers__sildes__container">
                    <ELTSlider
                      settings={{
                          ...carouselSettings,
                          ...{ beforeChange: idx => this.setState({ prevSlide: idx }) }
                      }}
                    >
                        { users.map((user, idx) => (
                            <div key={user.url}>
                                <div className="PromotedUsers__profile">
                                    <UserInfo
                                      name={user.name}
                                      img={user.profilePic}
                                      quote={<TruncateTextBetter
                                        text={user.ownerPropertyIntro}
                                        lines={2}
                                        quoted
                                        reset={this.state.prevSlide === idx}
                                      />}
                                      fullWidth
                                    />
                                </div>
                            </div>
                        )) }
                    </ELTSlider>
                </div>
            </div>
        );
    }
}

PromotedUsers.propTypes = {
    users: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape(userPropType), PropTypes.any]))
};

export default PromotedUsers;

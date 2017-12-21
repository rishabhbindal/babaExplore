import React, { PropTypes } from 'react';
import cls from 'classnames';

import Button from '../Button/Button.jsx';
import './EventListHeader.scss';

const CITIES = ['All', 'Bengaluru', 'New Delhi', 'Mumbai'];

const isActiveMenu = (cityName, activeCity) => {
    if (cityName === 'All' && !activeCity) {
        return true;
    }

    return (activeCity && cityName.toLowerCase() === activeCity.toLowerCase());
};

const EventListHeader = ({ status, city, changeStatus, changeCity }) => {
    const isShowingArchived = status === 'ARCHIVED';

    const cities = CITIES.map(cityName => (
        <a
          className={cls('EventHeader-menu', { 'EventHeader-menu--active': isActiveMenu(cityName, city) })}
          data-city={cityName}
          onClick={changeCity}
          key={cityName}
        >
            { cityName }
        </a>
    ));

    return (
        <div className="row EventHeader">
            {cities}
            <div className="EventListHeader__event_list_button">
                <Button onClick={changeStatus}>
                    View {isShowingArchived ? 'current events' : 'past events'}
                </Button>
            </div>
        </div>
    );
}
EventListHeader.propTypes = {
    status: PropTypes.string.isRequired,
    city: PropTypes.string,
    changeStatus: PropTypes.func.isRequired,
    changeCity: PropTypes.func.isRequired
};

export default EventListHeader;

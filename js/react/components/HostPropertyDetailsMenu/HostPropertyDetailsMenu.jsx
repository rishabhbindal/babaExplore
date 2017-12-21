import React, { PropTypes } from 'react';
import cls from 'classnames';
import './HostPropertyDetailsMenu.scss';

const HostPropertyDetailsMenu = ({ activeItem, handleMenuItemChange }) => {
    const menuItems = [
        {
            label: 'Edit Properties',
            value: 'edit-properties'
        },
        {
            label: 'Create Host Order',
            value: 'create-order'
        }
    ];

    const listClassName = value => cls(
        'HostPropertyDetailsMenu-item',
        { 'HostPropertyDetailsMenu-item-active': activeItem === value }
    );

    const listItem = ({ value, label }, id) => (
        <li key={id} className={listClassName(value)}>
            <a
              className="HostPropertyDetailsMenu--label"
              onClick={handleMenuItemChange}
              data-value={value}
            >
                {label}
            </a>
        </li>
    );

    return (
        <ul className="HostPropertyDetailsMenu">
            { menuItems.map((item, id) => listItem(item, id)) }
        </ul>
    );
};

HostPropertyDetailsMenu.propTypes = {
    activeItem: PropTypes.string.isRequired,
    handleMenuItemChange: PropTypes.func.isRequired
};

export default HostPropertyDetailsMenu;

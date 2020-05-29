import React from 'react';

import classes from '../Users.module.css';

const User = props =>
    <li className={classes.User}>
        <div className={classes.User__icon}>
            <img src={props.avatar} alt={`${props.name} avatar`} width={"32px"} height={"32px"} />
        </div>
        <span className={classes.User__name}>{props.name}</span>
    </li>

export default User;

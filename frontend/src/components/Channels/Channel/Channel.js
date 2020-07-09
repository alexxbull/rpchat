import React from 'react';

import classes from './Channel.module.css'

const Channel = props =>
    <li className={classes.Channel}>
        <span className={classes.Channel__icon}></span>
        <span>{props.name}</span>
    </li>


export default Channel;

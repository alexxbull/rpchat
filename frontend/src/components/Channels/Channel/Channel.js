import React, { useContext, useEffect } from 'react';

import classes from './Channel.module.css'

// context
import { StoreContext } from '../../../context/Store';

const Channel = props => {
    const { dispatch } = useContext(StoreContext)

    // set active channel to current channel
    useEffect(() => {
        if (props.active) {
            dispatch({ type: 'set-current-channel', payload: { ...props } })
        }
    }, [props, dispatch])

    return <li className={classes.Channel}>
        <span className={classes.Channel__icon}></span>
        <span>{props.name}</span>
    </li>
}

export default Channel;

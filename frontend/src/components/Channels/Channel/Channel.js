import React, { useContext } from 'react';
import classes from './Channel.module.css'

// context
import { StoreContext } from '../../../context/Store';

const Channel = props => {
    const { dispatch } = useContext(StoreContext)
    const ch = {
        key: props.id,
        name: props.name,
        desc: props.desc,
        owner: props.owner,
        active: true,
    }

    const handleClick = () => dispatch({ type: 'set-current-channel', payload: ch })


    return <li className={classes.Channel} onClick={handleClick}>
        <span className={classes.Channel__icon}></span>
        <span>{props.name}</span>
    </li>
}


export default Channel;

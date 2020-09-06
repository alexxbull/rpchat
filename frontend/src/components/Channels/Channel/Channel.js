import React, { useContext, useState } from 'react';
import classes from './Channel.module.css'

// context
import { StoreContext } from '../../../context/Store.js';
import { useEffect } from 'react';

const Channel = props => {
    const { dispatch, state } = useContext(StoreContext)
    const ch = {
        id: props.id,
        key: props.id,
        name: props.name,
        desc: props.desc,
        owner: props.owner,
        active: true,
    }

    const initialChannelOptions = {
        channelBtnClasses: [classes.ChannelBtns],
        deleteBtnClasses: [classes.DeleteBtn, classes.ChannelBtn],
        editBtnClasses: [classes.EditBtn, classes.ChannelBtn],
        startLongPress: false,
    }

    const [channelOptions, setChannelOptions] = useState(initialChannelOptions)

    const showChannelOptions = props.showChannelOptions
    useEffect(() => {
        let timer

        if (channelOptions.startLongPress) {
            if (state.username === ch.owner) {
                timer = setTimeout(() => {
                    showChannelOptions()
                    setChannelOptions(opts => ({ ...opts, startLongPress: false }))
                }, 400)
            }
        } else {
            clearTimeout(timer)
        }

        return () => clearTimeout(timer)
    }, [ch.owner, channelOptions.startLongPress, setChannelOptions, showChannelOptions, state.username])


    const handleClick = () => {
        dispatch({ type: 'set-current-channel', payload: ch })
        if (!props.isDesktop)
            props.hideChannels()
    }

    // show channel options when user hovers over channel
    const mouseHover = {
        onMouseEnter: () => {
            if (channelOptions.channelBtnClasses[0] !== classes.Hide && ch.owner === state.username)
                setChannelOptions({ ...channelOptions, channelBtnClasses: [classes.ChannelBtns, classes.ShowBtns] })
        },
        onMouseLeave: () => {
            if (channelOptions.channelBtnClasses[0] !== classes.Hide)
                setChannelOptions({ ...channelOptions, channelBtnClasses: [classes.ChannelBtns] })
        },
    }

    const longPress = {
        onTouchStart: () => setChannelOptions({ ...channelOptions, startLongPress: true }),
        onTouchEnd: () => setChannelOptions({ ...channelOptions, startLongPress: false }),
    }

    return (
        <div
            className={classes.Container}
            {...mouseHover}
            {...longPress}
        >
            <div className={channelOptions.channelBtnClasses.join(' ')}>
                <button className={[classes.EditBtn, classes.ChannelBtn].join(' ')} onClick={props.editChannel}></button>
                <button className={[classes.DeleteBtn, classes.ChannelBtn].join(' ')} onClick={props.deleteChannel}></button>
            </div>
            <li className={classes.Channel} onClick={handleClick}>
                <div className={classes.Channel_name}>
                    <span className={classes.Channel__icon}></span>
                    {ch.name}
                </div>
            </li>
        </div>
    )
}


export default Channel;

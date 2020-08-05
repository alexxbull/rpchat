import React, { useContext, useState } from 'react';
import classes from './Channel.module.css'

// context
import { StoreContext } from '../../../context/Store.js';
import { useEffect } from 'react';

const Channel = props => {
    const { dispatch } = useContext(StoreContext)
    const ch = {
        id: props.id,
        key: props.id,
        name: props.name,
        desc: props.desc,
        owner: props.owner,
        active: true,
    }

    const initialChannelOptions = {
        editBtnClasses: [classes.EditBtn],
        startLongPress: false,
    }

    const [channelOptions, setChannelOptions] = useState(initialChannelOptions)

    const handleClick = () => dispatch({ type: 'set-current-channel', payload: ch })

    const handleEdit = () => {
        if (props.isDesktop)
            props.setChannelOptions(opts => {
                return {
                    ...opts,
                    channel: ch,
                    show: false,
                    showEdit: true,
                    optionsClasses: [opts.classes.ChannelOptions],
                }
            })
        else
            props.setChannelOptions(opts => {
                return {
                    ...opts,
                    channel: ch,
                    showEdit: false,
                    optionsClasses: [opts.classes.ChannelOptions, opts.classes.ShowOptions],
                }
            })
    }

    useEffect(() => {
        let timer

        if (channelOptions.startLongPress) {
            timer = setTimeout(() => {
                props.setChannelOptions(opts => {
                    return {
                        ...opts,
                        channel: ch,
                        showEdit: false,
                        optionsClasses: [opts.classes.ChannelOptions, opts.classes.ShowOptions],
                    }
                })

            }, 400)
        } else {
            clearTimeout(timer)
        }

        return () => clearTimeout(timer)
    }, [ch, channelOptions.startLongPress, props])


    // show edit button when user hovers over channel
    const mouseHover = {
        onMouseEnter: () => {
            if (channelOptions.editBtnClasses[0] !== classes.Hide)
                setChannelOptions({ ...channelOptions, editBtnClasses: [classes.EditBtn, classes.Show] })
        },
        onMouseLeave: () => {
            if (channelOptions.editBtnClasses[0] !== classes.Hide)
                setChannelOptions({ ...channelOptions, editBtnClasses: [classes.EditBtn] })
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
            <button className={channelOptions.editBtnClasses.join(' ')} onClick={handleEdit}></button>
            <li className={classes.Channel} onClick={handleClick}>
                <div className={classes.Channel_name}>
                    <span className={classes.Channel__icon}></span>
                    {props.name}
                </div>
            </li>
        </div>
    )
}


export default Channel;

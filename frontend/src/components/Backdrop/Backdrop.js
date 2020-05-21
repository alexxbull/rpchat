import React from 'react'

import classes from './Backdrop.module.css'


const Backdrop = props => {
    let backdrop = null

    if (props.show) {
        backdrop =
            <div
                className={classes.Backdrop}
                onClick={props.click}
            >
            </div>
    }

    return backdrop
}

export default Backdrop
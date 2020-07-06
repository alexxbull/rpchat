import React from 'react'

import classes from './Spinner.module.css'

const Spinner = props => {
    const styles = {
        'height': props.size,
        'width': props.size,
    }

    return <div className={classes.Spinner} style={styles}></div>
}

export default Spinner

import * as React from "react";
import {createStyles} from "@mui/material";
import { makeStyles } from '@mui/styles';
import clsx from "clsx";

const useStyles = makeStyles(
    (theme) =>
        createStyles({
            root: {
                border: `1px solid ${theme.palette.divider}`,
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: '1rem',
                borderRadius: 2,
                marginLeft: -8,
                marginTop: '-0.5rem',
                marginBottom: '-0.5rem',
            },
            value: {
                position: "absolute",
                lineHeight: '1rem',
                width: "100%",
                display: "flex",
                justifyContent: "center"
            },
            bar: {
                height: "100%",
                "&.low": {
                    backgroundColor: "#088208a3"
                },
                "&.medium": {
                    backgroundColor: "#efbb5aa3"
                },
                "&.high": {
                    backgroundColor: "#f44336"
                }
            }
        })
);

const ProgressBar = React.memo(function ProgressBar(props) {
    const { value, text=value } = props;
    const valueInPercent = value * 100;
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div
                className={classes.value}
            >{text}</div>
            <div
                className={clsx(classes.bar, {
                    low: valueInPercent < 30,
                    medium: valueInPercent >= 30 && valueInPercent <= 70,
                    high: valueInPercent > 70
                })}
                style={{ maxWidth: `${valueInPercent}%` }}
            />
        </div>
    );
});

export default ProgressBar;
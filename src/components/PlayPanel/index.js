import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import StopIcon from '@mui/icons-material/Stop';
import {Button, Checkbox, FormControlLabel, Grid, Paper} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {bisectLeft} from "d3-array";
export default function({title="",onPlay,currentTimeRef=0,
    onStart,onStop, playList=[],playSpeed=2000}) {
    const [usingCompareData,setusingCompareData] = useState(false);
    const [isPlay,setisPlay] = useState(false);
    const [current,setcurrent] = useState(0);
    const firstStart = useRef(true);
    const tick = useRef(); // <-- React ref
    useEffect(() => {
        if (firstStart.current) {
            firstStart.current = !firstStart.current;
            return;
        }

        if (isPlay) {
            tick.current = setInterval(() => { // <-- set tick ref current value
                setcurrent((current) => {
                    onPlay(playList[current],playList[(current-1)<0 ?undefined:current-1]);
                    if ((current+1)>=playList.length) {
                        clearInterval(tick.current);
                        setisPlay(false);
                    }
                    return current + 1
                });
            }, playSpeed);
        } else {
            clearInterval(tick.current); // <-- access tick ref current value
        }

        return () => clearInterval(tick.current); // <-- clear on unmount!
    }, [isPlay]);
    useEffect(()=>{
        if (!isPlay) {
            const index = bisectLeft(playList, currentTimeRef);
            if ((index !== -1) && (current !== index)) {
                setcurrent(index)
            }
        }
    },[currentTimeRef,playList,current])
    const toggleStart = () => {
        // if (isPlay)
        //     onStop();
        // else
        //     onStart();
        if (current>=(playList.length-1))
            setcurrent(0);
        setisPlay(!isPlay);
    };
    const forward = ()=>{
        setcurrent((current) => {
            if ((current+1)>=playList.length) {
                clearInterval(tick.current);
                setisPlay(false);
                return current
            }else{
                onPlay(playList[current+1]);
                return current + 1
            }
        });
    }
    const backward = ()=>{
        setcurrent((current) => {
            if ((current-1)<0) {
                clearInterval(tick.current);
                setisPlay(false);
                return current
            }else{
                onPlay(playList[current-1]);
                return current - 1
            }
        });
    }
    return <Paper variant="outlined" sx={{marginTop:2,padding:3}}>
        <FormControlLabel control={<Checkbox
            checked={usingCompareData}
            onChange={(event) => {
                setusingCompareData(event.target.checked);
                if (event.target.checked){
                    onStart();
                }else{
                    onStop();
                }
            }}
        />} label="Using stimulus event data"/>
        <Grid container spacing={1}>
        <Grid item>
            <Button variant={"outlined"}
                    endIcon={<FastRewindIcon />}
                    onClick={backward}
                    disabled={current<=0}
            >
                Backward
            </Button>
        </Grid>
        <Grid item>
            <Button variant={isPlay?"contained":"outlined"}
                       endIcon={!isPlay ?<PlayArrowIcon />:<StopIcon/>}
                       onClick={toggleStart}
                    disabled={!usingCompareData}
            >
                {title}{!isPlay ? " Play" : " Stop"}
            </Button>
        </Grid>
        <Grid item>
            <Button variant={"outlined"}
                    endIcon={<FastForwardIcon />}
                    onClick={forward}
                    disabled={current>=(playList.length)}
            >
                Forward
            </Button>
        </Grid>
    </Grid>
    </Paper>
}
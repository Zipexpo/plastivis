import {useData} from "../../providers/DataProvider";
import {emptyArray, emptyObject} from "../ulti";
import stimulus_creationRanking from "../../asset/data/stimulus_creationRanking.json";
import stimulus_deletionRanking from "../../asset/data/stimulus_deletionRanking.json";
import stimulus_rank from "../../asset/data/stimulus_rank.json";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import Chart from "./chart";

const otherColor = '#a8a8a8'
export default function({region}){
    const [rankDataCreation,setrankDataCreation] = useState([]);
    const [rankDataDeletion,setrankDataDeletion] = useState([]);
    const [chunk,setChunk] = useState(true);
    const [useBaseline,setBaseline] = useState(true);
    const [returnRanking,setReturnRanking] = useState(false);
    const {getValue} = useData();
    const areaList = getValue('areaList')??emptyArray;
    useEffect(()=>{
        const areaListor={};
        areaList.forEach((a,i)=>areaListor[a]=i);
        //stimulus_rank
        const process = (data,setFunc)=>
        {
            const traces = {};
            const timeList = [2,3,4,5,6,7,8,9,10,11]
            timeList.forEach(timeevent=>{
                Object.keys(data[timeevent]).forEach(trace => {
                    if (!traces[trace])
                        traces[trace] = {name: trace, x: [], y: []};
                    traces[trace].x.push(timeevent);
                    traces[trace].y.push(data[timeevent][trace]);
                })
            })
            // re-order
            const list = Object.values(traces);
            list.sort((a,b)=>areaListor[a.name]-areaListor[b.name]);
            list.forEach((t,i)=>{
                if(i>9){
                    t.line= {color:otherColor};
                    t.marker= {color:otherColor};
                }
            })
            setFunc(list);
        }
        const keyCondition = `${+chunk}${+useBaseline}${+returnRanking}`;
        process(stimulus_rank[keyCondition][0],setrankDataCreation)
        process(stimulus_rank[keyCondition][1],setrankDataDeletion)
    },[chunk,useBaseline,returnRanking,areaList])
    return <Card>
        <Box sx={{ p: 2, pl: 2 }}>

            <CardContent>
                <Grid container>
                    <FormControlLabel control={<Checkbox
                        checked={chunk}
                        onChange={(event) => setChunk(event.target.checked)}
                    />} label="Chunking"/>
                    <FormControlLabel control={<Checkbox
                        checked={useBaseline}
                        onChange={(event) => setBaseline(event.target.checked)}
                    />} label="Use baseline"/>
                    <FormControlLabel control={<Checkbox
                        checked={returnRanking}
                        onChange={(event) => setReturnRanking(event.target.checked)}
                    />} label="Ranking"/>
                </Grid>
            </CardContent>
            <CardContent>
                <Typography>Creation Ranking</Typography>
                <Grid container sx={{maxWidth:'100%'}}>
                    <Grid item xs={12} sx={{height:600}} >
                        <Chart data={rankDataCreation}
                        />
                    </Grid>
                </Grid>
            </CardContent>
            <CardContent>
                <Typography>Deletion Ranking</Typography>
                <Grid container sx={{maxWidth:'100%'}}>
                    <Grid item xs={12} sx={{height:600}} >
                        <Chart data={rankDataDeletion}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Box>
    </Card>
}
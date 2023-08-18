import {useData} from "../../providers/DataProvider";
import {emptyArray, emptyObject} from "../ulti";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, Grid, Typography} from "@mui/material";
import Chart from "./chart";
import {blob} from "d3";
import {inflate} from "pako/dist/pako.esm.mjs";

export default function({colorBySims}){
    const {getApi,getValue,setValue} = useData();
    // const [sims,setSims] = useState(['stimulus']);
    const timestep = getValue('timestep')??0;
    const [scatterdata,setScatterData] = useState({'stimulus':[]});
    useEffect(()=>{
        const _timestep = Math.round(timestep/10000)*10000;
        debugger
        blob(`./data/PC_${_timestep}.json`).then(d=>d.arrayBuffer()).then(d=> {
            debugger
            const data = JSON.parse(inflate(d, {to: 'string'}));
            setScatterData(data);
        }).catch((e) => {
            setScatterData({'stimulus':[]})
        })
    },[timestep]);
    return <Card>
        <Box sx={{ p: 2, pl: 2 }}>
            <CardContent>
                <Typography>Prallel Coordinates at Timestep {timestep}</Typography>
                <Grid container sx={{maxWidth:'100%'}}>
                    <Grid item xs={12} sx={{height:600}} >
                        <Chart data={scatterdata}
                               colorBySims={colorBySims}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Box>
    </Card>
}
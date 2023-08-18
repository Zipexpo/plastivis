import {useData} from "../../providers/DataProvider";
import {emptyArray, emptyObject} from "../ulti";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import Chart from "./chart";

export default function(){
    const {getApi,getValue,setValue} = useData();
    const [sims,setSims] = useState(['stimulus']);
    const [event,setEvent] = useState('created');
    const [vizchange,setVizchange] = useState(true);
    const [_scatterdata,set_ScatterData] = useState([]);
    const [scatterdata,setScatterData] = useState({'stimulus':[]});
    const areaList = getValue('areaList')??emptyArray;
    useEffect(()=>{
        const controllerS = new AbortController();
        getApi().getScatterByRegion({
            sims,
            region:areaList,
            event
        }, {
            signal: controllerS.signal
        }).then(({data}) => {
            setScatterData(data.data);
        }).catch((e) => {
            setScatterData({'stimulus':[]})
        })
        return () => {
            controllerS.abort();
        }
    },[sims,areaList,event]);
    useEffect(()=>{
        const traces = [];
        const other = {
            name:'other',
            x:[],
            y:[],
            text:[],
            mode: 'markers',
            type:'scatter',
            marker: {
                color: 'gray',
                size:2
            }
        }
        traces.push(other)
        let data = scatterdata['stimulus'];
        if (vizchange){
            data = data.map(t=>{
                let past = t[1][0];
                const _t = t[1].map((d,i)=> {
                    const net= d - past;
                    past = d;
                    return net;
                })
                const n = t[0].length;
                return [t[0].slice(1,n),_t.slice(1,n),t[2].slice(1,n)]
            })
        }
        data.forEach(t=>{
            if  (t[0]){
                switch (t[0][0]){
                    case 'area_8':
                        traces.push({
                            name:t[0][0],
                            x:t[1],
                            y:t[2],
                            text:t[0],
                            mode: 'lines+markers',
                            type:'scatter',
                            color: 'red'
                        })
                        break;
                    case 'area_30':
                        traces.push({
                            name:t[0][0],
                            x:t[1],
                            y:t[2],
                            text:t[0],
                            mode: 'lines+markers',
                            type:'scatter',
                            color: 'green'
                        })
                        break;
                    case 'area_34':
                        traces.push({
                            name:t[0][0],
                            x:t[1],
                            y:t[2],
                            text:t[0],
                            mode: 'lines+markers',
                            type:'scatter',
                            color: 'blue'
                        })
                        break;
                    default:
                        t[1].forEach(d=>other.x.push(d));
                        t[2].forEach(d=>other.y.push(d));
                        t[0].forEach(d=>other.text.push(d));
                }
            }
        })
        set_ScatterData(traces)
    },[vizchange,scatterdata])
    return <Card>
        <Box sx={{ p: 2, pl: 2 }}>
            <CardContent>
                <FormControlLabel control={<Checkbox
                    checked={vizchange}
                    onChange={(event) => setVizchange(event.target.checked)}
                />} label="Use Net Electricity Activity"/>
                <Typography>Creation Ranking</Typography>
                <Grid container sx={{maxWidth:'100%'}}>
                    <Grid item xs={12} sx={{height:600}} >
                        <Chart data={_scatterdata}
                               xTitle={vizchange?"Net Electricity Activity":"Electricity Activity"}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Box>
    </Card>
}
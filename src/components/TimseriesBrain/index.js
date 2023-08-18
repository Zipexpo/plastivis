import {Card, CardContent, Typography, Grid, Box} from "@mui/material";
import Chart from "./chart";
import {useEffect, useState} from "react";
import {emptyArray, emptyObject} from "../ulti";
import {useData} from "../../providers/DataProvider";
import {range as d3range} from'd3';

export const metricsTemps = [
    "Calcium",
    "Grown axons",
    "Connected axons",
    "Grown dendrites",
    "Excitatory dendrites",
]

export default function({colorBySims}) {
    const {getTimeseriesBrain,getValue,setValue} = useData();
    const [neuronTimeSeriesData,setNeuronTimeSeriesData] = useState(emptyArray);
    const [neuronOutlierData,setneuronOutlierData] = useState(emptyArray);
    const simsList = getValue('simsList')??emptyArray;
    const timestep = getValue('timestep')??0;
    const settingTimeline = getValue('settingTimeline')??emptyObject;

    useEffect(()=>{
        debugger
            const controllerS = new AbortController();
                getTimeseriesBrain({
                    vizChange:settingTimeline.vizChange
                }, {
                    signal: controllerS.signal
                }).then((data) => {
                    debugger
                    if (data&&Object.keys(data.monitorsSummary)[0]) {

                        // monitor
                        const byMetrics = [];
                        let count=0;
                        getDataGap(byMetrics,data.monitorsSummary,metricsTemps);
                        // connectionsSummary
                        getData(byMetrics,data.connectionsSummary,["creations","deletions","netto"],[''],[],name=>name);
                        // creations
                        ['creations','deletions'].forEach((name,ii)=>{
                            const cindex = byMetrics.find(d=>d.name==name)
                            if (cindex) {
                                const x = d3range(1,100).map(d=>d*10000);
                                const datag = ['in','out'].map((d,i)=>({
                                    name: 'creations',
                                    mode:'point',//i?'dashdot':'dot',
                                    index: cindex.index,
                                    x,
                                    y:{},
                                }));
                                Object.keys(data.connectionsSummaryOverlap[ii]).forEach(sim=>{
                                    datag.forEach(d=> d.y[sim]=[])
                                    data.connectionsSummaryOverlap[ii][sim].forEach((d)=> {
                                        d.forEach((d,i)=>datag[i].y[sim].push(d))
                                    })
                                });
                                datag.forEach(d=> byMetrics.push(d))
                            }
                        })
                        byMetrics.total = count;
                        function getDataGap(byMetrics=[],input,metricsTemps){
                            const frist = Object.keys(input)[0];
                            metricsTemps.forEach(name => {
                                const currentdata = {name, x: [], y: {}, indexCol: 0};
                                currentdata.indexCol = input[frist].columns.findIndex(d=>d===`${name} (avg)`);
                                if (currentdata.indexCol!==-1) {
                                    currentdata.index = count;
                                    Object.keys(input).forEach(sim => {
                                        currentdata.x = input[sim].data.map(d=>d[0]);
                                        currentdata.y[sim] = input[sim].data.map(d=>d[currentdata.indexCol]);
                                    })
                                    const maxIndex = input[frist].columns.findIndex(d=>d===`${name} (max)`);
                                    const minIndex = input[frist].columns.findIndex(d=>d===`${name} (min)`);
                                    if ((maxIndex!==-1) && (minIndex!==-1)){
                                        const gapData = {name, x: [], y: {},index:count, indexCol: [minIndex,maxIndex],mode:'gap'};
                                        Object.keys(input).forEach(sim => {
                                            gapData.y[sim] = [];
                                            const n = input[sim].data.length;
                                            input[sim].data.forEach((d,i)=>{
                                                gapData.x[i] = d[0];
                                                gapData.x[n*2-i-1] = d[0];
                                                gapData.y[sim][i] = d[maxIndex];
                                                gapData.y[sim][n*2-i-1] = d[minIndex];
                                            })
                                        })
                                        byMetrics.push(gapData)
                                    }
                                    byMetrics.push(currentdata)
                                    count++;
                                }
                            });
                        }
                        function getData(byMetrics=[],input,metricsTemps,modes,modeMap,getName=(name,mode) => `${name} (${mode})`){
                            const frist = Object.keys(input)[0];
                            const available = [];
                            metricsTemps.forEach(name => {
                                modes.forEach((mode,mi)=>{
                                    const currentdata = {name, x: [], y: {}, indexCol: 0};
                                    currentdata.indexCol = input[frist].columns.findIndex(d=>d===getName(name,mode));
                                    if (currentdata.indexCol!==-1) {
                                        currentdata.mode = modeMap[mi];
                                        currentdata.index = count;
                                        byMetrics.push(currentdata)
                                        available.push(currentdata)
                                        if (!modeMap[mi])
                                            count++;
                                    }
                                })
                            });
                            // by sims
                            Object.keys(input).forEach(sim => {
                                available.forEach(({name}, i) => {
                                    available[i].x = input[sim].data.map(d=>d[0]);
                                    available[i].y[sim] = input[sim].data.map(d=>d[available[i].indexCol]);
                                })
                            })
                        }

                        setNeuronTimeSeriesData(byMetrics)
                    }else
                        setNeuronTimeSeriesData(emptyArray)
                }).catch((e) => {
                    console.log(e)
                    setNeuronTimeSeriesData(emptyArray)
                })
            return () => {
                controllerS.abort();
            }
    },[simsList,settingTimeline.vizChange])
    return <Card >
        <Box sx={{ p: 2, pl: 2 }}>
        <CardContent >
            <Typography>Overview Timeline</Typography>
            <Grid container sx={{maxWidth:'100%'}}>
                <Grid item xs={12} sx={{height:800}} >
                    <Chart data={neuronTimeSeriesData}
                           subdata={neuronOutlierData}
                           colorByName={colorBySims}
                           currentTime={timestep}
                           onChangeTime={(t)=> setValue('timestep',t)}
                    />
                </Grid>
            </Grid>
        </CardContent>
        </Box>
    </Card>;
}
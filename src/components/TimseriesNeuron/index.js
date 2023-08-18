import {Card, CardContent, Typography, Grid, Box, TextField, FormControlLabel, Checkbox} from "@mui/material";
import Chart from "./chart";
import {useEffect, useState, useCallback} from "react";
import {emptyArray, emptyObject} from "../ulti";
import {useData} from "../../providers/DataProvider";
import SelectCheck from "../SelectCheck";

export default function({neuronId,region,colorBySims}) {
    const {getApi,getValue,setValue} = useData();
    const [neuronTimeSeriesData,setNeuronTimeSeriesData] = useState([]);
    const [neuronOutlierData,setneuronOutlierData] = useState([]);
    const timestep = getValue('timestep')??0;
    const settingTimeline = getValue('settingTimeline')??emptyObject;
    const simsList = getValue('simsList')??emptyObject;
    const handleChangeSettingTimeline = useCallback((path,value)=>{
        setValue('settingTimeline',{...settingTimeline,[path]:value})
    },[settingTimeline])
    useEffect(()=>{
        if (neuronId) {
            const controllerS = new AbortController();
            Promise.all(
            settingTimeline.metrics.map(metric=>
                getApi().getTimeseriesByNeuron({
                    sims:settingTimeline.sims,
                    neuronID: neuronId,
                    metric,
                }, {
                    signal: controllerS.signal
                }).then(({data}) => {
                    return {name:metric,...data.data}
                }).catch((e) => {
                    console.log(e)
                    // setNeuronTimeSeriesData([])
                    return {name:metric,x:[],y:{}}
                })
            )).then(data=>{
                setNeuronTimeSeriesData(data)
            })
            return () => {
                controllerS.abort();
            }
        }else{
            setNeuronTimeSeriesData([])
        }
    },[neuronId,settingTimeline.sims])
    useEffect(()=>{
        if (neuronId&&settingTimeline.showOutlier) {
            const controllerS = new AbortController();
            Promise.all(
            settingTimeline.metrics.map(metric=>
                getApi().getTimeseriesOutlierByNeuron({
                    sims: settingTimeline.sims,
                    neuronID: neuronId,
                    metric,
                }, {
                    signal: controllerS.signal
                }).then(({data}) => {
                    return {name:metric,...data.data}
                }).catch((e) => {
                    console.log(e)
                    // setNeuronTimeSeriesData([])
                    return {name:metric,x:{},y:{}}
                })
            )).then(data=>{
                setneuronOutlierData(data)
            })
            return () => {
                controllerS.abort();
            }
        }else{
            setneuronOutlierData([])
        }
    },[neuronId,settingTimeline.sims,settingTimeline.showOutlier])
    return <Card >
        <Box sx={{ p: 2, pl: 2 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <SelectCheck
                            title={"Simulation list"}
                            value={settingTimeline.sims}
                            onChange={(event)=>handleChangeSettingTimeline('sims',event.target.value??emptyArray)}
                            renderValue={(selected) => selected.join(', ')}
                            options={simsList}/>
                    </Grid>
                    <FormControlLabel control={<Checkbox
                        checked={settingTimeline.showOutlier}
                        onChange={(event) => handleChangeSettingTimeline('showOutlier', event.target.checked)}
                    />} label="Find Outliers"/>
                </Grid>
            </CardContent>
        <CardContent >
            <Typography>Timeline of Neuron #{neuronId}</Typography>
            <Grid container sx={{maxWidth:'100%'}}>
                <Grid item xs={12} sx={{height:settingTimeline.metrics.length*200}} >
                    <Chart data={neuronTimeSeriesData}
                           region={region}
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
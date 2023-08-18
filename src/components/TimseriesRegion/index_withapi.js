import {Card, CardContent, Typography, Grid, Box, TextField, Checkbox, FormControlLabel} from "@mui/material";
import Chart from "./chart";
import {useEffect, useState, useCallback} from "react";
import {emptyArray, emptyObject, monitormap} from "../ulti";
import {useData} from "../../providers/DataProvider";
import SelectCheck from "../SelectCheck";
import {scaleOrdinal, range as d3range} from "d3";
import {isArray} from "lodash";

export default function({region,colorBySims,onChangeRegion}) {
    const {getApi,getValue,setValue} = useData();
    const [neuronTimeSeriesData,setNeuronTimeSeriesData] = useState([]);
    const [neuronOutlierData,setneuronOutlierData] = useState([]);
    const timestep = getValue('timestep')??0;
    const settingTimeline = getValue('settingTimeline')??emptyObject;
    // const simsList = getValue('simsList')??emptyObject;
    const areaChooses = getValue('areaChooses')??emptyArray;
    const stimulusaverage = getValue('stimulusaverage')??emptyArray;
    useEffect(()=>{
        if (areaChooses.length) {
            const controllerS = new AbortController();
            const querys = [];
            const regionSysmbol = scaleOrdinal().range(["circle-open","square-open","triangle-up-open","x-open","star"])
            settingTimeline.metrics.forEach((metric,mi)=>{
                areaChooses.forEach(region=>{
                    querys.push({
                        query:{
                            sims:settingTimeline.sims,
                            region,
                            metric,
                            vizChange: settingTimeline.vizChange
                        },
                        index:mi,
                        option:{mode:'lines+markers',marker:{symbol:regionSysmbol(region)}}
                    })
                })
            })


            areaChooses.forEach(region=>{
                querys.push({
                    query:{
                        sims:settingTimeline.sims,
                        region,
                        vizChange: settingTimeline.vizChange
                    },
                    network:true,
                    index:settingTimeline.metrics.length,
                    option:{mode:'lines+markers',marker:{symbol:regionSysmbol(region)}}
                })
            })

            Promise.all(
                querys.map(q=> {
                    if (q.network){
                        return getApi().getTimeseriesNetworkByRegion(q.query, {
                            signal: controllerS.signal
                        }).then(({data}) => {
                            return["Creation Ingoing","Creation Outgoing","Deletion Ingoing","Deletion Outgoing"]
                                .map((d,i)=>{
                                    return {
                                        name: d,
                                        region: q.query.region,
                                        index: q.index+i,
                                        option: q.option,
                                        x: d3range(1,100).map(d=>d*10000),
                                        y: data.data.data[i]
                                    }
                                })
                        }).catch((e) => {
                            console.log(e)
                            // setNeuronTimeSeriesData([])
                            return {name: q.query.metric, region: q.query.region, index: q.index, x: [], y: {}}
                        })
                    }else
                        return getApi().getTimeseriesByRegion(q.query, {
                            signal: controllerS.signal
                        }).then(({data}) => {
                            return {
                                name: q.query.metric, region: q.query.region, index: q.index,
                                option: q.option, ...data.data
                            }
                        }).catch((e) => {
                            console.log(e)
                            // setNeuronTimeSeriesData([])
                            return {name: q.query.metric, region: q.query.region, index: q.index, x: [], y: {}}
                        })
                }
            )).then(_data=>{
                // handle data here
                const data = [];
                data.total = settingTimeline.metrics.length + 4;
                _data.forEach(d=>{
                    if (isArray(d)){
                        d.forEach(e=>data.push(e));
                    }else
                        data.push(d)
                })
                if (stimulusaverage.length&&(settingTimeline.sims.indexOf('stimulus')!==-1)){
                    // ["Creation Ingoing","Creation Outgoing","Deletion Ingoing","DeletionOutgoing"]
                    data.push({
                        name: "Creation Ingoing", region: 'none-event', index: settingTimeline.metrics.length,
                        option: {mode:'lines',lines:{color:'black'}}, x:stimulusaverage[0].x,
                        y:{'stimulus':stimulusaverage[0].ingoing}
                    })
                    data.push({
                        name: "Creation Outgoing", region: 'none-event', index: settingTimeline.metrics.length+1,
                        option: {mode:'lines',lines:{color:'black'}}, x:stimulusaverage[0].x,
                        y:{'stimulus':stimulusaverage[0].outgoing}
                    })
                    data.push({
                        name: "Deletion Ingoing", region: 'none-event', index: settingTimeline.metrics.length+2,
                        option: {mode:'lines',lines:{color:'black'}}, x:stimulusaverage[1].x,
                        y:{'stimulus':stimulusaverage[1].ingoing}
                    })
                    data.push({
                        name: "Deletion Outgoing", region: 'none-event', index: settingTimeline.metrics.length+3,
                        option: {mode:'lines',lines:{color:'black'}}, x:stimulusaverage[1].x,
                        y:{'stimulus':stimulusaverage[1].outgoing}
                    })
                }
                console.log(stimulusaverage)

                setNeuronTimeSeriesData(data)
            })
            return () => {
                controllerS.abort();
            }
        }else{
            setNeuronTimeSeriesData([])
        }
    },[areaChooses,settingTimeline.sims,settingTimeline.metrics,settingTimeline.vizChange,stimulusaverage])

    return <Card>
        <Box sx={{ p: 2, pl: 2 }}>
            <CardContent>
                <Grid container spacing={2}>
                    {/*<Grid item xs={3}>*/}
                    {/*    <SelectCheck*/}
                    {/*        title={"Simulation list"}*/}
                    {/*        value={settingTimeline.sims}*/}
                    {/*        onChange={(event)=>handleChangeSettingTimeline('sims',event.target.value??emptyArray)}*/}
                    {/*        renderValue={(selected) => selected.join(', ')}*/}
                    {/*        options={simsList}/>*/}
                    {/*</Grid>*/}
                    {/*<Grid item>*/}
                    {/*    <FormControlLabel control={<Checkbox*/}
                    {/*        checked={settingTimeline.vizChange}*/}
                    {/*        onChange={(event) => handleChangeSettingTimeline('vizChange', event.target.checked)}*/}
                    {/*    />} label="Changed"/>*/}
                    {/*</Grid>*/}
                    {/*<Grid item xs={12}></Grid>*/}
                    {/*<Grid item>*/}
                    {/*    <TextField*/}
                    {/*        label={"Selected Area"}*/}
                    {/*        value={region}*/}
                    {/*        disabled*/}
                    {/*    />*/}
                    {/*</Grid>*/}
                    {/*<Grid item xs>*/}
                    {/*    <SelectCheck*/}
                    {/*        title={"Area list:"}*/}
                    {/*        value={areaChooses}*/}
                    {/*        onChange={(event)=>handleChange('areaChooses',event.target.value??emptyArray)}*/}
                    {/*        renderValue={(selected) => selected.join(', ')}*/}
                    {/*        options={areaList}/>*/}
                    {/*</Grid>*/}
                </Grid>
            </CardContent>
        <CardContent>
            {/*<Typography>Timeline of Region #{region}</Typography>*/}
            <Grid container sx={{maxWidth:'100%'}}>
                <Grid item xs={12} sx={{height:(neuronTimeSeriesData.total??2)*200, position:'relative'}}>
                    <div style={{width:'100%',height:'100%'}}>
                    <Chart data={neuronTimeSeriesData}
                           region={region}
                           subdata={neuronOutlierData}
                           colorByName={colorBySims}
                           currentTime={timestep}
                           onChangeTime={(t)=> setValue('timestep',t)}
                           onChangeRegion={(region)=>onChangeRegion(region)}
                    />
                    </div>
                </Grid>
            </Grid>
        </CardContent>
        </Box>
    </Card>;
}
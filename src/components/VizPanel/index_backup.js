import {Card, CardContent, CardHeader, Divider, Grid, Tab, Tabs, Typography} from "@mui/material";
import Viz3D from "../Viz3D";
import TimseriesNeuron from "../TimseriesNeuron";
import {useData} from "../../providers/DataProvider";
import {emptyArray, emptyObject, monitormap, schemeCategory20} from "../ulti";
import {useEffect, useMemo, useState} from "react";
import {scaleOrdinal, schemeCategory10} from "d3";
import TimseriesBrain from "../TimseriesBrain";
import CustomTab from "../CustomTab";
import TimseriesRegion from "../TimseriesRegion";
import PlayPanel from "../PlayPanel";
import RankingChart from "../RankingChart";
import Scatterplot from "../Scatterplot";
import {annotations} from "../../providers/DataProvider/Provider";
// import CustomTab from "../CustomTab";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const emptyconnect = {data:emptyObject};
export default function(){
    const {getdata3D,getdata3Dconnect,get3DdataRegion,setValue,getValue,getApi,colorBySims} = useData();
    const [neuronId,setNeuronId] = useState(1);
    const [region,setRegion] = useState({'area_8':true,'area_30':true,'area_34':true});
    const [netData,setNetData] = useState({});
    const [isPlayBuffer,setIsPlayBuffer] = useState(false);
    const timestumulus = useMemo(()=>annotations.filter(d=>d.sim=='stimulus').map(d=>d.x0),[]);
    const timestep = getValue('timestep')??0;
    const setting3D = getValue('setting3D')??emptyObject;
    const data3D = getValue('data3D')??emptyObject;
    const regionData = getValue('regionData')??emptyObject;
    const data3Dconnect = getValue('data3Dconnect')??emptyconnect;
    const data3Dallposition = getValue('neuronInfo')??emptyArray;
    const sims = getValue('sims')??emptyArray;
    const monitorRange = getValue('monitorRange')??emptyArray;

    // 3D
    useEffect(()=>{
        if (isPlayBuffer) {
            // getdata3Dconnect(isPlayBuffer);
        }else {
            return getdata3D();
        }
    },[sims,timestep,setting3D.metric,isPlayBuffer]);

    // 3D
    useEffect(()=>{
        if (isPlayBuffer) {
            getdata3Dconnect(isPlayBuffer);
        }else {
            return getdata3Dconnect();
        }
    },[sims,timestep,isPlayBuffer]);
    // },[sims,timestep,isPlayBuffer,previousTimeStep]);

    useEffect(()=>{
        const sims = {};
        Object.keys(data3Dconnect.data).forEach(t=>{
            const type = t;
            Object.keys(data3Dconnect.data[type]).forEach(sim=>{
                if (!sims[sim])
                    sims[sim] = [];
                sims[sim].push({type,data:data3Dconnect.data[type][sim]})

            })
        })
        setNetData(sims)
    },[data3Dconnect])

    useEffect(()=>{

        return get3DdataRegion();
    },[sims,timestep,setting3D.metric]);

    const [viewMode, setViewMode] = useState(2);

    const handleTabChange = (event, newValue) => {
        setViewMode(newValue);
    };

    return <Card sx={{height: '100%', display: 'flex', flexDirection: 'column',overflowY:'auto'}}>
        <CardContent>
            <Grid container>
                <Grid xs={12} sx={{height: 500}}>
                    <Viz3D data={data3D}
                           timestep={timestep}
                           dataRange={monitorRange.neuron[setting3D.metric]}
                           showData={setting3D.showNeuron}

                           subdata={data3Dallposition}
                           subRange={monitorRange.area[setting3D.metric]}
                           netRange={monitorRange.connection}
                           subdataValue={regionData}
                           netData={netData}
                           showNetcreatedin={setting3D.createdin}
                           showNetcreatedout={setting3D.createdout}
                           showNetdeletedin={setting3D.deletedin}
                           showNetdeletedout={setting3D.deletedout}
                           showSub={setting3D.showAllPosition}
                           showOnlyConnect={setting3D.showOnlyConnect}
                           showOnlyRelatedConnect={setting3D.showOnlyRelatedConnect}
                           name={monitormap[setting3D.metric]}
                           choosenId={neuronId}
                           choosenArea={region}
                           onChoose={(id,area)=> {
                               setNeuronId(id);
                               setRegion(area);
                           }}
                           filter={setting3D.percent}
                    />
                </Grid>
                <Grid xs={12}>
                    <PlayPanel
                        title={"Stimulus events"}
                        currentTimeRef={timestep}
                        onStart={()=> {
                            setIsPlayBuffer(true);
                        }}
                        onStop={()=>setIsPlayBuffer(false)}
                        playList={timestumulus}
                        onPlay={(t,pre)=> {
                            // setPreviousTimeStep(pre)
                            setValue('timestep', t)
                        }}
                        playSpeed={2000}
                    />
                </Grid>
                <Divider/>

                <Grid xs={12} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={viewMode} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Overview" {...a11yProps(0)} />
                        <Tab label="Neuron Timeline" {...a11yProps(1)} />
                        <Tab label="Region Timeline" {...a11yProps(2)} />
                        <Tab label="Stimulus Ranking" {...a11yProps(3)} />
                        <Tab label="Electric Activity vs Connection" {...a11yProps(4)} />
                    </Tabs>
                </Grid>
                <CustomTab component={Grid} value={viewMode} index={0} xs={12}>
                    <Grid xs={12}>
                        <TimseriesBrain
                            colorBySims={colorBySims}/>
                    </Grid>
                </CustomTab>
                <CustomTab component={Grid} value={viewMode} index={1} xs={12}>
                    <Grid xs={12}>
                        <TimseriesNeuron
                            region={region}
                            neuronId={neuronId}
                            colorBySims={colorBySims}/>
                    </Grid>
                </CustomTab>
                <CustomTab component={Grid} value={viewMode} index={2} xs={12}>
                    <Grid xs={12} >
                        <TimseriesRegion
                            region={region}
                            onChangeRegion={region=>setRegion(region)}
                            colorBySims={colorBySims}/>
                    </Grid>
                </CustomTab>
                <CustomTab component={Grid} value={viewMode} index={3} xs={12}>
                    <Grid xs={12} >
                        <RankingChart
                            region={region}
                            onChangeRegion={region=>setRegion(region)}
                            />
                    </Grid>
                </CustomTab>
                <CustomTab component={Grid} value={viewMode} index={4} xs={12}>
                    <Grid xs={12} >
                        <Scatterplot
                            region={region}
                            onChangeRegion={region=>setRegion(region)}
                            />
                    </Grid>
                </CustomTab>
            </Grid>
        </CardContent>
    </Card>
}
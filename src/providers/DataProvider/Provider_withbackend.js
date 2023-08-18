import React, {startTransition,useMemo, useCallback, useEffect, useReducer} from 'react'
import Context from './Context';
import {
    csv, blob, max as d3max, min as d3min, mean as d3mean, scaleOrdinal
} from "d3";
import {inflate} from "pako";
import {getApp} from "../../containers/Database/api";
import neuronInfo from "../../asset/data/position.json";
import monitorRange from "../../asset/data/range.json";
import stimulus_list_region from "../../asset/data/stimulus_list_region.json";
import stimulus_list_region_3D from "../../asset/data/stimulus_list_region_3D.json";
import regionRanking from "../../asset/data/regionRanking.json";
import areaConnection from "../../asset/data/areaConnection.json";
import stimulus_nonstim_created from "../../asset/data/nonstim_created.csv";
import stimulus_nonstim_deleted from "../../asset/data/nonstim_deleted.csv";
import {emptyObject} from "../../components/ulti";
// import stimulus_list_global from "../../asset/data/stimulus_list_global.json";

const statics = {"min":d3min,"max":d3max,"mean":d3mean}

function reducer(state, action) {
    const {type, path, isLoading = false, error = false, hasError = false, value} = action;
    switch (type) {
        case "LOADING_CHANGED":
            return {...state, [path]: {...state[path], isLoading}};
        case "VALUE_CHANGE":
            return {
                ...state,
                [path]: {...state[path], value, isLoading, error, hasError},
            };
        case "ERROR":
            return {
                ...state,
                [path]: {...state[path], value, isLoading, error, hasError},
            };
        case "INIT":
            return {...state, isInit: value}
        // default:
        //     throw new Error()
    }
}

const init = {
    sims: ["stimulus"],
    setting3D: {
        showNeuron:false,
        createdin:false,
        createdout:false,
        deletedin:false,
        deletedout:false,
        showOnlyConnect:false,
        showOnlyRelatedConnect:true,
        // sims: ["calcium"],
        metric:"elecActivity",
        percent:100,
        showAllPosition:true,
        areaSeparation:1,
    },
    mode: "region",
    timestep:80000,
    stimulusaverage:[],
    regionRanking,
    settingTimeline:{
        metrics:["elecActivity"],
        vizChange:false,
        showOutlier:false,
        sims: ["stimulus"],
        // mode:'avg'
    },
    areaConnectionList:{},
    areaChooses:["area_8","area_30","area_34"],
    areaList:regionRanking['created']['stimulus'],//d3range(0,48).map(i=>`area_${i}`),
    simsList: ['calcium', 'stimulus', 'no-network', 'disable'],
    monitorRange,
    monitorData:{},
    metricList: [
        "elecActivity",
        "calcium",
        "targetCalcium",
        "synapticInput",
        "grownAxons",
        "conDendrites",
        "grownDendrites",
        "conAxons"
    ],
    neuronInfo,
    data3D: {neurons:{},ingoing:{},outgoing:{}},
    data3Dconnect:{sims:[],timestep:0,data:{created:[],deleted:[]}},
    regionData:emptyObject,
};

export const annotations = [
    {
        type:'rect',
        x0: 150000,
        x1: 152000,
        sim: 'stimulus',
        area: ['area_8']
    },{
        type:'rect',
        x0: 200000,
        x1: 202000,
        sim: 'stimulus',
        area: ['area_30']
    },{
        type:'rect',
        x0: 250000,
        x1: 252000,
        sim: 'stimulus',
        area: ['area_34']
    },{
        type:'rect',
        x0: 300000,
        x1: 302000,
        sim: 'stimulus',
        area: ['area_8','area_30']
    },{
        type:'rect',
        x0: 350000,
        x1: 352000,
        sim: 'stimulus',
        area: ['area_34']
    },{
        type:'rect',
        x0: 400000,
        x1: 402000,
        sim: 'stimulus',
        area: ['area_8','area_30']
    },{
        type:'rect',
        x0: 450000,
        x1: 452000,
        sim: 'stimulus',
        area: ['area_34']
    },{
        type:'rect',
        x0: 500000,
        x1: 502000,
        sim: 'stimulus',
        area: ['area_8','area_30']
    },{
        type:'rect',
        x0: 550000,
        x1: 552000,
        sim: 'stimulus',
        area: ['area_34']
    },{
        type:'rect',
        x0: 652000,
        x1: 654000,
        sim: 'stimulus',
        area: ['area_30']
    },{
        type:'rect',
        x0: 702000,
        x1: 704000,
        sim: 'stimulus',
        area: ['area_34']
    },{
        type:'line',
        x0: 10000,
        x1: 10000,
        sim: 'disable',
        area: ['area_5','area_8']
    }
]
export const annotationMap= {};
annotations.forEach(d=>{
    d.area.forEach(a=>{
        if (!annotationMap[a])
            annotationMap[a] = [];
        annotationMap[a].push(d);
    })
})
const eventTimestep = [150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 550000, 652000, 702000]
const initializer = (init) => {
    const obj = {};
    Object.keys(init).forEach(k=>obj[k]= {value:init[k]})
    return obj;
};

const Provider = ({children, name}) => {

    const _app = getApp(name);
    const [state, dispatch] = useReducer(reducer, init, initializer);
    const colorBySims = useMemo(()=>scaleOrdinal().range(["#1f77b4","#ff7f0e","#2ca02c","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]));
    useEffect(() => {
        // init function if needed
        // dispatch({type: 'LOADING_CHANGED', path: 'monitorData', isLoading: true});
        // Promise.all(state.metricList.value.map(d=>blob(`./data/${d}.json`)))
        _app.getParameter('metrics').then(({data})=>{
            dispatch({type: 'VALUE_CHANGE', path: 'metricList', value:data.data, isLoading: false});
        })
        dispatch({type: 'LOADING_CHANGED', path: 'stimulusaverage', isLoading: true});
        Promise.all([stimulus_nonstim_created,stimulus_nonstim_deleted].map(d=>csv(d)))
            .then(value=>{
                const data = value.map(d=>{
                    const x = [];
                    const ingoing = [];
                    const outgoing = [];
                    d.forEach(e=>{
                        x.push(+e.x);
                        ingoing.push(+e.in);
                        outgoing.push(+e.out);
                    })
                    return {x,ingoing,outgoing};
                })
                dispatch({type: 'VALUE_CHANGE', path:'stimulusaverage', value:data, isLoading: false});
        })
        // _app.getParameter('neuronInfo').then(({data})=>{
        //     dispatch({type: 'VALUE_CHANGE', path: 'neuronInfo', value:data.data, isLoading: false});
        // })
    }, []);

    const isLoading = useCallback(
        (path) => {
            return state[path] ? state[path].isLoading : false;
        },
        [state]
    );


    const getValue = useCallback(
        (path) => {
            return state[path] && state[path].value ? state[path].value : undefined;
        },
        [state]
    );

    const setValue = useCallback(
        (path,value) => {
            dispatch({type: 'VALUE_CHANGE', path, value, isLoading: false});
        },
        [state]
    );


    const setFilter = useCallback((data)=>{
        dispatch({type: 'VALUE_CHANGE', path: 'filter', value: data, isLoading: false});
    },[state.filter])


    const getdata3D = useCallback(()=>{
        dispatch({type: 'LOADING_CHANGED', path: 'data3D', isLoading: true});
        const controllerS = new AbortController();
        _app.get3Ddata({
            sims:state.sims.value,
            timestep:state.timestep.value,
            metric:state.setting3D.value.metric,
        },{
            signal: controllerS.signal
        }).then(({data})=>{
            dispatch({type: 'VALUE_CHANGE', path: 'data3D', value: data.data, isLoading: false});
        }).catch((e)=>{
            dispatch({type: 'VALUE_CHANGE', path: 'data3D', value: init.data3D, isLoading: false});
        })
        return ()=>{
            console.log('destroy!!!')
            controllerS.abort();
        }
    },[state.setting3D.value.metric,state.sims.value,state.timestep.value])

    const getdata3Dconnect = useCallback((savedList)=>{
        dispatch({type: 'LOADING_CHANGED', path: 'data3Dconnect', isLoading: true});
        const query = {
            sims: state.sims.value,
            timestep: state.timestep.value
        };
        if (savedList){
            // check in list
            const inlist = eventTimestep.indexOf(Math.floor(state.timestep.value/1000)*1000);
            if (inlist!==-1){
                const result = stimulus_list_region[inlist];
                const getSim = (d)=>{
                    const l = {};
                    query.sims.forEach(sim=>{
                        l[sim] = d[sim];
                    })
                    return l;
                }
                dispatch({type: 'VALUE_CHANGE', path: 'data3Dconnect', value: {...query,data:
                            {"createdin":getSim(result[0]),"createdout":getSim(result[1]),"deletedin":getSim(result[2]),
                                "deletedout":getSim(result[3])}
                        }, isLoading: false});
            }else{
                dispatch({type: 'VALUE_CHANGE', path: 'data3Dconnect', value: init.data3Dconnect, isLoading: false});
            }
        }else {
            const controllerS = new AbortController();
            // if (previous !== undefined)
            //     query.previous = previous
            _app.get3ddataConnection(query, {
                signal: controllerS.signal
            }).then(({data}) => {
                dispatch({
                    type: 'VALUE_CHANGE',
                    path: 'data3Dconnect',
                    value: {...query, data: data.data},
                    isLoading: false
                });
            }).catch((e) => {
                dispatch({type: 'VALUE_CHANGE', path: 'data3Dconnect', value: init.data3Dconnect, isLoading: false});
            })
            return () => {
                console.log('destroy!!!')
                controllerS.abort();
            }
        }
    },[state.timestep.value,state.sims.value])

    const get3DdataRegion = useCallback(()=>{
        dispatch({type: 'LOADING_CHANGED', path: 'regionData', isLoading: true});
        const query = {
            sims: state.sims.value,
            metric: state.setting3D.value.metric,
            timestep: state.timestep.value
        };
        const inlist = eventTimestep.indexOf(Math.floor(state.timestep.value/1000)*1000);
        if (inlist!==-1){
            // check in list
            const result = {};
            query.sims.forEach(sim=>{
                result[sim] = stimulus_list_region_3D[inlist][query.metric][sim];
            })
            const regionmap={};
            Object.keys(result).forEach(k=>{
                regionmap[k] = {};
                result[k].forEach(d=>regionmap[k][d[0]]=d[1]);
            })
            dispatch({type: 'VALUE_CHANGE', path: 'regionData', value: regionmap, isLoading: false});
        }else {
            const controllerS = new AbortController();
            _app.get3DdataRegion(query, {
                signal: controllerS.signal
            }).then(({data}) => {
                const regionmap={};
                Object.keys(data.data).forEach(k=>{
                    regionmap[k] = {};
                    data.data[k].forEach(d=>regionmap[k][d[0]]=d[1]);
                })
                dispatch({
                    type: 'VALUE_CHANGE',
                    path: 'regionData',
                    value: regionmap,
                    isLoading: false
                });
            }).catch((e) => {
                dispatch({type: 'VALUE_CHANGE', path: 'regionData', value: init.regionData, isLoading: false});
            })
            return () => {
                console.log('destroy!!!')
                controllerS.abort();
            }
        }
    },[state.timestep.value,state.sims.value,state.setting3D.value.metric])

    const getAreaConnection = useCallback(()=>{
        dispatch({type: 'LOADING_CHANGED', path: 'areaConnectionList', isLoading: true});
        const result = {};
        const timeIndex = Math.max(0,Math.round((state.timestep.value-10000)/10000))
        debugger
        if ((timeIndex>=0) && (timeIndex<99)) {
            (state.sims.value ?? []).forEach(sim => {
                result[sim] = [];
                Object.keys(areaConnection[sim][timeIndex]).forEach(a=>{
                    result[sim].push({name:a,data:areaConnection[sim][timeIndex][a]})
                })
            })
        }else{
            (state.sims.value ?? []).forEach(sim => {
                result[sim] = [];
                Object.keys(areaConnection[sim][0]).forEach(a=>{
                    result[sim].push({name:a,data:[0,0,0,0]})
                })
            })
        }
        debugger
        dispatch({type: 'VALUE_CHANGE', path: 'areaConnectionList', value: result, isLoading: false});
    },[state.timestep.value,state.sims.values])
    const getApi = ()=>_app

    return (
        <Context.Provider value={{
            isLoading,
            getValue,
            getApi,
            setValue,
            setFilter,
            getdata3D,
            getdata3Dconnect,
            get3DdataRegion,
            getAreaConnection,
            colorBySims
        }}>
            {children}
        </Context.Provider>
    )
}

export default Provider;
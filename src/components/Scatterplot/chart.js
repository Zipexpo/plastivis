import {useMemo, useState,useEffect} from "react";
import {uniqueId} from "lodash";
import {emptyArray} from "../ulti";
import Plot from 'react-plotly.js';
const initLayout = {title:{text:'',pad:0},margin:{l:80,r:50,b:20,t:40,pad:0},
    xaxis:{
        title:"Electric Activity"
    },yaxis:{
        title:"Created Connection"
    }};
export default function({data,xTitle}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [primaryplotdata,setPrimaryPlotdata] = useState(emptyArray);
    const [subTrace,setSubTrace] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    useEffect(()=>{
        const layout = {...initLayout};
        layout.xaxis.title=xTitle;
        setLayout(layout);
    },[xTitle])
    return <Plot data={data}
                 divId={id}
                 style={{width: '100%',height:'100%'}}
                 layout={layout}
                 useResizeHandler={true}
                 />
}
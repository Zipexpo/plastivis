import {useMemo, useState, useTransition} from "react";
import {uniqueId} from "lodash";
import {emptyArray} from "../ulti";
import Plot from 'react-plotly.js';
import "./index.css"
const initLayout = {title:{text:'',pad:0},margin:{l:80,r:50,b:40,t:40,pad:0},
    xaxis:{
        title:"Stimulus Event"
    },
    yaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false
    },
    // transition: {
    //     duration: 1000,
    //     easing: "cubic-in-out"
    // },
    // frame:{
    //     duration: 1000,
    // }
};
export default function({data}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [isPending,startTransition] = useTransition();
    const [primaryplotdata,setPrimaryPlotdata] = useState(emptyArray);
    const [subTrace,setSubTrace] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    return <Plot data={data}
                 divId={id}
                 style={{width: '100%',height:'100%'}}
                 layout={layout}
                 useResizeHandler={true}
                 // transition={ {
                 //     duration: 500,
                 //     easing: 'cubic-in-out'
                 // }}
                 // frame={{ duration: 2000 }}
                 />
}
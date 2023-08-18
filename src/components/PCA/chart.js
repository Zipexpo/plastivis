import {useEffect, useState, useTransition,useMemo} from "react";
import Plot from 'react-plotly.js';
import {emptyArray, TIMECOLOR} from "../ulti";
import {uniqueId} from "lodash";
import {groups} from "d3";

const initLayout = {title:{text:'',pad:0},margin:{l:20,r:5,b:20,t:5,pad:2},
    legend: {"orientation": "h",pad:0,entrywidth:0},
    xaxis:{
        title:{text:"PC 1",standoff: 10}
    },yaxis:{
        title: {text:"PC 2",standoff: 10}
    }};
export default function ({data,colorByName,currentTime=0,onChangeTime}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [primary,setPrimary] = useState(emptyArray);
    const [sub,setSub] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    useEffect(()=>{
        const primary = groups(data,d=>d.sim)
            .map(d=>{
                const x = [];
                const y = [];
                const text = [];
                const customdata = [];
                d[1].forEach(e=>{
                    x.push(e["principal component 1"])
                    y.push(e["principal component 2"])
                    text.push(e["Time step"])
                    customdata.push(e)
                })
                const trace = {
                    x,
                    y,
                    text,
                    customdata,
                    name:d[0],
                    legendgroup: d[0],
                    type: "scattergl",
                    mode:'markers',
                    marker: {
                        size:4,
                        color:colorByName(d[0])
                    },
                    hovertemplate:"<b>Time step: %{text}</b>"
                }
                return trace;
            });
        setPrimary(primary);
    },[data,colorByName])
    useEffect(()=>{
        setSub(primary.map(d=>({
            x:[d.x[Math.round(currentTime/100)]],
            y:[d.y[Math.round(currentTime/100)]],
            name:`Current ${d.legendgroup}`,
            legendgroup: d.legendgroup,
            showlegend:false,
            mode:'markers',
            type: 'scattergl',
            marker: {
                size:6,
                color:'rgba(0, 0, 0, 0)',
                line: {color:TIMECOLOR,width:1},
            }
        })));
    },[primary,currentTime])
    useEffect(()=>{
        setPlotdata([...primary,...sub]);
    },[primary,sub])
    return <Plot data={plotdata}
                 divId={id}
                 style={{width: '100%',height:'100%'}}
                 layout={layout}
                 onClick={({points})=>{
                     onChangeTime(points[0].data.text[points[0].pointIndex]);
                 }}
    />
}
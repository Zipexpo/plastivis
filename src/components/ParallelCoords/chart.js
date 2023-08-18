import {useMemo, useState,useEffect} from "react";
import {uniqueId} from "lodash";
import {emptyArray, monitormap} from "../ulti";
import Plot from 'react-plotly.js';
import {extent,color as d3color} from "d3";
const initLayout = {title:{text:'',pad:0},margin:{l:80,r:50,b:20,t:40,pad:0}};
export default function({data,colorBySims}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [primaryplotdata,setPrimaryPlotdata] = useState(emptyArray);
    const [subTrace,setSubTrace] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    useEffect(()=>{
        console.log(data);
        function unpack(input, key) {
            const out = [];
            Object.keys(input).forEach(sim=>{
                input[sim].forEach(function(row) {
                    out.push(row[key]);
                });
            })
            return out;
        }
        const sims = Object.keys(data);
        const simmap = {};
        sims.forEach((sim,i)=>simmap[sim]=i)
        const simList = [];
        sims.forEach((sim,i)=>{
            data[sim].forEach(()=>simList.push(i));
        })
        const plotdata = [
            {
                type: 'parcoords',
                line: {
                    // showscale: true,
                    // reversescale: true,
                    color:simList.map(d=>d/(sims.length-1)),
                    cmax: 1,
                    cmin: 0,
                    colorscale: sims.map((d,i)=>[i/(sims.length-1),colorBySims(d)])
                },
                dimensions:[]
            },
        ]
        console.log(plotdata[0].line)
        plotdata[0].dimensions.push({
            // range: extent(values),
            label: 'Monitor',
            values:simList,
            tickvals: sims.map((d,i)=>i),
            ticktext: sims,
        })
        // let c = d3color()
        if (sims[0]&&data[sims[0]][0]){

            const dimension = Object.keys(data[sims[0]][0]);
            dimension.forEach(dim=>{
                const values = unpack(data, dim);
                plotdata[0].dimensions.push({
                    // range: extent(values),
                    label: monitormap[dim]??dim,
                    values
                })
            })
            debugger
        }

        // .forEach(sim=>{
        //
        // })
        const layout = {...initLayout};
        setLayout(layout);
        setPlotdata(plotdata);
    },[data,colorBySims])
    return <Plot data={plotdata}
                 divId={id}
                 style={{width: '100%',height:'100%'}}
                 layout={layout}
                 />
}
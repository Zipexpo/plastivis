import {useEffect, useState, useTransition,useMemo} from "react";
import Plot from 'react-plotly.js';
import {emptyArray, getAnnotation, TIMECOLOR} from "../ulti";
import {uniqueId} from "lodash";
import {drag,pointer,color as d3color} from "d3"
import {select} from "d3-selection"

const initLayout = {title:{text:'',pad:0},margin:{l:80,r:50,b:20,t:40,pad:0},
    xaxis:{
        title:"Time step"
    }};
export default function ({data,subdata,colorByName,currentTime=0,onChangeTime}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [isPending,startTransition] = useTransition();
    const [primaryplotdata,setPrimaryPlotdata] = useState(emptyArray);
    const [subTrace,setSubTrace] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    useEffect(()=>{
        const plotdata = [];
        const annotations = [{
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x: currentTime,
            y:1,
            text: Math.round(currentTime),
            yanchor:'bottom',
            font: {
                color:TIMECOLOR
            },
            showarrow: false,
        }];
        const dy = 1/data.length;
        const chartMap = {};
        data.forEach((d,i)=>{
            // by metrics
            if (!chartMap[d.name] && (!d.mode)) {
                chartMap[d.name] = true;
                annotations.push({
                    text: d.name,
                    font: {
                        size: 16,
                    },
                    showarrow: false,
                    align: 'center',
                    x: 0.5,
                    y: 1.01,
                    xref: 'paper',
                    yref: `y${d.index+1} domain`
                })
            }
            const x = d.x;
            Object.keys(d.y).forEach(k=>{
                // by sim
                const item = {
                    x,
                    y:d.y[k],
                    yaxis: `y${d.index+1}`,
                    name: k,//`${k}-${d.name}`,
                    legendgroup: k,
                    showlegend: i===1,
                    type: "scatter",
                    line: {
                        color:colorByName(k)
                    }
                };
                if (d.mode==='gap'){
                    item.fill = 'tozerox'
                    item.line = {color: "transparent"}
                    const c = d3color(colorByName(k));
                    c.opacity = 0.3
                    item.fillcolor = c.toString();
                }else if(d.mode==='point'){
                    item.mode='markers';
                    item.marker={
                        fillColor: colorByName(k)
                    }
                }else{
                    item.line.dash = d.mode;
                }
                plotdata.push(item)
            })

        })
        setPrimaryPlotdata(plotdata)
        setLayout({
            ...initLayout,
            grid: {rows: data.total, columns: 1},
            annotations,
            shapes: getAnnotation([
                {
                    type:'line',
                    xref:'x',
                    x0: currentTime,
                    x1: currentTime,
                    y0:0,
                    y1:1,
                    yref:'paper',
                    line:{
                        width:1,
                        dash: 'dot',
                        color:TIMECOLOR
                    },
                    editable: false
                },
                {
                    type:'line',
                    xref:'x',
                    x0: currentTime,
                    x1: currentTime,
                    y0:0,
                    y1:1,
                    yref:'paper',
                    opacity:0,
                    line:{
                        width:8
                    },
                    editable: true
                },
            ],d=>d3color(colorByName(d)))
        })
    },[data])
    useEffect(()=>{
        const subTrace = [];

        subdata.forEach((d,i)=>{
            // by metrics
            Object.keys(d.y).forEach(k=>{
                // by sim
                const trace = {
                    x:d.x[k].map(d=>d*100),
                    y:d.y[k],
                    yaxis: `y${i+1}`,
                    name: `Outlier ${k}`,//`${k}-${d.name}`,
                    legendgroup: `Outlier ${k}`,
                    showlegend: !i,
                    mode:'markers',
                    marker: {
                        color:'red'
                    }
                };
                subTrace.push (trace)
            })
        })
        setSubTrace(subTrace)
    },[subdata])
    useEffect(()=>{
        setPlotdata([...primaryplotdata,...subTrace])
    },[primaryplotdata,subTrace])
    useEffect(()=>{
        if (layout&&layout.shapes&&layout.shapes[0]) {
            layout.shapes[0].x0 = currentTime;
            layout.shapes[0].x1 = currentTime;
            layout.shapes[1].x0 = currentTime;
            layout.shapes[1].x1 = currentTime;
            layout.annotations[0].x = currentTime;
            layout.annotations[0].text = currentTime;
            setLayout({...layout})
        }
    },[currentTime])
    return <Plot data={plotdata}
                 divId={id}
                 style={{width: '100%',height:'100%'}}
                 layout={layout}
                 useResizeHandler={true}
                 onUpdate={()=>{
                     let update = ()=>{
                         let gd = document.getElementById(id);
                         if (gd) {
                             let xaxis = gd._fullLayout.xaxis;
                             let gd_3 = select(gd);
                             let timeMark = gd_3.select('path[data-index="1"]').style('cursor', 'ew-resize');
                             timeMark.on('mouseover', () => {
                                 timeMark.style('stroke', 'yellow').style('opacity', 0.5)
                             }).on('mouseleave', () => {
                                 timeMark.style('stroke', null).style('opacity', null)
                             }).call(drag().on("drag", (evt) => {
                                 requestAnimationFrame(() => {
                                     const point = pointer(evt,gd);
                                     let xInDataCoord = xaxis.p2d(point[0] - (+gd_3.select('.nsewdrag.drag').attr('x')));
                                     let currentTime = (xInDataCoord);
                                     layout.shapes[0].x0 = currentTime;
                                     layout.shapes[0].x1 = currentTime;
                                     layout.shapes[1].x0 = currentTime;
                                     layout.shapes[1].x1 = currentTime;
                                     layout.annotations[0].x = currentTime;
                                     layout.annotations[0].text = Math.round(currentTime);
                                     setLayout({...layout})
                                 })
                             }).on('end', (evt) => {
                                 const point = pointer(evt,gd);
                                 let xInDataCoord = xaxis.p2d(point[0] - (+gd_3.select('.nsewdrag.drag').attr('x')));

                                 let currentTime_snap = Math.round(xInDataCoord/100)*100;

                                 layout.shapes[0].x0 = currentTime_snap;
                                 layout.shapes[0].x1 = currentTime_snap;
                                 layout.shapes[1].x0 = currentTime_snap;
                                 layout.shapes[1].x1 = currentTime_snap;
                                 layout.annotations[0].x = currentTime_snap;
                                 layout.annotations[0].text = currentTime_snap;
                                 onChangeTime(currentTime_snap);
                                 setLayout({...layout})
                             }))
                             // let timeMark2 = gd_3.select('path[data-index="2"]')
                             //     .style('pointer-events','auto');
                             // timeMark2.on('mouseover', () => {
                             //     timeMark2.style('stroke-width', 4);
                             // }).on('mouseleave', () => {
                             //     timeMark2.style('stroke-width', 2);
                             // }).on('click',()=>{
                             //     onChangeTime(10000);
                             // });
                             // if (timeMark2.select('title').empty())
                             //    timeMark2.append('title').text('We disable the neurons from areas 5 and 8')
                         }
                     };
                     update();
                 }}
        // config={{responsive:true}}
    />
}
import {useEffect, useState, useTransition,useMemo} from "react";
import Plot from 'react-plotly.js';
import {emptyArray, getAnnotation, TIMECOLOR} from "../ulti";
import {uniqueId} from "lodash";
import {drag,pointer,color as d3color} from "d3"
import {select} from "d3-selection"
import Grid from "@mui/material/Grid";
import {Box} from "@mui/material";
import PlotlyLegendCustom from "../PlotlyLegendCustom";

const initLayout = {title:{text:'',pad:0},margin:{l:80,r:10,b:20,t:20,pad:0},
    xaxis:{
        title:"Time step",
        range:[0,1000000]
    }};
export default function ({data,region,subdata,colorByName,currentTime=0,onChangeTime,onChangeRegion}){
    const id = useMemo(()=>`timeline${uniqueId()}`,[]);
    const [isPending,startTransition] = useTransition();
    const [primaryplotdata,setPrimaryPlotdata] = useState(emptyArray);
    const [subTrace,setSubTrace] = useState(emptyArray);
    const [plotdata,setPlotdata] = useState(emptyArray);
    const [layout,setLayout] = useState(initLayout);
    const [legendData,setLegendData] = useState({area:[],sims:[]})
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
        const sims = {};
        const chartMap = {};
        const legendName = {};
        const sublist={};
        data.forEach((d,i)=>{
            // by metrics
            const x = d.x;
            Object.keys(d.y).forEach(k=>{
                // by sim
                // const name = `${k}-${d.region}`;
                const name = `${k}`;
                const item = {
                    x,
                    y:d.y[k],
                    yaxis: `y${d.index+1}`,
                    text:d.region,
                    name,
                    legendgroup: k,
                    showlegend: false,
                    type: 'scattergl',
                    line: {
                        color:colorByName(k)
                    },
                    customdata:d.region,
                    ...(d.option??{})
                }
                if (item.marker){
                    item.marker = {...item.marker};
                    item.marker.color = item.line.color;
                    item.line.width = 0.5;
                    item.marker.size = 5;
                }
                sims[k] = true;
                plotdata.push(item);
                if  (d.region!=='none-event') {
                    if (!sublist[d.region]) {
                        sublist[d.region] = {
                            name: d.region,
                            type: "Region",
                            marker: {...item.marker, color: 'black'},
                            trace: []
                        }
                    }
                    sublist[d.region].trace.push(item)
                }
                if (!legendName[name]){
                    // item.showlegend = true;
                    legendName[name] = {name,
                        type:"Sims",
                        line: {...item.line},
                        trace:[]
                    };
                }
                legendName[name].trace.push(item)
            })
            if (!chartMap[d.name]) {
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
        })
        // Object.values(sublist).forEach(d=>plotdata.push(d))
        setLegendData({area:sublist,sims:legendName})
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
                }],d=>d3color(colorByName(d)),Object.keys(sims),sublist)
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
    return <Grid container sx={{width: '100%',height:'100%', position:'relative'}}>
        <Grid xs={10} item>
                <Plot data={plotdata}
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
                                     // gd.on('plotly_legendclick', function(event){
                                     //     // event.event.stopPropagation();
                                     //     // event.curveNumber legendMark
                                     //     if (event.data[event.curveNumber].legendMark) {
                                     //         const status = event.data[event.curveNumber].visible === 'legendonly'?true:'legendonly'
                                     //         event.data.filter(d=>d.text===event.data[event.curveNumber].name)
                                     //             .forEach(d=>d.visible=status)
                                     //     }
                                     // })
                                 }
                             };
                             update();
                         }}
                         onClick={({points})=>{
                             onChangeRegion({[points[0].data.customdata]:true});
                         }}
                         config={{responsive:true}}
            />
        </Grid>
        <Grid xs={2} item sx={{height:'100%'}}>
            <Box sx={{overflowY:'auto'}}>
                <PlotlyLegendCustom
                    traces={plotdata}
                    legendData={legendData}
                    onChange={(d)=>setPlotdata(d)}
                    onVisiblesync={onChangeRegion}
                />
            </Box>
        </Grid>
    </Grid>
}
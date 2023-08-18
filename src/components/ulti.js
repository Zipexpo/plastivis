import {timeFormat as d3timeFormat} from "d3-time-format"
import {timeSecond, timeMinute, timeHour, timeDay, timeMonth,timeWeek,timeYear} from "d3-time"
import {annotations} from "../providers/DataProvider/Provider";
import {color as d3color} from "d3";
export function getRange(target,inspect){
    if (inspect[0]<target[0])
        target[0] = inspect[0];
    if (inspect[1]>target[1])
        target[1] = inspect[1];
    return target
}

const formatMillisecond = d3timeFormat(".%L"),
    formatSecond = d3timeFormat("%I:%M:%S"),
    formatMinute = d3timeFormat("%I:%M"),
    formatHour = d3timeFormat("%I %p"),
    formatDay = d3timeFormat("%a %d"),
    formatWeek = d3timeFormat("%b %d"),
    formatMonth = d3timeFormat("%B"),
    formatYear = d3timeFormat("%Y");

export function multiFormat(date) {
    return (timeSecond(date) < date ? formatMillisecond
        : timeMinute(date) < date ? formatSecond
            : timeHour(date) < date ? formatMinute
                : timeDay(date) < date ? formatHour
                    : timeMonth(date) < date ? (timeWeek(date) < date ? formatDay : formatWeek)
                        : timeYear(date) < date ? formatMonth
                            : formatYear)(date);
}

export const schemeCategory20 = ["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5"]

export const emptyObject = {};
export const emptyArray = [];
export const TIMECOLOR = "black";
export const monitormap = {
    'elecActivity': "Electrical Activity",
    'calcium':"Calcium",
    'targetCalcium':"Target calcium",
    'synapticInput':"Synaptic input",
    'grownAxons':"Grown axons",
    'conDendrites':"Connected excitatory dendrites",
    'grownDendrites':"Grown excitatory dendrites",
    'conAxons':"Connected axons"
}

export function getAnnotation(_shapes,colorFunc,sim,region,addDetail=(d,colorFunc)=>{
    const basic = {
        opacity:0.5,
        xref:'x',
        y0:0,
        y1:1,
        yref:'paper',
        label: {
            text: d.area.join(', '),
            textposition: 'bottom center',
        },
        // layer: 'below'
    };
    const color = colorFunc(d.sim);
    if (d.type==='line')
        basic.line = {
            width:2,
            color: color.toString()
        }
    else {
        basic.line = {
            width:1,
            color: color.toString()
        }
        color.opacity=0.3;
        basic.fillcolor = color.toString();
    }
    return basic;
}) {
    const shapes = [..._shapes];
    const checkSim = sim?((d)=>sim.indexOf(d.sim)!==-1):()=>true;
    const checkRegion = region?((d)=>region[d.area]):()=>true;
    annotations.forEach((d)=>{
        if (checkSim(d)&&checkRegion(d))
            shapes.push({...d,...addDetail(d,colorFunc)})
    })
    return shapes
}
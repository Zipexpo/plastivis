import React from "react";
import {uniqueId} from "lodash";
import {format,scaleLinear} from "d3"
const ColorLegend = ({colorScale,textColor="currentColor",range,height=30,cutomTicks,barHeight=10,style={},...other})=>{
    const id = React.useMemo(()=>uniqueId(),[]);
    const {ticks,cloneColor} = React.useMemo(()=>{
        const _range = colorScale.domain();
        const newRange = (_range[0]>_range[1])?range.slice().reverse():range.slice();
        const scale = colorScale.copy().domain(range);
        const scalep = scaleLinear().domain([newRange[0]??0,newRange[1]??0].sort((a,b)=>a-b)).range([0,100])

        return {ticks:scalep.ticks(10).sort((a,b)=>a-b).map(v=>[v,scalep(v)]),cloneColor:scale};
    },[colorScale,range]);
    return <svg style={{width:'100%',height,...style}}>
        <defs>
            <linearGradient id={"linear-gradient"+id}>
                {ticks.map((t, i, n) => <stop key={t[0]} offset={`${t[1]}%`} stopColor={cloneColor(t[0])}/>)}
            </linearGradient>
        </defs>
        <rect width={'100%'} height={barHeight} style={{fill:`url(#${"linear-gradient"+id})`}}/>
        {[[range[0],0],[range[1],100]].map((t, i, n) => <text
            key={i} x={`${t[1]}%`} dy={"1rem"} y={barHeight}
            textAnchor={i?"end":'start'}
            fill={textColor}>{cutomTicks?cutomTicks[t[0]]:Math.abs(t[0])>999?format('.2s')(t[0]):format('.2f')(t[0])}</text>)}
    </svg>
}
export default ColorLegend
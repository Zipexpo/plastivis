import React, {useRef, memo, useEffect, useMemo, useState, useLayoutEffect, createRef, useTransition, useCallback} from "react";
import {Canvas} from "@react-three/fiber";
import CameraComponentOrbit from "./CameraComponentOrbit";
import {EffectComposer, Bloom} from '@react-three/postprocessing';
import {interpolateTurbo,interpolateBuPu} from "d3-scale-chromatic";
import {scaleSequential} from "d3-scale";
import {mean as d3mean,groups as d3groups} from "d3";
import "./index.css"

import {
    Html,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
    GizmoHelper,
    GizmoViewport,
    Billboard,
    Text,
    Plane,
    useTexture,
    RoundedBox,
    Circle,
    Stars,
    AccumulativeShadows,
    RandomizedLight,
    View,
    Point,
    Extrude,
    PivotControls, Line, Shape, Instance, Instances, CatmullRomLine, Sphere, Center, Segments, Segment
} from "@react-three/drei";
import {extent, scaleLinear, max as d3max} from "d3";
import * as THREE from "three";
import {emptyObject} from "../ulti";
import ColorLegend from "../ColorLegend";
import {Grid} from "@mui/material";

const sMax = 5;
const scaleInit = scaleLinear().domain([0,186]).range([0,sMax]);
export default function({data,showData,
                            showNetcreatedin,
                            showNetcreatedout,
                            showNetdeletedin,
                            showNetdeletedout,
                            showSub,netData,subdata,subdataValue,filter=100,name="",nodekey = "neurons",
                            choosenId,choosenArea,
                            onChoose}) {
    const ref = useRef();
    const myOrbit = useRef();
    const [hover, setHover] = useState();
    const [scheme,setScheme] = useState({views:[],colorScale:scaleSequential(interpolateTurbo)});
    const [subdataScheme,setSubdataScheme] = useState({colorScale:scaleSequential(interpolateTurbo)});
    const refList = useMemo(()=>[0,1,2,3].map(d=>createRef()),[]);
    const [scale,setScale] = useState({xScale:scaleInit,yScale:scaleInit,zScale:scaleInit});
    const [subNodes,setSubNodes] = useState([]);
    const [netDraw,setNetDraw] = useState({});
    const [centerVector,setCenterVector] = useState([0,0,0]);
    const [isPending,startTransition] = useTransition();
    useLayoutEffect(()=>{
        startTransition(()=>{
            const {xScale,yScale,zScale} = scale;
            if (data) {
                let valScale = scaleLinear().range([0, 3]);

                const nodesFlat = [];
                const nodesById = {};

                let views = Object.keys(data[nodekey]).map(k => {
                    if (data[nodekey][k][0]) {
                        let keys = Object.keys(data[nodekey][k][0]);
                        let valuesName = keys[keys.length - 1];
                        let nodes = data[nodekey][k].map(d => {
                            const value = d[valuesName];
                            const point = {
                                scene: k,
                                data: d,
                                value
                            }
                            nodesFlat.push(point);
                            if (!nodesById[d.neuronID]){
                                nodesById[d.neuronID] = [];
                            }
                            nodesById[d.neuronID].push(point)
                            point.neighbor = nodesById[d.neuronID];
                            return point;
                        })
                        return {name: k, nodes, links: []}
                    }
                    return {name: k, nodes: [], links: []}
                })

                valScale.domain(extent(nodesFlat, d => d.value)).nice();

                const colorScale = scaleSequential(interpolateTurbo).domain(valScale.domain());

                views.forEach(({nodes, links}) => {
                    nodes.sort((a,b)=>Math.abs(a.value)-Math.abs(b.value));
                    nodes.forEach(d => {
                        d.valueScale = valScale(d.value);
                        d.pos = [xScale(d.data.x), yScale(d.data.y), zScale(d.data.z)];//+d.valueScale/2
                        d.color=colorScale(d.value);
                    })
                })
                setScheme({views,colorScale})
            }
        })
    },[data,scale]);
    useLayoutEffect(()=>{
        const dataFlat = [];
        Object.keys(subdataValue).forEach(k=>{
            Object.keys(subdataValue[k]).forEach(kk=>{
                dataFlat.push(subdataValue[k][kk]);
            })
        })
        const colorScale = scaleSequential(interpolateBuPu).domain(extent(dataFlat));
        setSubdataScheme({colorScale})
    },[subdataValue])
    useLayoutEffect(()=>{
            if (subdata.length) {
                const {xScale,yScale,zScale} = scale;
                const subnodes = subdata.map(d => {
                    const item = {
                        data: d,
                        pos: [xScale(d['pos x']), yScale(d['pos y']), zScale(d['pos z'])]
                    }
                    return item;
                });
                const xMeanC = d3mean(subnodes, d => d.pos[0]);
                const yMeanC = d3mean(subnodes, d => d.pos[1]);
                const zMeanC = d3mean(subnodes, d => d.pos[2]);
                const vec = new THREE.Vector3();
                const groupsRegion = d3groups(subnodes,d=>d.data.area);
                groupsRegion.forEach(d=>{
                    const xMean = d3mean(d[1], d => d.pos[0]);
                    const yMean = d3mean(d[1], d => d.pos[1]);
                    const zMean = d3mean(d[1], d => d.pos[2]);
                    d.center = [xMean,yMean,zMean];
                    vec.set(xMeanC-xMean,yMeanC-yMean,zMeanC-zMean);
                    vec.normalize().multiplyScalar(-1);
                    d[1].forEach(e=>{
                        e.pos = [e.pos[0]+vec.x,e.pos[1]+vec.y,e.pos[2]+vec.z]
                    })
                })

                setSubNodes(subnodes)

                // setScale({x: xScale, y: yScale, z: zScale})

                setCenterVector([xMeanC-2.5, yMeanC-2.5, zMeanC-2.5])
            }
    },[subdata,scale]);
    useLayoutEffect(()=>{
        if (subNodes.length) {
            const netDraw = {};
            Object.keys(netData).forEach(sim=>{
                console.log(`----${sim}--------`)
                netDraw[sim] = netData[sim].map(({type,data})=>{
                    console.log(data.length)
                    return data.map(([sourceId,targetId])=>{
                        return [subNodes[sourceId-1].pos,subNodes[targetId-1].pos]
                    })
                })
            })
            setNetDraw(netDraw)
        }
    },[subNodes,netData])
    const onPointerChoose = useCallback((e, obj) => {
        startTransition(() => {
            e.stopPropagation();
            onChoose(obj.data.neuronID??obj.data['local id'],obj.data.area);
        });
    }, [scheme]);
    const onPointerOver = useCallback((e, obj) => {
        startTransition(() => {
            e.stopPropagation();
            // scheme
            obj.neighbor.forEach(d => d.highlight = true);
            // obj.highlight = true;
            setHover(obj);
        });
    }, [hover,scheme]);
    const onPointerOut = useCallback((e, obj) => {
        startTransition(() => {
            obj.neighbor.forEach(d => d.highlight = false);
            // obj.highlight = false;
            if (hover === obj) {
                setHover(undefined);
            }
        });
    }, [hover,scheme]);


    return <Grid ref={ref} className={'container'} container
                 direction="row"
                 justifyContent="center">
        {
            refList.map((view,i)=><Grid item xs={scheme.views.length<2?12:6} key={`ref${i}`} ref={view} id={`view3d${i}`}
                                            style={{ height:(scheme.views.length>2?'50%':'100%') }} />)
        }
        <Canvas
            eventSource={ref}
            frameloop={"demand"}
            className="canvas"
            // shadows
            // style={{overflow: 'visible'}}
            raycaster={{params: {Points: {threshold: 0.01}}}}
            camera={{position: [10, 12, 12], fov: 25}}
            // onCreated={(state) => {
            //     state.gl.localClippingEnabled = true;
            // }}

        >
            <color attach="background" args={['black']}/>

            {
                scheme.views.map(({nodes,links,name},i)=><View
                    index={i+1}
                    track={refList[i]} key={`view${i+1}`}>
                    <color attach="background" args={['#4b4b4b']}/>
                    <ambientLight intensity={0.5}/>
                    <directionalLight position={[150, 150, 150]} intensity={1}/>
                    <group position={[-2.5,-2.5,-2.5]}>
                        <Text position={[-3,-3,1]} scale={0.5}>{name}</Text>
                        {/*<Center>*/}

                            <Instances limit={50000} visible={showSub}>
                                <sphereGeometry args={[0.02, 10, 10]}/>
                                <meshStandardMaterial roughness={1} vertexColors />
                                {subNodes.map((data, i) => (
                                    <Instance key={`neuron_o${i}`} position={data.pos}
                                              color={(subdataValue[name]&&subdataValue[name][data.data.area])?subdataScheme.colorScale(subdataValue[name][data.data.area]):'#ffffff'}
                                              scale={(data.data.area===choosenArea)?2:1}
                                              // onPointerOver={(e) => onPointerOver(e,data)}
                                              // onPointerOut={(e) => onPointerOut(e, data)}
                                              onClick={(e)=>onPointerChoose(e,data)}
                                    />
                                ))}
                            </Instances>
                            <Segments limit={100000} lineWidth={1.0} visible={showNetcreatedin}>
                                {(netDraw[name] ?? [[]])[0].map((d,i)=><Segment key={`created${i}`} start={d[0]} end={d[1]} color="blue"/>)}
                            </Segments>
                            <Segments limit={100000} lineWidth={1.0} visible={showNetcreatedout}>
                                {(netDraw[name] ?? [[]])[1].map((d,i)=><Segment key={`created${i}`} start={d[0]} end={d[1]} color="blue"/>)}
                            </Segments>
                            <Segments limit={100000} lineWidth={1.0} visible={showNetdeletedin}>
                                {(netDraw[name]??[[],[]])[2].map((d,i)=><Segment key={`deleted${i}`} start={d[0]} end={d[1]} color="red"/>)}
                            </Segments>
                            <Segments limit={100000} lineWidth={1.0} visible={showNetdeletedout}>
                                {(netDraw[name]??[[],[]])[3].map((d,i)=><Segment key={`deleted${i}`} start={d[0]} end={d[1]} color="red"/>)}
                            </Segments>

                            <Instances limit={50000} visible={showData} range={Math.round(nodes.length*filter/100)}>
                                <boxGeometry args={[0.01,0.01,1]}/>
                                <meshLambertMaterial toneMapped={false}/>
                                {nodes.map((obj, i) => (
                                    <Box key={i}  position={obj.pos} color={obj.color??'#ff0000'}
                                         scale={[obj.highlight?10:((obj.data.neuronID===choosenId)?5:1),obj.highlight?10:((obj.data.neuronID===choosenId)?5:1),obj.valueScale]}
                                         onPointerOver={(e) => onPointerOver(e,obj)}
                                         onPointerOut={(e) => onPointerOut(e, obj)}
                                         onClick={(e)=>onPointerChoose(e,obj)}
                                         lookAt={centerVector}
                                    />
                                ))}
                            </Instances>
                            {/*<Sphere position={centerVector} color={'#ff0000'}/>*/}
                        {/*</Center>*/}
                        {/*<Sphere args={[sMax,20,20]} position={[sMax/4,sMax/4,sMax/4]}>*/}
                        {/*    <meshStandardMaterial wireframe/>*/}
                        {/*</Sphere>*/}
                    </group>
                </View>)
            }
            {/*<EffectComposer>*/}
            {/*    <Bloom mipmapBlur luminanceThreshold={1} radius={0.7}/>*/}
            {/*</EffectComposer>*/}
            {/*<GizmoHelper alignment="bottom-right" margin={[80, 80]}>*/}
            {/*    <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white"/>*/}
            {/*</GizmoHelper>*/}
            {/*<CameraComponentOrbit ref={myOrbit} makeDefault/>*/}
            <OrbitControls makeDefault position={[10, 12, 12]} fov={25}/>
        </Canvas>
        <div className={"legendDiv"} style={{width:200,height:10,margin:10}}>
            {showData&&<><span style={{color:"white"}}>{name}</span>
            <ColorLegend colorScale={scheme.colorScale}
                          textColor={"white"}
                          range={scheme.colorScale.domain()}
                          style={{overflow: 'visible', paddingRight: 10}}/></>}
            {showSub&&<><span style={{color:"white"}}>{name} (Region)</span>
            <ColorLegend colorScale={subdataScheme.colorScale}
                          textColor={"white"}
                          range={subdataScheme.colorScale.domain()}
                          style={{overflow: 'visible', paddingRight: 10}}/></>}
            {Object.keys(netDraw).map(sim=><div key={sim}>
                <span>Connection of "{sim}"</span>
                {[[showNetcreatedin,showNetcreatedout],[showNetdeletedin,showNetdeletedout]].map((c,i)=><div key={i}>
                    <span style={{color:i?'red':'blue'}}>#{i?"Deleted":"Created"} connection: </span>
                    <br/>
                    {c.map((t,ii)=><span key={[i,ii]} style={{marginLeft:ii?30:10}}>{ii?'out':'in'}: {netDraw[sim][i*2+ii].length}</span>)}
                </div>)}
            </div>)}
        </div>
    </Grid>
}

function Box({id, color,lookAt, scale=1, instanProps=emptyObject, temp = new THREE.Object3D(), ...props}) {
    const ref = useRef()
    useEffect(()=>{
        if (ref.current)
            ref.current.lookAt(...lookAt)
    },[lookAt])
    return (
        <group {...props}>
            <Instance ref={ref} color={color} scale={scale} {...instanProps}/>
        </group>
    )
}
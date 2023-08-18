import { GizmoHelper, GizmoViewcube, OrbitControls,useSpring } from "@react-three/drei";
import React,{ useRef, useEffect, useState,useImperativeHandle } from "react";
import {useFrame,useThree} from "@react-three/fiber";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js"

let p = new THREE.Vector3(0,0,0);
const CameraComponentOrbit = React.forwardRef((others,ref) => {
	const {camera} = useThree();
    const divRef = useRef(null);
    const [animated,setAnimated] = useState(false);
    useImperativeHandle(ref,()=>({
    	pointOfView: function pointOfView(){
    		setAnimated(true);
    		let finalPos = arguments.length>0 && arguments[0]!==undefined ? arguments[0] :{};
    		let transition = arguments.length>1 && arguments[1]!==undefined ? arguments[1] :0;
    		let curentPos = {...(divRef.current?divRef.current.object.position:camera.position),zoom: camera.zoom};

    		let finalLookAt = {
    			x: finalPos.lookAtX??0,
    			y: finalPos.lookAtY??0,
    			z: finalPos.lookAtZ??0,
    		};
    		let currentLookAt = divRef.current?divRef.current.target: p.set(0,0,0).clone().applyQuaternion(camera.quaternion).add(camera.position);

    		new TWEEN.Tween(curentPos).to(finalPos,transition).easing(TWEEN.Easing.Quadratic.InOut)
    		.onUpdate(p=>setCameraPos(p)).start();
    		new TWEEN.Tween(currentLookAt).to(finalLookAt,transition/3).easing(TWEEN.Easing.Quadratic.InOut)
    		.onUpdate(p=>setLookAt(p)).start();

    		function setCameraPos(input){
                const {x,y,z,zoom} = input
    			if (divRef.current){
                    p.set(x??divRef.current.object.position.x,
                        y??divRef.current.object.position.y,
                        z??divRef.current.object.position.z);
                    console.log([p.x,p.y,p.z])
                    divRef.current.object.position.lerp(p,1);
        //             divRef.current.object.position.x = p.x;
        //             divRef.current.object.position.y = p.y;
    				// divRef.current.object.position.z = p.z;
    				divRef.current.object.zoom = zoom??divRef.current.object.zoom;
    				divRef.current.object.updateProjectionMatrix();
    				divRef.current.update();
    			}else{
                    p.set(x??camera.position.x,y??camera.position.y,z??camera.position.z);
    				camera.position.lerp(p,1);
    				camera.zoom = zoom??camera.zoom;
    				camera.updateProjectionMatrix();
    			}
    		}
    		function setLookAt({x,y,z}){
    			p.set(x,y,z);
    			if (divRef.current){
    				divRef.current.target.lerp(p,1);
    				divRef.current.update();
    			}else{
    				camera.lookAt(p);
    				camera.updateProjectionMatrix();
    			}
    		}
    	},
    	current: divRef.current
    }),[camera]);
    useFrame (()=>{
    	if (animated){
    		TWEEN.update()
    	}
    })
    return<><OrbitControls ref={divRef} enableDamping={false} {...others}/>
        </>
    ;
});

export default CameraComponentOrbit;

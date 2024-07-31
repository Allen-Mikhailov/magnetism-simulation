import { Vector3 } from "../pkg/magnetism_simulation.js"
import * as THREE from "./threejs/three.js"

function createKey() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function bool_call(bool, callback)
{
    if (bool)
        callback()
}

function vec3_from_obj(obj)
{
    return Vector3.js_new(obj.x, obj.y, obj.z)
}

function three_vec_from_obj(obj)
{
    return new THREE.Vector3(obj.x, obj.y, obj.z)
}

function color_array(color)
{
	return [color.r*255, color.g*255, color.b*255, 255]
    // return [255, 255, 255, (color.r)*255]
}

function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function time_function(label, callback)
{
    const start = performance.now();

    callback()

    const end = performance.now();
    console.log(`${label} Execution time: ${end - start} ms`);
}


export {
    createKey,
    bool_call,
    vec3_from_obj,
    three_vec_from_obj,
    color_array,
    time_function,
    mulberry32
}
import CubePointCloud from "./simulation_components/CubePointCloud.js";
import StraightWireObj from "./simulation_components/StraightWireObj.js";
import FieldLinePoint from "./simulation_components/FieldLinePoint.js";
import CubicBezierWireApprox from "./simulation_components/CubicBezierWireApprox.js";

const class_strings = {
    "StraightWire": StraightWireObj,
    "CubePointCloud": CubePointCloud,
    "CubicBezierWireApprox": CubicBezierWireApprox,
    "FieldLinePoint": FieldLinePoint
}

function load_from_object(world_object, obj)
{
    const simulation_obj = new class_strings[obj.type](world_object, obj)
    return simulation_obj
}   

export {load_from_object, class_strings}
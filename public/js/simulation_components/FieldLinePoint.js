import { FieldLineProducer } from "../SimulationObjectClasses.js"
import * as THREE from "../threejs/three.js"
import { bool_call } from "../Utils.js"

class FieldLinePoint extends FieldLineProducer
{
    constructor(world_object, base)
    {
        super(world_object, "FieldLinePoint", base)
    }

    update_field_line_points()
    {
        this.start_point_count = 1
        this.start_points = new Float64Array(1*3)
        this.start_points[0] = this.base.position.x
        this.start_points[1] = this.base.position.y
        this.start_points[2] = this.base.position.z

        this.start_point_polarities = new Float64Array(1)
        this.start_point_polarities[0] = 1

        super.update_field_line_points()
    }

    set_property(property, value, no_update)
    {
        // console.log("set property", property, value, typeof value)
        super.set_property(property, value, no_update)

        let point_update = false

        switch (property)
        {

            case "position":
                point_update = true
                break;

            case "size":
                point_update = true
                break;

            case "points":
                point_update = true
                break;
            case "rotation":
                point_update = true
                break;
        }

        if (point_update)
            this.needs_point_update = true

        bool_call(!no_update && point_update, () => this.update_field_line_points())
        bool_call(!no_update, () => this.update())
    }
}

export default FieldLinePoint
import { FieldProducer } from "../SimulationObjectClasses.js";
import * as THREE from "../threejs/three.js"
import { Vector3 } from "../../pkg/magnetism_simulation.js";

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

class StraightWireObj extends FieldProducer
{
    constructor(world_object, base)
    {
        super(world_object, "StraightWire", base)
        this.produces_field = true

        const handle = this.world_object.universe.add_straight_wire(
            vec3_from_obj(this.base.position),
            vec3_from_obj(this.base.direction),
            this.base.length
        );
        this.handle = handle

        this.assign_properties()

    }

    static get_default_data()
    {
        return {
            "type": "StraightWire",
            "display_name": "Test Wire",
            "position": {
                x: 0,
                y: 0,
                z: 0
            },
            "direction": {
                x: 0,
                y: 1,
                z: 0
            },
            "length": 10
        }
    }

    render()
    {
        super.render()
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const geometry = new THREE.BufferGeometry();
        const mesh = new THREE.Line(geometry, material)

        const points = []
        points.push(new THREE.Vector3(0, 0, 0))
        points.push(new THREE.Vector3(0, 1, 0))
        geometry.setFromPoints(points)

        mesh.updateMatrix()

        this.material = material
        this.geometry = geometry
        this.mesh = mesh

        this.update()

        this.world_object.scene.add(this.mesh)
    }

    destroy()
    {
        this.world_object.scene.remove(this.mesh)
        this.world_object.universe.free_handle(this.handle)
        super.destroy()
    }

    update()
    {
        super.update()

        if (!this.geometry) {return;}

        const position = three_vec_from_obj(this.base.position)
        const direction = three_vec_from_obj(this.base.direction)
        const length = this.base.length

        this.mesh.position.set(position.x, position.y, position.z)
        this.mesh.scale.set(1, length, 1)
        this.mesh.setRotationFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        )
    }

    selection_update(selected)
    {
        super.selection_update(selected)
    }

    set_property(property, value, no_update)
    {
        // console.log("set property", property, value, typeof value)
        super.set_property(property, value, no_update)

        switch (property)
        {
            case "length":
                this.world_object.universe.set_object_length(this.handle, value)
                bool_call(!no_update, () => this.update_field())
                break;

            case "position":
                this.world_object.universe.set_object_position(this.handle, vec3_from_obj(value))
                bool_call(!no_update, () => this.update_field())
                break;

            case "direction":
                this.world_object.universe.set_object_direction(this.handle, vec3_from_obj(value))
                bool_call(!no_update, () => this.update_field())
                break;
        }

        bool_call(!no_update, () => this.update())
    }

    selection_update(selected, with_tool)
    {
        super.selection_update()
        
        const three_js_handler = this.world_object.three_js_handler

        if (selected && with_tool) {
            const self = this
            three_js_handler.set_controls(this.mesh, () => {
                const direction = new THREE.Vector3(0, 1, 0).applyEuler(this.mesh.rotation)
                self.bulk_set_properties({
                    "position": {
                        x: self.mesh.position.x, 
                        y: self.mesh.position.y, 
                        z: self.mesh.position.z
                    },
                    "direction": {
                        x: direction.x,
                        y: direction.y,
                        z: direction.z,
                    }
                })
            })
        } else {
            three_js_handler.remove_controls()
        }

    }
}

export default StraightWireObj
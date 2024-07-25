import * as THREE from "../threejs/three.js"
import { FieldProducer } from "../SimulationObjectClasses.js"

import { bool_call, three_vec_from_obj, vec3_from_obj } from "../Utils.js"

class CubicBezierWireApprox extends FieldProducer
{
    constructor(world_object, base)
    {
        super(world_object, "CubicBezierWireApprox", base)
        this.produces_field = true
        this.handles = []

        this.assign_properties()

        this.handle_update()
        this.update_wire()
    }

    render()
    {
        super.render()
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const geometry = new THREE.BufferGeometry();
        const mesh = new THREE.Line(geometry, material)

        this.material = material
        this.geometry = geometry
        this.mesh = mesh

        this.update_wire()
        this.update()

        this.world_object.scene.add(this.mesh)
    }

    clean_up(scene)
    {
        scene.remove(this.mesh)
    }

    update()
    {
        super.update()

        if (!this.geometry) {return;}

        const position = three_vec_from_obj(this.base.position)
        // const direction = three_vec_from_obj(this.base.direction)
        // const length = this.base.length

        this.mesh.position.set(position.x, position.y, position.z)
    }

    selection_update(selected)
    {
        super.selection_update(selected)
    }

    handle_update()
    {
        // Checking for new handles
        while (this.handles.length < this.base.wires)
        {
            this.handles.push(this.world_object.universe.add_straight_wire(
                vec3_from_obj({x: 0, y: 0, z: 0}),
                vec3_from_obj({x: 0, y: 1, z: 0}),
                1
            ))
        }

        // freeing excess handles
        while (this.handles.length > this.base.wires)
        {
            this.world_object.universe.free_handle(this.handles[this.handles.length-1])
            this.handles.pop()
        }
    }

    update_wire()
    {
        const main_pos = three_vec_from_obj(this.base.position)
        const bezier = new THREE.CubicBezierCurve3(
            three_vec_from_obj(this.base.p1),
            three_vec_from_obj(this.base.p2),
            three_vec_from_obj(this.base.p3),
            three_vec_from_obj(this.base.p4)
        )
        const points = bezier.getPoints(this.base.wires+1)
        if (this.rendered)
        {
            this.geometry.setFromPoints(points)
            this.mesh.updateMatrix()
        }
        
        for (let i = 0; i < this.base.wires; i++)
        {
            const handle = this.handles[i]
            const position = vec3_from_obj(three_vec_from_obj(points[i]).add(main_pos))
            const dif = three_vec_from_obj(points[i+1]).sub(three_vec_from_obj(points[i]))
            const length = dif.length()
            const direction = vec3_from_obj({x: dif.x/length, y: dif.y/length, z: dif.z/length})

            this.world_object.universe.set_object_position(handle, position)
            this.world_object.universe.set_object_direction(handle, direction)
            this.world_object.universe.set_object_length(handle, length)
        }

        this.update_field()
    }

    set_property(property, value, no_update)
    {
        // console.log("set property", property, value, typeof value)
        super.set_property(property, value, no_update)

        switch (property)
        {
            case "wires":
                this.handle_update()
                bool_call(!no_update, () => this.update_wire())
                break;

            case "position":
                bool_call(!no_update, () => this.update_wire())
                break;
            case "p1":
                bool_call(!no_update, () => this.update_wire())
                break;
            case "p2":
                bool_call(!no_update, () => this.update_wire())
                break;
            case "p3":
                bool_call(!no_update, () => this.update_wire())
                break;
            case "p4":
                bool_call(!no_update, () => this.update_wire())
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

export default CubicBezierWireApprox
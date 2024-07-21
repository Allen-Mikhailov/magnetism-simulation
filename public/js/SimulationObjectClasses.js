import init, { 
    Universe, 
    Vector3
} from "../pkg/magnetism_simulation.js";
import { Events } from "./bars.js";
import ThreeJsHandler from "./ThreeJsHandler.js";

import * as THREE from "./threejs/three.js"

const DISPLAY_POINTS = false
const DISPLAY_CONES = false
const line_type = "sand"
const line_length = 1

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
  


class WorldObject
{
    constructor()
    {
        this.three_js_handler = null
        this.scene = null
        this.ui_loader = null
        this.universe = null
        this.wasm = null
    }
}

export { WorldObject }

class SimulationObject
{
    constructor(world_object, object_type, base)
    {
        this.world_object = world_object
        this.type = object_type
        this.base = base
        this.update_callbacks = {}
        this.key = createKey()

        this.needed_updates = {}

        this.local_events = new Events()

        this.selected = false
    }

    bulk_set_properties(properties)
    {
        const self = this
        Object.keys(properties).map((key) => {
            if (key == "type") {return;}
            self.set_property(key, properties[key], false)
        })
        this.local_events.fire("update_properties")

        // Needed updates
        Object.keys(this.needed_updates).map(key => {
            if (this.needed_updates[key])
                this[key]()
        })
        this.needed_updates = {}

        this.update()
    }

    assign_properties()
    {
        this.bulk_set_properties(this.base)
    }

    selection_update(selected)
    {
        this.selected = selected

        // if (this.handle)
        // {
            
        // }
    }
    

    render(scene)
    {
        this.rendered = true
    }

    set_property(property, value, no_update)
    {
        this.base[property] = value
    }

    update()
    {
        Object.keys(this.update_callbacks).map(key => {
            this.update_callbacks[key]()
        })
    }

    add_update_callback(name, callback)
    {
        this.update_callbacks[name] = callback
    }

    destroy()
    {

    }
}

class SandProducer extends SimulationObject
{
    constructor(world_object, _type, base)
    {
        super(world_object, _type, base)
        this.produces_sand = true

        this.point_count = 0
        this.points = new Float64Array()
        this.fields = new Float64Array()
        this.field_magnitudes = new Float64Array()

        // Rendering TODO: Switch to Float64 Arrays
        this.point_array = []
        this.line_array = []
        this.cone_array = []

        this.needs_point_update = false
    }

    update_points()
    {
        this.needs_point_update = false
        this.local_events.fire("point_update") // doesnt do anything rn

        this.field_update()
        this.local_events.fire("color_update")
    }   

    field_update()
    {
        const point_count = this.point_count

        const universe = this.world_object.universe
        const wasm = this.world_object.wasm

        // calculate all fields
        universe.set_record_point_count(point_count)
        const point_array_ptr = universe.record_points_ptr()
        const field_array_ptr = universe.record_point_vectors_ptr()

        const rust_point_array = new Float64Array(wasm.memory.buffer, point_array_ptr, point_count*3)

        // Filling point arrays
        rust_point_array.set(this.points, 0)
        universe.compute_record_points()

        const rust_field_array = new Float64Array(wasm.memory.buffer, field_array_ptr, point_count*3)

        this.fields = rust_field_array.slice(0, point_count*3)

        // calculating field magnitudes
        const field_magnitudes = new Float64Array(point_count)
        for (let i = 0; i < point_count; i++)
        {
            field_magnitudes[i] = new THREE.Vector3(
                rust_field_array[i*3+0], 
                rust_field_array[i*3+1], 
                rust_field_array[i*3+2]
            ).length()
        }

        this.field_magnitudes = field_magnitudes

        this.draw_fields()
    }

    draw_fields()
    {
        const point_array = []
        const line_array = []
        const cone_array = []

        const point_buffer = this.points
        const field_buffer = this.fields
        for (let i = 0; i < this.point_count; i++)
        {
            const point = new THREE.Vector3(
                point_buffer[i*3+0], 
                point_buffer[i*3+1], 
                point_buffer[i*3+2]
            )
    
            point_array.push(point)
            
            let p1 = point.clone()
            const p2 = point.clone()
    
            const field = new THREE.Vector3(
                field_buffer[i*3+0], 
                field_buffer[i*3+1], 
                field_buffer[i*3+2]
            ).normalize()

            if (line_type == "arrow" )
            {
                line_array.push(p1.addScaledVector(field,  line_length))
                line_array.push(p2)
            } else if (line_type == "sand") {
                line_array.push(p1.addScaledVector(field,  line_length/2))
                line_array.push(p2.addScaledVector(field, -line_length/2))
            } else {
                console.error("no line type wot", line_type);
            }

            // const vert = three_js_handler.createCone(p1, field)
			cone_array.push(...(ThreeJsHandler.createCone(p1, field)))
        }

        this.point_array = point_array
        this.line_array = line_array
        this.cone_array = cone_array

        // console.log(line_array)

        if (this.rendered)
        {
            this.point_buffer.setFromPoints(this.point_array)
            this.line_buffer.setFromPoints(this.line_array)
            this.cone_buffer.setFromPoints(this.cone_array)

            this.points_mesh.updateMatrix()
            this.lines_mesh.updateMatrix()
            this.cones_mesh.updateMatrix()
        }
    }

    color_update(colorband)
    {
        const field_buffer = this.fields

        const line_colors = []
        const cone_colors = []
        for (let i = 0; i < this.point_count; i++)
        {
            const field = this.field_magnitudes[i]
            
            const color = color_array(colorband.get_color(field))
            line_colors.push(...color)
            line_colors.push(...color)
    
            for (let i = 0; i < 4*3; i++)
                cone_colors.push(...color)
        }

        this.line_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(line_colors, 4, true));
        this.cone_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(cone_colors, 4, true));
    }

    render()
    {
        super.render()
        const point_buffer = new THREE.BufferGeometry()
        const line_buffer = new THREE.BufferGeometry()
        const cone_buffer = new THREE.BufferGeometry()

        this.point_buffer = point_buffer
        this.line_buffer = line_buffer
        this.cone_buffer = cone_buffer

        this.point_buffer.setFromPoints(this.point_array)
        this.line_buffer.setFromPoints(this.line_array)
        this.cone_buffer.setFromPoints(this.cone_array)

        const point_material  = new THREE.PointsMaterial({ color: 0xff0000, size: .05})
        const line_material = new THREE.LineBasicMaterial( { linewidth: .5, vertexColors: true, transparent: false, } );
        const cone_material = new THREE.MeshBasicMaterial( { vertexColors: true } );

        const points = new THREE.Points(point_buffer, point_material)
        const lines = new THREE.LineSegments(line_buffer, line_material)
        const cones = new THREE.Mesh( cone_buffer, cone_material );

        this.points_mesh = points
        this.lines_mesh = lines
        this.cones_mesh = cones

        const scene = this.world_object.scene
        if (DISPLAY_POINTS)
            scene.add(points)


        scene.add(lines)

        if (DISPLAY_CONES)
            scene.add(cones)
    }

    update()
    {
        this.update_points()
    }
}

const CLOUD_OPACITY = .1

class CubePointCloud extends SandProducer
{
    constructor(universe, base)
    {
        super(universe, "CubePointCloud", base)
        this.assign_properties()
    }

    render()
    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: CLOUD_OPACITY, transparent: true } );
        const cube = new THREE.Mesh( geometry, material );

        material.opacity = CLOUD_OPACITY

        this.geometry = geometry
        this.cube = cube

        this.world_object.scene.add( cube );

        super.render()
        this.render_update()
    }

    render_update()
    {
        if (this.rendered)
        {
            this.cube.scale.set(this.base.size.x, this.base.size.y, this.base.size.z)
            this.cube.position.set(this.base.position.x, this.base.position.y, this.base.position.z)    
            this.cube.updateMatrix()
        }
    }

    update_points()
    {
        const point_count = this.base.points.x*this.base.points.y*this.base.points.z
        this.point_count = point_count

        const randomness = this.base.randomness

        const rand_funct = mulberry32((this.base.random_seed)>>>0)
        const getRand = () => {return (rand_funct()*2-1)*randomness}

        const point_array = new Float64Array(point_count*3)

        const x_position = this.base.position.x
        const y_position = this.base.position.y
        const z_position = this.base.position.z
        
        const x_size = this.base.size.x
        const y_size = this.base.size.y
        const z_size = this.base.size.z

        const x_points = this.base.points.x
        const y_points = this.base.points.y
        const z_points = this.base.points.z

        const euler = new THREE.Euler(
            this.base.rotation.x,
            this.base.rotation.y,
            this.base.rotation.z
        )

        let i = 0;
        for (let x = 0; x < x_points; x++)
        {
            const xa = x/(x_points-1)
            const xp = (xa-0.5)*x_size
            for (let y = 0; y < y_points; y++)
            {
                const ya = y/(y_points-1)
                const yp = (ya-0.5)*y_size
                for (let z = 0; z < z_points; z++)
                {
                    const za = z/(z_points-1)
                    const zp = (za-0.5)*z_size

                    const pos = new THREE.Vector3(xp, yp, zp)
                    pos.applyEuler(euler)

                    point_array[i*3+0] = pos.x+x_position+getRand();
                    point_array[i*3+1] = pos.y+y_position+getRand();
                    point_array[i*3+2] = pos.z+z_position+getRand();

                    i++;
                }
            }
        }

        this.points = point_array
        

        super.update_points()
        this.render_update()
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

        bool_call(!no_update && point_update, () => this.update_points())
        bool_call(!no_update, () => this.update())
    }

    update()
    {
        super.update()
    }

    bulk_set_properties(bulk)
    {
        super.bulk_set_properties(bulk)
        if (this.needs_point_update)
            this.update_points()
    }

    selection_update(selected, with_tool)
    {
        super.selection_update(selected)
        
        const three_js_handler = this.world_object.three_js_handler

        if (selected && with_tool) {
            const self = this
            three_js_handler.set_controls(this.cube, () => {
                const rotation = this.cube.rotation
                self.bulk_set_properties({
                    "position": {
                        x: self.cube.position.x, 
                        y: self.cube.position.y, 
                        z: self.cube.position.z
                    },
                    "size": {
                        x: self.cube.scale.x, 
                        y: self.cube.scale.y, 
                        z: self.cube.scale.z
                    },
                    "rotation": {
                        x: rotation._x, 
                        y: rotation._y, 
                        z: rotation._z
                    }
                })
            })
        } else {
            three_js_handler.remove_controls()
        }

    }
}

export { CubePointCloud }

class FieldLineProducer extends SimulationObject
{
    constructor(world_object, _type, base)
    {
        super(world_object, _type, base)
        this.produces_field_lines = true

        this.start_point_count = 0
        this.start_points = new Float64Array(0)
        this.start_point_polarities = new Float64Array(0)
    }

    draw_field_lines()
    {
        const total_points = this.start_point_count*this.base.max_line_point_count
        const positions = new Float32Array(6*(total_points-1))

        for (let i = 0; i < total_points; i++)
        {
            positions[i*6+0] = this.field_lines[i*3+0]
            positions[i*6+1] = this.field_lines[i*3+1]
            positions[i*6+2] = this.field_lines[i*3+2]
            positions[i*6+3] = this.field_lines[i*3+3]
            positions[i*6+4] = this.field_lines[i*3+4]
            positions[i*6+5] = this.field_lines[i*3+5]
        }

        this.line_points_array = positions;

        if (this.rendered)
        {
            console.log("rendered")
            const geometry = this.geometry;
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.lines_mesh.updateMatrix()
        }
        
    }

    update_field_line_points()
    {

        const max_line_point_count = this.base.max_line_point_count
        const start_point_count = this.start_point_count

        const universe = this.world_object.universe
        const wasm = this.world_object.wasm

        universe.set_lines_count(start_point_count, max_line_point_count);

        const field_line_start_points_ptr = universe.field_line_start_points_ptr()
        const field_line_polarities_ptr = universe.field_line_polarities_ptr()
        const field_lines_ptr = universe.field_lines_ptr()

        const field_line_start_points_array = new Float64Array(wasm.memory.buffer, 
            field_line_start_points_ptr, start_point_count*3)

        const field_line_polarities = new Float64Array(wasm.memory.buffer, 
            field_line_polarities_ptr, start_point_count)

        field_line_start_points_array.set(this.start_points, 0)
        field_line_polarities.set(this.start_point_polarities, 0)
        universe.compute_lines()

        const field_lines_array = new Float64Array(wasm.memory.buffer, 
            field_lines_ptr, start_point_count*max_line_point_count*3)

        this.field_lines = new Float64Array(start_point_count*max_line_point_count*3)
        this.field_lines.set(field_lines_array, 0)

        this.draw_field_lines()
    }

    render()
    {
        super.render()
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({color: 0xffffff})
        const lines_mesh = new THREE.LineSegments(geometry, material)

        this.geometry = geometry
        this.lines_mesh = lines_mesh

        this.world_object.scene.add(lines_mesh)
        this.update_field_line_points()
    }
}

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

class FieldProducer extends SimulationObject
{
    constructor(world_object, _type, base)
    {
        super(world_object, _type, base)
        this.produces_field = true
    }

    update_field()
    {
        this.local_events.fire("update_field")
    }
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

    clean_up(scene)
    {
        scene.remove(this.mesh)
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

export {StraightWireObj}

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

const class_strings = {
    "StraightWire": StraightWireObj,
    "CubePointCloud": CubePointCloud,
    "CubicBezierWireApprox": CubicBezierWireApprox,
    "FieldLinePoint": FieldLinePoint
    // "RecordPointMatrix": 
}

function load_from_object(world_object, obj)
{
    const simulation_obj = new class_strings[obj.type](world_object, obj)
    return simulation_obj
}   

export {load_from_object}
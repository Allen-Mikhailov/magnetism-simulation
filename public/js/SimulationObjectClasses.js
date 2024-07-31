import init, { 
    Universe, 
    Vector3
} from "../pkg/magnetism_simulation.js";
import { Events } from "./bars.js";
import ThreeJsHandler from "./ThreeJsHandler.js";
import { createKey, color_array, time_function } from "./Utils.js";
import * as THREE from "./threejs/three.js"


const DISPLAY_POINTS = false
const DISPLAY_CONES = false
const line_type = "sand"
const line_length = 1


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

export { SandProducer}

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

        time_function("Compute Lines", () => universe.compute_lines())
        // universe.compute_lines()

        const start = performance.now();

        
        const field_lines_array = new Float64Array(wasm.memory.buffer, 
            field_lines_ptr, start_point_count*max_line_point_count*3)

        this.field_lines = new Float64Array(start_point_count*max_line_point_count*3)
        this.field_lines.set(field_lines_array, 0)

        this.draw_field_lines()

        const end = performance.now();
        console.log(`Drawing Execution time: ${end - start} ms`);
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

export { FieldLineProducer }

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

export { FieldProducer }


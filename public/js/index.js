import * as Bars from "./bars.js"
import UILoader from "./UILoader.js";
import * as THREE from "./threejs/three.js"
import ThreeJsHandler from "./ThreeJsHandler.js";
import DataLoader from "./DataLoader.js";
import { default_simulation_data } from "./default_data.js";

import init, { 
    Universe, 
    Vector3, 
    RecordPointMatrix, 
    NoPointArea, 
    RecordPointSphere, 
    StraightWire,
    Container
} from "../pkg/magnetism_simulation.js";

import ColorBand from "./ColorBand.js";

import { StraightWireObj, Vector3Base } from "./SimulationObjectClasses.js";


const sim_data_loader = new DataLoader("game_data:0.0", default_simulation_data)

let sim_data

let simulation_objects

let universe

let wasm
let lines  = null
let cones  = null
let points = null

let line_type = "arrow"
let display_cones = true

const color_range = [
	new THREE.Color(0xff0000), 
	new THREE.Color(0x00ff00), 
	// new THREE.Color(0x0000ff)
]
const colorband = new ColorBand(color_range)

// Bars Creation
const ui_loader = new UILoader()
let simulation_handler
const three_js_handler = new ThreeJsHandler()

const line_length = 4

const vec_new = Vector3.js_new

function data_update()
{
	// TODO: Make it acutally save
	// DataLoader
}

function color_array(color)
{
	return [color.r*255, color.g*255, color.b*255, 255]
}

function clear_scene()
{
	if (lines)
		three_js_handler.scene.remove(lines)

	if (cones)
		three_js_handler.scene.remove(cones)

	if (points)
		three_js_handler.scene.remove(points)
}

function render_field()
{
	clear_scene();

	let record_point_count = universe.get_record_point_count();
	const record_point_ptr = universe.get_record_point_ptr();
	const record_point_vectors = universe.record_point_vectors_ptr();


	const vertices = []
	const cone_vertices = []

	const point_buffer = new Float64Array(wasm.memory.buffer, record_point_ptr, record_point_count*3)
	const field_buffer = new Float64Array(wasm.memory.buffer, record_point_vectors, record_point_count*3)
	const colors = [];
	const cone_colors = []

	const point_array = []

	let fields = []

	for (let i = 0; i < record_point_count; i++)
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
		)

		fields.push(field.length())

		field.normalize()

		if (line_type == "arrow" )
		{
			vertices.push(p1.addScaledVector(field,  line_length))
			vertices.push(p2)
		} else if (line_type == "sand") {
			vertices.push(p1.addScaledVector(field,  line_length/2))
			vertices.push(p2.addScaledVector(field, -line_length/2))
		} else {
			console.error("no line type wot", line_type);
		}

		if (display_cones)
		{
			const vert = three_js_handler.createCone(p1, field)
			cone_vertices.push(...vert)
		}
	}

	colorband.set_modifier((x) => x)
	// colorband.set_modifier((x) => Math.log(x+1))
	colorband.compute_scale(fields, 10)

	console.log(colorband.scale)

	// Colors

	for (let i = 0; i < record_point_count; i++)
	{
		const field = new THREE.Vector3(
			field_buffer[i*3+0], 
			field_buffer[i*3+1], 
			field_buffer[i*3+2]
		).length()
		
		const color = color_array(colorband.get_color(field))
		colors.push(...color)
		colors.push(...color)

		for (let i = 0; i < 4*3; i++)
			cone_colors.push(...color)
	}

	const line_buffer = new THREE.BufferGeometry()
	const cone_buffer = new THREE.BufferGeometry()
	const point_geo_buffer = new THREE.BufferGeometry()

	point_geo_buffer.setFromPoints(point_array)

	const point_material  = new THREE.PointsMaterial({ color: 0xff0000, size: .05})
	points = new THREE.Points(point_geo_buffer, point_material)
	
	// line_buffer
	line_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 4, true));
	line_buffer.setFromPoints(vertices)
	const line_material = new THREE.LineBasicMaterial( { linewidth: .5, vertexColors: true, transparent: false, } );
	lines = new THREE.LineSegments(line_buffer, line_material)

	cone_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(cone_colors, 4, true));
	cone_buffer.setFromPoints( cone_vertices );
	const material = new THREE.MeshBasicMaterial( { vertexColors: true } );
	cones = new THREE.Mesh( cone_buffer, material );


	three_js_handler.scene.add(lines)
	three_js_handler.scene.add(cones)
	// three_js_handler.scene.add(points)
}

function simulation_objects_update()
{
	const list = []

	Object.keys(sim_data.sim_objects).map(object_key => {
		const sim_object = sim_data.sim_objects[object_key]
		list.push({"type": "list-button", "name": object_key, "value": sim_object.display_name})
	})

	ui_loader.explorer.update_list(list)
}

function add_simulation_object(object_key)
{
	const object_data = sim_data.sim_objects[object_key]
}

function create_simulation_object(object_data)
{
	const key = Bars.createKey()
	sim_data.sim_objects[key] = object_data
	data_update()
	simulation_objects_update()
	add_simulation_object(key)
}

function start(current_wasm)
{
	wasm = current_wasm

	universe = Universe.new();

	ui_loader.render()
	ui_loader.main_content.element.appendChild(three_js_handler.renderer.domElement)
	three_js_handler.start()

    const updateSize = () => {
		three_js_handler.update_canvas_size()
	}

	ui_loader.events.connect("main_content_resize", updateSize)

	sim_data = sim_data_loader.get_data()

	console.log("sim_data", sim_data)

	simulation_objects_update()




	render_field()
}

// Startup
init().then(start)

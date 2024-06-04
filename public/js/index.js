import * as Bars from "./bars.js"
import UILoader from "./UILoader.js";
import * as THREE from "./threejs/three.js"
import ThreeJsHandler from "./ThreeJsHandler.js";

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

import { StraightWireObj } from "./SimulationObjectClasses.js";
import { SimulationHandler } from "./SimulationHandler.js";

let wasm
let universe
let lines  = null
let cones  = null
let points = null

let line_type = "arrow"
let display_cones = true

// Bars Creation
const ui_loader = new UILoader()

const three_js_handler = new ThreeJsHandler()

const hot_color = new THREE.Color(255, 0, 0)
const cold_color = new THREE.Color(0, 255, 0)
const line_length = 4

const vec_new = Vector3.js_new

function color_array(color)
{
	return [color.r*255, color.g*255, color.b*255, 255]
}

function render_field()
{
	if (lines)
		three_js_handler.scene.remove(lines)

	if (cones)
		three_js_handler.scene.remove(cones)

	if (points)
		three_js_handler.scene.remove(points)

	let record_point_count = universe.get_record_point_count();
	const record_point_ptr = universe.get_record_point_ptr();
	const record_point_vectors = universe.record_point_vectors_ptr();

	const color_range = [
		new THREE.Color(0xff0000), 
		new THREE.Color(0x00ff00), 
		// new THREE.Color(0x0000ff)
	]
	const colorband = new ColorBand(color_range)


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

function start()
{
	ui_loader.render()
	ui_loader.main_content.element.appendChild(three_js_handler.renderer.domElement)
	three_js_handler.start()

    const updateSize = () => {
		three_js_handler.update_canvas_size()
	}

	ui_loader.events.connect("main_content_resize", updateSize)

}

// Startup
init().then((current_wasm) => {
	start()
	wasm = current_wasm

	// return
	

	universe.add_record_points()
	universe.compute_record_points();

	render_field()
})

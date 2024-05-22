import * as Bars from "./bars.js"
import UILoader from "./UILoader.js";
import * as THREE from "./threejs/three.js"
import ThreeJsHandler from "./ThreeJsHandler.js";

import ColorBand from "./ColorBand.js";

import init, { Universe, Vector3, RecordPointMatrix, NoPointArea, RecordPointSphere } from "../pkg/magnetism_simulation.js";

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
const line_length = 1

const vec_new = Vector3.js_new

function alpha_color(colors, alpha)
{
	colors.push(255)
	colors.push(255)
	colors.push(255)
	colors.push((1-alpha)*255)
}

function red_green_color(colors, alpha)
{
	const lerped = cold_color.clone().lerp(hot_color, alpha)

	colors.push(lerped.r)
	colors.push(lerped.g)
	colors.push(lerped.b)
	colors.push(255)
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

	const colorband = new ColorBand()


	const vertices = []
	const cone_vertices = []

	const point_buffer = new Float64Array(wasm.memory.buffer, record_point_ptr, record_point_count*3)
	const field_buffer = new Float64Array(wasm.memory.buffer, record_point_vectors, record_point_count*3)
	const colors = [];
	const cone_colors = []

	const point_array = []

	let largest_field = 0;
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

		const field_magnitude = Math.sqrt(field.x*field.x+field.y*field.y+field.z*field.z)
		if (largest_field < field_magnitude)
				largest_field = field_magnitude

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

	for (let i = 0; i < record_point_count; i++)
	{
		const field = new THREE.Vector3(
			field_buffer[i*3+0], 
			field_buffer[i*3+1], 
			field_buffer[i*3+2]
		).length()

		let alpha = Math.log(field+1)/Math.log(largest_field+1)

		red_green_color(colors, alpha)
		red_green_color(colors, alpha)

		for (let i = 0; i < 4*3; i++)
			red_green_color(cone_colors, alpha)
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
	universe = Universe.new()

	const matrix = RecordPointMatrix.new(vec_new(0, 0, 0), vec_new(10, 10, 10), vec_new(10, 10, 10), 0.001, 0n)
	universe.add_record_point_matrix(matrix)

	const no_point_area = NoPointArea.new(0, vec_new(0, 0, 0), vec_new(3, 10, 3))
	universe.add_no_point_area(no_point_area)

	const sphere = RecordPointSphere.new(vec_new(0, 0, 0), vec_new(10, 10, 10), 1n, 50n, 0, 0n)
	// universe.add_point_sphere(sphere)

	universe.add_record_points()
	universe.compute_record_points();

	render_field()
})

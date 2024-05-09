import { Bars, createKey, IconButton, IconButtonSelectGroup, Events, Bar, RawContent } from "./bars.js"

import * as THREE from "./threejs/three.js"
import { OrbitControls } from './threejs/addons/controls/OrbitControls.js';

const sand_material = new THREE.LineBasicMaterial({
	color: 0xffffff
});

import init, { Universe, Vector3, RecordPointMatrix, NoPointArea, RecordPointSphere } from "../pkg/magnetism_simulation.js";

// Bars Creation
const events = new Events()
const bars = new Bars(document.getElementById("root"))
bars.setEvents(events)

const top_bar = new Bar("top_bar")

const tool_bar = new Bar("tool_bar")

const main_content = new RawContent("main_content")
main_content.setEvents(events)

// Three js Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.domElement.className = "scene-canvas"

const orbit_controls = new OrbitControls( camera, renderer.domElement );
orbit_controls.update();

// Functions
function update_canvas_size()
{
	const rect = main_content.element.getBoundingClientRect()

	const width = rect.width
	const height = rect.height
	camera.aspect = width / height
	renderer.setSize( width, height, false);
	camera.updateProjectionMatrix();

	renderer.domElement.style.top = `${rect.top}px`
	renderer.domElement.style.left = `${rect.left}px`
	
	renderer.render( scene, camera );
}

// Organizing
bars.addItem(top_bar)
bars.addItem(tool_bar)
bars.addItem(main_content)

let sand = []
function update_state()
{

}

const hot_color = new THREE.Color(255, 0, 0)
const cold_color = new THREE.Color(0, 255, 0)
const line_length = .5

const vec_new = Vector3.js_new

function alpha_color(colors, alpha)
{
	colors.push(255)
	colors.push(255)
	colors.push(255)
	colors.push((1-alpha)*255)

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

	colors.push(lerped.r)
	colors.push(lerped.g)
	colors.push(lerped.b)
	colors.push(255)
}

// Startup
init().then((wasm) => {
	const universe = Universe.new()

	const matrix = RecordPointMatrix.new(vec_new(0, 0, 0), vec_new(10, 10, 10), vec_new(15, 15, 15), 1, 0n)
	// universe.add_record_point_matrix(matrix)

	const no_point_area = NoPointArea.new(1, vec_new(0, 0, 0), vec_new(1, 1, 1))
	universe.add_no_point_area(no_point_area)

	const sphere = RecordPointSphere.new(vec_new(0, 0, 0), vec_new(10, 10, 10), 5n, 50n, 1, 0n)
	universe.add_point_sphere(sphere)

	universe.add_record_points()
	universe.compute_record_points();

	let record_point_count = universe.get_record_point_count();
	const record_point_ptr = universe.get_record_point_ptr();
	const record_point_vectors = universe.record_point_vectors_ptr();


	console.log(record_point_count)

	const line_buffer = new THREE.BufferGeometry()
	const vertices = []

	const point_buffer = new Float64Array(wasm.memory.buffer, record_point_ptr, record_point_count*3)
	const field_buffer = new Float64Array(wasm.memory.buffer, record_point_vectors, record_point_count*3)
	const colors = [];

	let largest_field = 0

	for (let i = 0; i < record_point_count; i++)
	{
		const p1 = new THREE.Vector3(
			point_buffer[i*3+0], 
			point_buffer[i*3+1], 
			point_buffer[i*3+2]
		)
		const p2 = p1.clone()

		const field = new THREE.Vector3(
			field_buffer[i*3+0], 
			field_buffer[i*3+1], 
			field_buffer[i*3+2]
		)

		const field_magnitude = Math.sqrt(field.x*field.x+field.y*field.y+field.z*field.z)
		if (largest_field < field_magnitude)
				largest_field = field_magnitude

		field.normalize()

		vertices.push(p1.addScaledVector(field,  line_length))
		vertices.push(p2.addScaledVector(field, -line_length))
	}

	for (let i = 0; i < record_point_count; i++)
	{
		const field = new THREE.Vector3(
			field_buffer[i*3+0], 
			field_buffer[i*3+1], 
			field_buffer[i*3+2]
		).length()

		let alpha = Math.log(field+1)/Math.log(largest_field+1)
		// let alpha = Math.sqrt(field)/Math.sqrt(largest_field)

		red_green_color(colors, alpha)
	}
	
	// line_buffer
	line_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 4, true));
	line_buffer.setFromPoints(vertices)
	const material = new THREE.LineBasicMaterial( { linewidth: .5, vertexColors: true, transparent: false, } );

	const points = new THREE.LineSegments(line_buffer, material)

	scene.add(points)

	// Adding Sand
	
})

events.connect("main_content_resize", update_canvas_size)
bars.render()

main_content.element.appendChild(renderer.domElement)

update_canvas_size()

function animate() {
	requestAnimationFrame( animate );
		

	// if (orbit_control)
	//   controls.update();

	renderer.render( scene, camera );
}
animate();
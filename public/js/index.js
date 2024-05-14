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
// bars.addItem(top_bar)
// bars.addItem(tool_bar)
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
}

function red_green_color(colors, alpha)
{
	const lerped = cold_color.clone().lerp(hot_color, alpha)

	colors.push(lerped.r)
	colors.push(lerped.g)
	colors.push(lerped.b)
	colors.push(255)
}

const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

function debug_line(p1, p2, color)
{
	color = color || 0x0000ff
	const line_material = new THREE.LineBasicMaterial({
		color: color
	});

	const points = [];
	points.push( p1 );
	points.push(p2)

	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	const line = new THREE.Line( geometry, line_material );
	scene.add( line );
}

// Cone test
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI/2 );

// const cone_vertices = []
// const p1 = new THREE.Vector3(0, 0, 0)
// const field = new THREE.Vector3(.6, -1, 0).normalize()
// const cone_size = .4
// const point_distance = cone_size * (Math.sqrt(3)/2-.5)
// const height = Math.sqrt(cone_size*cone_size*.75 - point_distance*point_distance )
// const cone_head = p1.clone().addScaledVector(field, height)
// const rot = Math.random()*Math.PI*2
// const y_vector = new THREE.Vector3(1, 0, 0)
// const rot_vector = field.clone().applyQuaternion(quaternion)


// debug_line(p1, field, 0xff0000)
// // debug_line(p1, rot_vector, 0xff0000)
// debug_line(p1, rot_vector, 0x00ff00)

// const point1 = rot_vector.clone().applyAxisAngle(field, rot).multiplyScalar(point_distance*2).add(p1)
// const point2 = rot_vector.clone().applyAxisAngle(field, rot + Math.PI*2/3).multiplyScalar(point_distance*2).add(p1)
// const point3 = rot_vector.clone().applyAxisAngle(field, rot + Math.PI*4/3).multiplyScalar(point_distance*2).add(p1)

// debug_line(p1, point1, 0x000ff0)
// debug_line(p1, point2, 0x000ff0)
// debug_line(p1, point3, 0x000ff0)

// cone_vertices.push(point3, point2, point1)
// cone_vertices.push(point1, point2, cone_head)
// cone_vertices.push(point2, point3, cone_head)
// cone_vertices.push(cone_head, point3, point1)

// const cone_buffer = new THREE.BufferGeometry()
// cone_buffer.setFromPoints( cone_vertices );
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
// const cones = new THREE.Mesh( cone_buffer, material );


// scene.add(cones)

// Startup
init().then((wasm) => {
	// return
	const universe = Universe.new()

	const matrix = RecordPointMatrix.new(vec_new(0, 0, 0), vec_new(10, 20, 10), vec_new(15, 15, 15), 5, 0n)
	universe.add_record_point_matrix(matrix)

	const no_point_area = NoPointArea.new(0, vec_new(0, 0, 0), vec_new(5, 15, 5))
	universe.add_no_point_area(no_point_area)

	const sphere = RecordPointSphere.new(vec_new(0, 0, 0), vec_new(10, 10, 10), 1n, 50n, 0, 0n)
	// universe.add_point_sphere(sphere)

	universe.add_record_points()
	universe.compute_record_points();

	let record_point_count = universe.get_record_point_count();
	const record_point_ptr = universe.get_record_point_ptr();
	const record_point_vectors = universe.record_point_vectors_ptr();


	console.log(record_point_count)
	const vertices = []
	const cone_vertices = []

	const point_buffer = new Float64Array(wasm.memory.buffer, record_point_ptr, record_point_count*3)
	const field_buffer = new Float64Array(wasm.memory.buffer, record_point_vectors, record_point_count*3)
	const colors = [];
	const cone_colors = []

	let largest_field = 0;

	for (let i = 0; i < record_point_count; i++)
	{
		const point = new THREE.Vector3(
			point_buffer[i*3+0], 
			point_buffer[i*3+1], 
			point_buffer[i*3+2]
		)
		let p1 = point.clone()
		const p2 = point.clone()

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


		// Creating Cone
		const cone_size = .4
		p1 = p1.clone().addScaledVector(field, -cone_size/2)
		const point_distance = cone_size * (Math.sqrt(3)/2-.5)
		const height = Math.sqrt(cone_size*cone_size*.75 - point_distance*point_distance )
		const cone_head = p1.clone().addScaledVector(field, height)
		const rot = Math.random()*Math.PI*2
		const rot_vector = field.clone().applyQuaternion(quaternion)


		// debug_line(p1, field.clone().add(p1), 0xff0000)
		// debug_line(p1, rot_vector, 0xff0000)
		// debug_line(p1, rot_vector, 0x00ff00)

		const point1 = rot_vector.clone().applyAxisAngle(field, rot).multiplyScalar(point_distance).add(p1)
		const point2 = rot_vector.clone().applyAxisAngle(field, rot + Math.PI*2/3).multiplyScalar(point_distance).add(p1)
		const point3 = rot_vector.clone().applyAxisAngle(field, rot + Math.PI*4/3).multiplyScalar(point_distance).add(p1)

		cone_vertices.push(point3, point2, point1)
		cone_vertices.push(point1, point2, cone_head)
		cone_vertices.push(point2, point3, cone_head)
		cone_vertices.push(cone_head, point3, point1)
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
		red_green_color(colors, alpha)

		for (let i = 0; i < 4*3; i++)
			red_green_color(cone_colors, alpha)
	}

	const line_buffer = new THREE.BufferGeometry()
	const cone_buffer = new THREE.BufferGeometry()
	
	// line_buffer
	line_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 4, true));
	line_buffer.setFromPoints(vertices)
	const line_material = new THREE.LineBasicMaterial( { linewidth: .5, vertexColors: true, transparent: false, } );
	const points = new THREE.LineSegments(line_buffer, line_material)

	cone_buffer.setAttribute('color', new THREE.Uint8BufferAttribute(cone_colors, 4, true));
	cone_buffer.setFromPoints( cone_vertices );
	const material = new THREE.MeshBasicMaterial( { vertexColors: true } );
	const cones = new THREE.Mesh( cone_buffer, material );


	scene.add(points)
	scene.add(cones)

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
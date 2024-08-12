import * as Bars from "./bars.js"
import UILoader from "./UILoader.js";
import * as THREE from "./threejs/three.js"
import ThreeJsHandler from "./ThreeJsHandler.js";
import * as SimulationComponents from "./SimulationComponents.js"
import { WorldObject } from "./SimulationObjectClasses.js";
import { getDoc, db, setDoc, auth, doc } from "./firebase.js";

import init, { 
    Universe, 
    Vector3
} from "../pkg/magnetism_simulation.js";

import ColorBand from "./ColorBand.js";

const auto_save_time = 10*1000

const simulation_id = window.location.hash.slice(1)

let sim_data
let selected_object

let user

let simulation_objects

let universe
let wasm
let world_object
let needs_data_update = false

const color_range = [  // Temp
	new THREE.Color(0x00ff00),
	new THREE.Color(0xff0000),
	new THREE.Color(0x0000ff)
]
const colorband = new ColorBand(color_range)

// Bars Creation
const ui_loader = new UILoader()
const three_js_handler = new ThreeJsHandler()

function data_update()
{
	// TODO: Make it acutally save
	// DataLoader
	needs_data_update = true
}

function auto_save()
{
	if (!needs_data_update) {return;}
	console.log("autosave")
	setDoc(doc(db, "simulations", simulation_id), sim_data)
}

function userUpdate(new_user)
{
    user = new_user
}

auth.onAuthStateChanged(userUpdate)

// temp
const COLOR_BAND_POINTS = 10
function color_update()
{

	const sim_object_keys = Object.keys(simulation_objects)

	let array_length = 0

	// Getting array length
	sim_object_keys.map(sim_object_key => {
		const sim_object = simulation_objects[sim_object_key]
		if (!sim_object.produces_sand) {return;}

		array_length += sim_object.field_magnitudes.length
	})

	// Filling array
	let offset = 0
	const field_array = new Float64Array(array_length)
	sim_object_keys.map(sim_object_key => {
		const sim_object = simulation_objects[sim_object_key]
		if (!sim_object.produces_sand) {return;}

		field_array.set(sim_object.field_magnitudes, offset)
		offset += sim_object.field_magnitudes.length
	})

	colorband.compute_scale(field_array, COLOR_BAND_POINTS)

	sim_object_keys.map(sim_object_key => {
		const sim_object = simulation_objects[sim_object_key]
		if (!sim_object.produces_sand) {return;}
			
		sim_object.color_update(colorband)
	})
}

function field_update()
{
	Object.keys(simulation_objects).map(sim_object_key => {
		const sim_object = simulation_objects[sim_object_key]
		if (sim_object.produces_sand)
			sim_object.field_update()

		if (sim_object.produces_field_lines)
			sim_object.update_field_line_points()
	})

	color_update()
}

function simulation_objects_update()
{
	const list = [
		{"type": "header", "name": "explorer_header", "value": {"title": "Explorer", "buttons": [
			{"icon": "plus", "name": "create"}
		]}}
	]

	Object.keys(sim_data.sim_objects).map(object_key => {
		const sim_object = sim_data.sim_objects[object_key]
		list.push({"type": "list-button", "name": object_key, "value": sim_object.display_name})
	})

	ui_loader.explorer.update_list(list)
}

function add_simulation_object(object_key)
{
	const object_data = sim_data.sim_objects[object_key]
	const sim_object = SimulationComponents.load_from_object(world_object, object_data)

	sim_object.render()

	sim_object.local_events.connect("update_field", field_update)
	sim_object.local_events.connect("color_update", color_update)
	sim_object.local_events.connect("update_properties", update_properties)

	simulation_objects[object_key] = sim_object
}

function create_simulation_object(object_data)
{
	const key = Bars.createKey()
	sim_data.sim_objects[key] = object_data
	data_update()
	add_simulation_object(key)
	simulation_objects_update()
}

function remove_simulation_object(key)
{
	if (key == selected_object)
		update_selected_object(null)

	simulation_objects[key].destroy()
	delete simulation_objects[key]
	delete sim_data.sim_objects[key]
	simulation_objects_update()
	data_update()
}

function update_properties()
{
	ui_loader.property_manager.update_data(sim_data.sim_objects[selected_object])
	data_update()
}

let tool_mode = "select"
let tools_active = false

function update_selected_object(new_select)
{
	if (selected_object && new_select != selected_object)
	{
		simulation_objects[selected_object].selection_update(false, false)
	}

	selected_object = new_select
	update_properties()

	if (simulation_objects[selected_object])
		simulation_objects[selected_object].selection_update(true, tools_active)
}

const raycaster = new THREE.Raycaster();

function tool_update()
{	
	if (tool_mode != "select")
	{
		tools_active = true
		update_selected_object(selected_object)
		three_js_handler.transform_controls.setMode(tool_mode)
	} else {
		tools_active = false
		update_selected_object(selected_object)
	}

	ui_loader.tools_select_group.setSelected(tool_mode)
}

function set_tool(new_tool)
{
	tool_mode = new_tool
	tool_update()
}

function key_down(e)
{
	if (e.key == "t")
		set_tool("translate")
	if (e.key == "s")
		set_tool("scale")
	if (e.key == "r")
		set_tool("rotate")
	if (e.key == "q")
		set_tool("select")
}

async function start(current_wasm)
{
	wasm = current_wasm

	universe = Universe.new();

	ui_loader.render()
	ui_loader.main_content.element.appendChild(three_js_handler.renderer.domElement)
	three_js_handler.start()

	world_object = new WorldObject()
	world_object.wasm = wasm
	world_object.scene = three_js_handler.scene
	world_object.three_js_handler = three_js_handler
	world_object.universe = universe
	world_object.ui_loader = ui_loader

    const updateSize = () => {
		three_js_handler.update_canvas_size()
	}

	ui_loader.events.connect("main_content_resize", updateSize)

	document.onkeydown = key_down

	const docSnap = await getDoc(doc(db, "simulations", simulation_id))
	if (docSnap)
		sim_data = docSnap.data()
	else
		console.warn("error, data failed to get somehow")

	console.log("sim_data", sim_data)
	console.log("simulation_id", simulation_id)

	ui_loader.explorer.events.connect("list_button_press", (object) => {
		object.select()
		update_selected_object(object.selected?object.name:null)
	})

	ui_loader.explorer.events.connect("explorer_header_pressed_create", (e) => {
		ui_loader.create_dropdown.display(e.clientX, e.clientY)
	})

	ui_loader.create_dropdown.events.connect("list_button_press", (object) => {
		const object_type = object.name
		const object_class = SimulationComponents.class_strings[object_type]
		const obj_data = object_class.get_default_data()
		create_simulation_object(obj_data)
		ui_loader.create_dropdown.hide()
	})

	ui_loader.tools_select_group.action = set_tool
	ui_loader.tools_select_group.setSelected("select")

	ui_loader.property_manager.events.connect("set_property", (key, value) => {
		console.log("set propery", selected_object, key, value)
		const sim_object = simulation_objects[selected_object]
		sim_object.set_property(key, value)
		update_properties()

		if (key == "display_name")
			simulation_objects_update()
	})

	ui_loader.property_manager.events.connect("big_red_button_press", (object) => {
		console.log("big_red_button_press", object)
		if (object.name == "delete")
			remove_simulation_object(selected_object)
	})

	simulation_objects = {}
	Object.keys(sim_data.sim_objects).map((key) => {
		add_simulation_object(key)
	})

	simulation_objects_update()
	update_selected_object(null)

	field_update()

	setInterval(auto_save, auto_save_time)
}

// Startup
init().then(start)

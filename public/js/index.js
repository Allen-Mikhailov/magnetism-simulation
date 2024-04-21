import { Bars, createKey, IconButton, IconButtonSelectGroup, Events, Bar, RawContent } from "./bars.js"

import * as THREE from "./threejs/three.js"
import { OrbitControls } from './threejs/addons/controls/OrbitControls.js';

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

// Startup

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
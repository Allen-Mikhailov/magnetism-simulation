import { Bars, createKey, IconButton, IconButtonSelectGroup, Events, Bar } from "./bars.js"

import * as THREE from "./threejs/three.js"
import { OrbitControls } from './threejs/addons/controls/OrbitControls.js';

const bars = new Bars(document.getElementById("root"))

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();

const orbit_controls = new OrbitControls( camera, renderer.domElement );
orbit_controls.update();


function update_canvas_size()
{
  const rect = bars.main_content.getBoundingClientRect()

  const width = rect.width
  const height = rect.height
  camera.aspect = width / height
  renderer.setSize( width, height, false);
  camera.updateProjectionMatrix();
  composer.setSize(width, height);

  renderer.domElement.style.top = `${rect.top}px`
  renderer.domElement.style.left = `${rect.left}px`

  effectFXAA.uniforms["resolution"].value.set(
    1 / width,
    1 / height
  );
  renderer.render( scene, camera );
}

update_canvas_size()
bars.events.connect("main-content-resize", update_canvas_size)

function animate() {
	requestAnimationFrame( animate );
  
  // mesh.position.set(0, 0, 0);

  // if (orbit_control)
  //   controls.update();

	renderer.render( scene, camera );
}
animate();
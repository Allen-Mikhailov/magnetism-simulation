import * as THREE from "./threejs/three.js"
import { OrbitControls } from './threejs/addons/controls/OrbitControls.js';
import { TransformControls } from './threejs/addons/controls/TransformControls.js';

class ThreeJsHandler
{
    constructor()
    {
        // Three js Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x242936)

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.domElement.className = "scene-canvas"

        const orbit_controls = new OrbitControls( this.camera, this.renderer.domElement );
        const transform_controls = new TransformControls( this.camera, this.renderer.domElement );

        this.orbit_controls = orbit_controls;
        this.transform_controls = transform_controls;

        this.scene.add(this.transform_controls)

        transform_controls.addEventListener("mouseDown", function(event) {
            orbit_controls.enabled = false
        })
        
        transform_controls.addEventListener("mouseUp", function(event) {
            orbit_controls.enabled = true
        })

        const self = this

        transform_controls.addEventListener("objectChange", function(event) {
            // console.log("transform_update")
            if (self.transform_update)
            {
                self.transform_update()
            }
        })

        this.transform_update = null


    }

    set_controls(element, update_connection)
    {
        this.transform_controls.attach(element)
        this.transform_update = update_connection
    }

    remove_controls()
    {
        this.transform_controls.detach()
        this.transform_update = null
    }

    render()
    {
        this.renderer.render( this.scene, this.camera );
    }

    start()
    {
        // cube
        // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const cube = new THREE.Mesh( geometry, material );
        // this.scene.add( cube );

        const axis = new THREE.AxesHelper(1)
        this.scene.add(axis)

        this.boxes_group = new THREE.Group();
        this.field_group = new THREE.Group();

        this.update_canvas_size()
        this.orbit_controls.update();
        // this.transform_controls
        this.render_loop()
    }

    render_loop() {
        // console.log("this", this)
        const handler = this
        requestAnimationFrame( () => {
            handler.render_loop()
        } );

        this.render()
    }

    update_canvas_size()
    {
        const rect = this.renderer.domElement.parentElement.getBoundingClientRect()

        const width = rect.width
        const height = rect.height
        this.camera.aspect = width / height
        this.renderer.setSize( width, height, false);
        this.camera.updateProjectionMatrix();

        this.renderer.domElement.style.top = `${rect.top}px`
        this.renderer.domElement.style.left = `${rect.left}px`
        
        this.render()
    }

    debug_line(p1, p2, color)
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
        this.scene.add( line );
        return line
    }

    static createCone(pos, field)
    {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), field.clone().normalize() );

        const cone_vertices = []
        const cone_size = .1
        const L = cone_size * (Math.sqrt(3)/2)
        const point_distance = L*(2/3)
        const height = Math.sqrt(cone_size*cone_size - point_distance*point_distance )
        const cone_head = new THREE.Vector3(0, height*1.5, 0)
        const rot = Math.random()*Math.PI*2


        // debug_line(pos, field, 0xff0000)
        // debug_line(pos, rot_vector, 0x00ff00)

        const point1 = new THREE.Vector3(Math.cos(rot+Math.PI*0/3)*point_distance, 0, Math.sin(rot+Math.PI*0/3)*point_distance)
        const point2 = new THREE.Vector3(Math.cos(rot+Math.PI*2/3)*point_distance, 0, Math.sin(rot+Math.PI*2/3)*point_distance)
        const point3 = new THREE.Vector3(Math.cos(rot+Math.PI*4/3)*point_distance, 0, Math.sin(rot+Math.PI*4/3)*point_distance)

        cone_head.applyQuaternion(quaternion).add(pos)
        point1.applyQuaternion(quaternion).add(pos)
        point2.applyQuaternion(quaternion).add(pos)
        point3.applyQuaternion(quaternion).add(pos)

        // debug_line(pos, point1, 0x000ff0)
        // debug_line(pos, point2, 0x000ff0)
        // debug_line(pos, point3, 0x000ff0)

        cone_vertices.push(point3, point2, point1)
        cone_vertices.push(point1, point2, cone_head)
        cone_vertices.push(point2, point3, cone_head)
        cone_vertices.push(cone_head, point3, point1)
        return cone_vertices
    }
}

export default ThreeJsHandler
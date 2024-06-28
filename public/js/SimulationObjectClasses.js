import init, { 
    Universe, 
    Vector3
} from "../pkg/magnetism_simulation.js";
import { Events } from "./bars.js";

import * as THREE from "./threejs/three.js"

const UpdateTypes = Object.freeze({
    POINTS:   Symbol("points"),
    FIELD:  Symbol("field")
});

function createKey() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function bool_call(bool, callback)
{
    if (bool)
        callback()
}

function vec3_from_obj(obj)
{
    return Vector3.js_new(obj.x, obj.y, obj.z)
}

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  
  const getRand = mulberry32((Math.random()*2**32)>>>0)

export {Vector3Base}

class SimulationObject
{
    constructor(universe, object_type, base)
    {
        this.universe = universe
        this.type = object_type
        this.base = base
        this.update_callbacks = {}
        this.key = createKey()

        this.local_events = new Events()
    }
    

    render(scene)
    {

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

    from_json(json_object)
    {
        const self = this
        Object.keys(json_object).map((key) => {
            if (key == "type") {return;}
            self.set_property(key, json_object[key])
        })
    }

    // to_json()
    // {
    //     const json_obj = {}
    //     json_obj.type = this.type
    //     Object.keys(this.properties).map((property) => {
    //         const value = this.properties[property]
    //         if (value.is_vector_base)
    //         {
    //             json_obj[property] = {x: value.x, y: value.y, z: value.z, is_vector_base: true}
    //         } else {
    //             json_obj[property] = value
    //         }
    //     })
    //     return json_obj
    // }
}

class SandProducer extends SimulationObject
{
    constructor(universe, _type, base)
    {
        super(universe, _type, base)
        this.produces_sand = true
        this.points = new Float64Array()
        this.fields = new Float64Array()
    }

    update_points()
    {
        this.local_events.fire("point_update")
    }   
}

class CubePointCloud extends SandProducer
{
    constructor(universe, base)
    {
        super(universe, "CubePointCloud", bsae)
    }

    render(scene)
    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
    }

    update_points()
    {
        const point_count = this.base.size.x*this.base.size.y*this.base.size.z
        this.point_count = point_count

        const point_array = new Float64Array(point_count*3)
        
        const x_size = this.base.size.x
        const y_size = this.base.size.y
        const z_size = this.base.size.z

        const x_points = this.base.points.x
        const y_points = this.base.points.y
        const z_points = this.base.points.z

        let i = 0;
        for (let x = 0; x < x_points; x++)
        {
            const xa = x/(x_points-1)
            const xp = (xa-0.5)*x_size
            for (let y = 0; y < y_points; y++)
            {
                const ya = y/(y_points-1)
                const yp = (ya-0.5)*y_size
                for (let z = 0; z < z_points; z++)
                {
                    const za = z/(z_points-1)
                    const zp = (za-0.5)*z_size

                    point_array[i*3+0] = xp;
                    point_array[i*3+1] = xp;
                    point_array[i*3+2] = xp;

                    i++;
                }
            }
        }

        this.point_array = point_array
        

        super.update_points()
    }

    update_fields()
    {

    }

    update()
    {
        
    }
}

export { CubePointCloud }

class FieldProducer extends SimulationObject
{
    constructor(universe, _type, base)
    {
        super(universe, _type, base)
        this.produces_field = true
    }

    field_update()
    {
        this.local_events.fire("field_update")
    }
}

class StraightWireObj extends FieldProducer
{
    constructor(universe, base)
    {
        super(universe, "StraightWire", base)
        this.produces_field = true

        this.properties = {
            color: 0xff000,
            length: 5,
            position: new Vector3Base(0, 0, 0),
            direction: new Vector3Base(1, 0, 0)
        }

        const handle = universe.add_straight_wire(
            vec3_from_obj(this.base.position),
            vec3_from_obj(this.base.direction),
            this.base.length
        );
        this.handle = handle

    }

    render(scene)
    {
        this.scene = scene
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const geometry = new THREE.BufferGeometry();
        const mesh = new THREE.Line(geometry, material)

        this.material = material
        this.geometry = geometry
        this.mesh = mesh

        this.update()

        scene.add(this.mesh)
    }

    clean_up(scene)
    {
        scene.remove(this.mesh)
    }

    update()
    {
        super.update()

        if (!this.geometry) {return;}
        // Mesh Points
        const points = []

        const position = this.properties.position.three
        const direction = this.properties.direction.three
        const length = this.properties.length

        points.push(position)
        points.push(position.clone().add(direction.clone().multiplyScalar(length)))
        this.geometry.setFromPoints(points)

        this.mesh.updateMatrix()
    }

    set_property(property, value, no_update)
    {
        // console.log("set property", property, value, typeof value)
        super.set_property(value)

        switch (property)
        {
            case "length":
                this.properties.length = value
                this.base.length = value
                this.universe.set_object_length(this.handle, value)
                bool_call(!no_update, () => this.field_update())
                break;

            case "position":
                this.properties.position.set(value.x, value.y, value.z)
                this.universe.set_object_position(this.handle, vec3_from_obj(value))
                bool_call(!no_update, () => this.field_update())
                break;

            case "direction":
                this.properties.direction.set(value.x, value.y, value.z)
                this.universe.set_object_direction(this.handle, vec3_from_obj(value))
                bool_call(!no_update, () => this.field_update())
                break;
        }

        bool_call(!no_update, () => this.update())
    }
}

export {StraightWireObj}

const class_strings = {
    "StraightWire": StraightWireObj,
    "CubePointCloud": CubePointCloud
    // "RecordPointMatrix": 
}

function load_from_object(obj)
{
    const simulation_obj = new class_strings[obj.type](obj)
    simulation_obj.from_json(obj)
    return simulation_obj
}   

export {load_from_object}
import init, { 
    Universe, 
    Vector3, 
    RecordPointMatrix, 
    NoPointArea, 
    RecordPointSphere, 
    StraightWire,
    Container
} from "../pkg/magnetism_simulation.js";

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

class Vector3Base
{
    constructor(x, y, z)
    {
        this.three = new THREE.Vector3(x, y, z)
        this.rust = new Vector3(x, y, z)
        this.is_vector_base = true
    }

    static from_three(v)
    {
        return new Vector3Base(v.x, v.y, v.z)
    }

    set(x, y, z)
    {
        this.three.set(x, y, z)
        this.rust.set(x, y, z)
    }

    set_from_three(three)
    {
        this.set(three.x, three.y, three.z)
    }
}

export {Vector3Base}

class SimulationObject
{
    constructor(object_type, base)
    {
        this.type = object_type
        this.base = base
        this.update_callbacks = {}
        this.key = createKey()
    }
    

    render(scene)
    {

    }

    set_property(property, value)
    {

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

class StraightWireObj extends SimulationObject
{
    constructor(base)
    {
        super("StraightWire")

        this.properties = {
            color: 0xff000,
            length: 5,
            position: new Vector3Base(0, 0, 0),
            direction: new Vector3Base(1, 0, 0)
        }

        const universe_object = new StraightWire();
        this.universe_object = universe_object
        this.container = Container.box_straight_wire(universe_object)

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

    set_property(property, value)
    {
        this.base[property] = value
        switch (property)
        {
            case "length":
                this.properties.length = value
                this.universe_object.set_length(length)
                return UpdateTypes.FIELD
            case "position":
                this.properties.position.set(value.x, value.y, value.z)
                return UpdateTypes.FIELD;
            case "direction":
                this.properties.direction.set(value.x, value.y, value.z)
                return UpdateTypes.FIELD
        }
        update()
    }
}

export {StraightWireObj}

const class_strings = {
    "StraightWire": StraightWireObj,
    // "RecordPointMatrix": 
}

function load_from_object(obj)
{
    const simulation_obj = new class_strings[obj.type]()
    simulation_obj.from_json(obj)
    return simulation_obj
}   

export {load_from_object}
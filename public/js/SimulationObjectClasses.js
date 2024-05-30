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

class SimulationObject
{
    constructor(object_type)
    {
        this.object_type = object_type
    }

    render(scene)
    {

    }

    set_property(property, value)
    {

    }

    update()
    {

    }

    destroy()
    {

    }

    read()
    {

    }
}

class StraightWire extends SimulationObject
{
    constructor()
    {
        super("StraightWire")

        this.properties = {
            color: 0xff000,
            length: 5,
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

        this.material = material

        this.geometry = geometry

        this.mesh = new THREE.Line(geometry, material)

        this.update()

        scene.add(this.mesh)
    }

    update()
    {

    }

    set_property(property, value)
    {
        switch (property)
        {
            case "length":
        }
    }
}

export {StraightWire}

function load_from_object(obj)
{
    switch(obj.type)
    {
        case "StraightWire":
            return new StraightWire(obj)
    }
}   

export {load_from_object}
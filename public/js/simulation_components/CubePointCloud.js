import { SandProducer } from "../SimulationObjectClasses.js";
import * as THREE from "../threejs/three.js"
import { bool_call, mulberry32 } from "../Utils.js";
  

const CLOUD_OPACITY = .1

class CubePointCloud extends SandProducer
{
    constructor(universe, base)
    {
        super(universe, "CubePointCloud", base)
        this.assign_properties()
    }

    render()
    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: CLOUD_OPACITY, transparent: true } );
        const cube = new THREE.Mesh( geometry, material );

        material.opacity = CLOUD_OPACITY

        this.geometry = geometry
        this.cube = cube

        this.world_object.scene.add( cube );

        super.render()
        this.render_update()
    }

    get_default_data()
    {
        return {
            "display_name": "Point Cloud",
            "type": "CubePointCloud",
            "random_seed": 0,
            "randomness": 0,
            "position": {
                x: 0,
                y: 0,
                z: 0
            },
            "points": {
                x: 5,
                y: 5,
                z: 5
            },
            "size": {
                x: 5,
                y: 5,
                z: 5
            },
            "rotation": {
                x: 0,
                y: 0,
                z: 0
            }
        }
    }

    destroy()
    {
        this.world_object.scene.remove(this.cube)
        super.destroy()
    }

    render_update()
    {
        if (this.rendered)
        {
            this.cube.scale.set(this.base.size.x, this.base.size.y, this.base.size.z)
            this.cube.position.set(this.base.position.x, this.base.position.y, this.base.position.z)    
            this.cube.updateMatrix()
        }
    }

    update_points()
    {
        const point_count = this.base.points.x*this.base.points.y*this.base.points.z
        this.point_count = point_count

        const randomness = this.base.randomness

        const rand_funct = mulberry32((this.base.random_seed)>>>0)
        const getRand = () => {return (rand_funct()*2-1)*randomness}

        const point_array = new Float64Array(point_count*3)

        const x_position = this.base.position.x
        const y_position = this.base.position.y
        const z_position = this.base.position.z
        
        const x_size = this.base.size.x
        const y_size = this.base.size.y
        const z_size = this.base.size.z

        const x_points = this.base.points.x
        const y_points = this.base.points.y
        const z_points = this.base.points.z

        const euler = new THREE.Euler(
            this.base.rotation.x,
            this.base.rotation.y,
            this.base.rotation.z
        )

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

                    const pos = new THREE.Vector3(xp, yp, zp)
                    pos.applyEuler(euler)

                    point_array[i*3+0] = pos.x+x_position+getRand();
                    point_array[i*3+1] = pos.y+y_position+getRand();
                    point_array[i*3+2] = pos.z+z_position+getRand();

                    i++;
                }
            }
        }

        this.points = point_array
        

        super.update_points()
        this.render_update()
    }

    set_property(property, value, no_update)
    {
        // console.log("set property", property, value, typeof value)
        super.set_property(property, value, no_update)

        let point_update = false

        switch (property)
        {

            case "position":
                point_update = true
                break;

            case "size":
                point_update = true
                break;

            case "points":
                point_update = true
                break;
            case "rotation":
                point_update = true
                break;
        }

        if (point_update)
            this.needs_point_update = true

        bool_call(!no_update && point_update, () => this.update_points())
        bool_call(!no_update, () => this.update())
    }

    update()
    {
        super.update()
    }

    bulk_set_properties(bulk)
    {
        super.bulk_set_properties(bulk)
        if (this.needs_point_update)
            this.update_points()
    }

    selection_update(selected, with_tool)
    {
        super.selection_update(selected)
        
        const three_js_handler = this.world_object.three_js_handler

        if (selected && with_tool) {
            const self = this
            three_js_handler.set_controls(this.cube, () => {
                const rotation = this.cube.rotation
                self.bulk_set_properties({
                    "position": {
                        x: self.cube.position.x, 
                        y: self.cube.position.y, 
                        z: self.cube.position.z
                    },
                    "size": {
                        x: self.cube.scale.x, 
                        y: self.cube.scale.y, 
                        z: self.cube.scale.z
                    },
                    "rotation": {
                        x: rotation._x, 
                        y: rotation._y, 
                        z: rotation._z
                    }
                })
            })
        } else {
            three_js_handler.remove_controls()
        }

    }
}

export default CubePointCloud 
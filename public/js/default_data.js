import { Vector3 } from "./threejs/three.js"

const default_user_data = {

}

export {default_user_data}

const default_direction = new Vector3(
    Math.SQRT2/2,
    (Math.SQRT2/2)/(Math.SQRT2/2),
    Math.SQRT2/2
).normalize()

const default_simulation_data = {
    sim_objects: {
        "test_key": {
            "type": "StraightWire",
            "display_name": "Test Wire",
            "position": {
                x: 0,
                y: 0,
                z: 5
            },
            "direction": {
                x: default_direction.x,
                y: default_direction.y,
                z: default_direction.z
            },
            "length": 10
        },
        "test_key_2": {
            "display_name": "Test Point Cloud",
            "type": "CubePointCloud",
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

        },
        "test_key_3": {
            "display_name": "Test Point Cloud2",
            "type": "CubePointCloud",
            "position": {
                x: 0,
                y: 0,
                z: -10
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
    },
    settings: {}
}

export {default_simulation_data}
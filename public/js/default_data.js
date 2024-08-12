import { Vector3 } from "./threejs/three.js"

const default_user_data = {
    ["simulations"]: []
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
        "test_key_4": {
            "display_name": "Test CubicBezierWireApprox",
            "type": "CubicBezierWireApprox",
            "position": {
                x: 0,
                y: 0,
                z: -5
            },
            "wires": 20,
            "p1": {
                x: 0,
                y: 0,
                z: 0
            },
            "p2": {
                x: 10,
                y: 0,
                z: 0
            },
            "p3": {
                x: 10,
                y: 5,
                z: 0
            },
            "p4": {
                x: 0,
                y: 5,
                z: 0
            },
        },
        "test_key_2": {
            "display_name": "Test Point Cloud",
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

        },
        "test_key_3": {
            "display_name": "Test Point Cloud2",
            "type": "CubePointCloud",
            "random_seed": 5,
            "randomness": 0,
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

        },
        "test_key_3": {
            "display_name": "Test FieldLinePoint",
            "type": "FieldLinePoint",
            "position": {
                x: 0,
                y: -1,
                z: 0
            },
            "max_line_point_count": 100,
            "has_inverse": false

        }
    },
    settings: {}
}

export {default_simulation_data}
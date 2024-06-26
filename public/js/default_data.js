const default_user_data = {

}

export {default_user_data}

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
                x: 0,
                y: 1,
                z: 0
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

        }
    },
    settings: {}
}

export {default_simulation_data}
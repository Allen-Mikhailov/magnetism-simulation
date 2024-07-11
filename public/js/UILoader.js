import * as Bars from "./bars.js"

function create_display_name_item(data)
{
    return {
        "type": "string_input", 
        "name": "display_name_input", 
        "value": {
            "edit": true, 
            "key": "display_name", 
            "value": data.display_name, 
            "label": "Name"
        }
    }
}

function create_random_seed_item(data)
{
    return {
        "type": "number_input", 
        "name": "random_seed_input", 
        "value": {
            "edit": true, 
            "key": "random_seed", 
            "value": data.random_seed, 
            "label": "Random Seed"
        }
    }
}

function create_randomness_item(data)
{
    return {
        "type": "number_input", 
        "name": "randomness_input", 
        "value": {
            "edit": true, 
            "key": "randomness", 
            "value": data.randomness, 
            "label": "Randomness"
        }
    }
}

function create_type_display_item(data)
{
    return {
        "type": "string_input", 
        "name": "type_display_input", 
        "value": {
            "edit": false, 
            "key": "type", 
            "value": data.type, 
            "label": "Type"
        }
    }
}

function create_position_item(data)
{
    return {
        "type": "vector3_input", 
        "name": "position_input", 
        "value": {
            "edit": true, 
            "key": "position", 
            "value": data.position, 
            "label": "Position"
        }
    }
}

function create_size_item(data)
{
    return {
        "type": "vector3_input", 
        "name": "size_input", 
        "value": {
            "edit": true, 
            "key": "size", 
            "value": data.size, 
            "label": "Size"
        }
    }
}

function create_points_item(data)
{
    return {
        "type": "vector3_integer_input", 
        "name": "points_input", 
        "value": {
            "edit": true, 
            "key": "points", 
            "value": data.points, 
            "label": "Points"
        }
    }
}

function create_direction_item(data)
{
    return {
        "type": "vector3_normalized_input", 
        "name": "direction_input", 
        "value": {
            "edit": true, 
            "key": "direction", 
            "value": data.direction, 
            "label": "Direction"
        }
    }
}

function create_vector3_item(data, key, label)
{
    return {
        "type": "vector3_input", 
        "name": key+"_input", 
        "value": {
            "edit": true, 
            "key": key, 
            "value": data[key], 
            "label": label
        }
    }
}

const property_header = {"type": "header", "name": "property_header", "value": "Properties"}
const property_data_functions = {
    "StraightWire": (data) => {
        return [
            property_header,
            create_type_display_item(data),
            create_display_name_item(data),
            create_position_item(data),
            {
                "type": "number_input", 
                "name": "length_input", 
                "value": {
                    "edit": true, 
                    "key": "length", 
                    "value": data.length, 
                    "label": "Length"
                }
            },
            create_direction_item(data)
            // {"type": "list-button", "name": "test-header", "value": "Test Thing"}
        ]
    },
    "CubePointCloud": (data) => {
        return [
            property_header,
            create_type_display_item(data),
            create_display_name_item(data),
            create_size_item(data),
            create_points_item(data),
            create_position_item(data),
            create_random_seed_item(data),
            create_randomness_item(data)
            // {"type": "list-button", "name": "test-header", "value": "Test Thing"}
        ]
    },
    "CubicBezierWireApprox": (data) => {
        return [
            property_header,
            create_type_display_item(data),
            create_display_name_item(data),
            create_position_item(data),
            {
                "type": "number_input", 
                "name": "length_input", 
                "value": {
                    "edit": true, 
                    "key": "wires", 
                    "value": data.wires, 
                    "label": "Wires"
                }
            },
            create_vector3_item(data, "p1", "p1"),
            create_vector3_item(data, "p2", "p2"),
            create_vector3_item(data, "p3", "p3"),
            create_vector3_item(data, "p4", "p4")

        ]
    }
}

function property_data_function(data)
{
    if (data == null)
        return [property_header]
    return property_data_functions[data.type](data)
}

function hwrap()
{
    
}

class UILoader
{
    constructor()
    {
        this.events = new Bars.Events()
        this.bars = new Bars.Bars(document.getElementById("root"))
        this.bars.setEvents(this.events)

        this.top_bar = new Bars.Bar("top_bar")
        this.tool_bar = new Bars.Bar("tool_bar")

        const tools_select_group = new Bars.IconButtonSelectGroup("tool_select", this.events)
        tools_select_group.addButton("select", "squares")
        tools_select_group.addButton("translate", "transform")
        tools_select_group.addButton("rotate", "rotate")
        tools_select_group.addButton("scale", "scale")
        this.tool_bar.addItem(tools_select_group)

        this.tools_select_group = tools_select_group


        this.middle_content = new Bars.HContainer("middle_content")

        this.explorer = new Bars.ContentList("explorer")
        this.property_manager = new Bars.PropertyList("property_manager", property_data_function)

        this.main_content = new Bars.RawContent("main_content")
        this.main_content.setEvents(this.events)

        const middle_vertical = new Bars.VContainer("middle_vertical")

        middle_vertical.addItem(this.tool_bar)
        middle_vertical.addItem(new Bars.HBorder());
        middle_vertical.addItem(this.main_content)

        this.middle_content.addItem(this.explorer)
        this.middle_content.addItem(new Bars.VBorder())
        this.middle_content.addItem(this.property_manager)
        this.middle_content.addItem(new Bars.VBorder())
        this.middle_content.addItem(middle_vertical)

        // Organizing
        this.bars.addItem(this.top_bar)
        this.bars.addItem(new Bars.HBorder());
        this.bars.addItem(this.middle_content)
    }

    render()
    {
        this.bars.render()
    }
}

export default UILoader
const IconTable = {
    "clear":     'url("/imgs/clear.png")',
    "squares":   'url("/imgs/select.png")',
    "rotate":    'url("/imgs/rotate.png")',
    "scale":     'url("/imgs/size.png")',
    "transform": 'url("/imgs/transform.png")',
    "circle":    'url("/imgs/circle.png")',
    "lines":     'url("/imgs/lines.png")',
}

function createElement(type, id, className)
{
    const el = document.createElement(type)

    if (id)
        el.id = id

    if (className)
        el.className = className

    return el
}

function createKey() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

class Events
{
    constructor()
    {
        this.connections = {}
        this.parent = null
    }

    setParent(parent)
    {
        this.parent = parent
    }

    connect(event, funct) {
        if (!this.connections[event])
            this.connections[event] = {}

        const key = createKey()
        this.connections[event][key] = funct

        return key
    }

    disconnect(event, key)
    {
        if (this.connections[event] && this.connections[event][key])
            delete this.connections[event][key]
    }

    fire(event, ...args)
    {
        const event_cons = this.connections[event]
        if (event_cons)
        {
            Object.keys(event_cons).map((key) => {
                event_cons[key](...args)
            })
        }

        if (this.parent)
        {
            this.parent.fire(event, ...args)
        }
    }
}

class IconButton
{
    constructor(name, icon)
    {
        this.name = name || "unnamed-button"
        this.icon = icon
        this.action = () => {}

        this.selected = false
        this.active = true

        this.elements = []
    }

    setAction(action)
    {
        this.action = action
    }

    updateState()
    {
        this.elements.map(({element}) => {
            element.className = `iconbutton${this.selected?" selected":""}${this.active?"":" unactive"}`
        })
    }

    toggleSelected(toggle)
    {
        // Checking for no change
        if (this.selected == toggle) {return;}

        this.selected = toggle
        this.updateState()
    }

    toggleActive(toggle)
    {
        // Checking for no change
        if (this.active == toggle) {return;}

        this.active = toggle
        this.updateState()
    }

    render()
    {
        const element = createElement("div", null, "iconbutton")

        const icon_element = createElement("div", null, "icon")
        icon_element.style.backgroundImage = IconTable[this.icon]?IconTable[this.icon]:this.icon
        element.appendChild(icon_element)

        element.onclick = (e) => {
            if (this.action)
                this.action(e)
        }

        this.elements.push({"element": element})

        return element
    }
}

class IconButtonGroup
{
    constructor(name)
    {
        this.name = name
        this.buttons = []

        this.elements = []
    }

    addButton(button)
    {
        this.buttons.push(button)
    }

    render()
    {
        const element = document.createElement("div")
        element.className = "iconbuttongroup"

        const button_element_list = []
        this.buttons.map(button => {
            const button_element = button.render()
            button_element_list.push(button_element)
            element.appendChild(button_element)
        })

        this.elements.push({
            "element": element,
            "button_list": button_element_list
        })

        return element
    }
}

class IconButtonSelectGroup extends IconButtonGroup
{
    constructor(name, events)
    {
        super(name)
        this.selected = null
        this.buttons = []
        this.events = events
        this.action = (name, e) => {
            this.selected = this.selected==name?null:name
            this.updateSelected()
        }
    }

    updateSelected()
    {
        this.buttons.map(button => {
            button.toggleSelected(button.name == this.selected)
        })
        this.events.fire(this.name+"_updated", this.selected)
    }

    setSelected(value)
    {
        this.selected = value
        this.updateSelected()
    }

    addButton(name, icon)
    {
        const button = new IconButton(name, icon)
        button.setAction((e) => {
            this.action(name, e)
        })

        this.buttons.push(button)
    }

    render()
    {
        const element = super.render()

        return element
    }
}

class Container 
{
    constructor(name)
    {
        this.elements = []
        this.items = []
        this.name = name
        
    }

    addItem(item)
    {
        this.items.push(item)
    }

    raw_render(container_class, item_container_class)
    {
        const element = createElement("div", null, container_class)

        const item_element_list = []
        this.items.map(item => {
            if (item_container_class != null)
            {
                const element_container = createElement("div", null, item_container_class)
                const item_element = item.render()
                item_element_list.push(item_element)
                element.appendChild(element_container)
                element_container.appendChild(item_element)
            } else {
                if (item == null)
                {
                    console.warn(`"${this.name}" has a null item`)
                    return
                }

                const item_element = item.render()
                item_element_list.push(item_element)
                element.appendChild(item_element)
            }
        })

        this.elements.push({
            "element": element,
            "item_list": item_element_list
        })

        return element
    }

    render()
    {
        return raw_render("", "")
    }
}

class VContainer extends Container
{
    render()
    {
        return this.raw_render("v-container", null)
    }
}

export {VContainer}

class HContainer extends Container
{
    render()
    {
        return this.raw_render("h-container", null)
    }
}

export {HContainer}

class Bar extends Container {
    render()
    {
        return this.raw_render("bar", "bar-item-container")
    }   
}

class MiniColumn extends Container {
    render()
    {
        return this.raw_render("minicolumn", "minicolumn-item-container")
    }
}

class Column extends Container {
    render()
    {
        return this.raw_render("minicolumn", "minicolumn-item-container")
    }
}

class RawContent
{
    constructor(name)
    {
        this.name = name
        this.element = null
        this.resizer = null
    }

    setEvents(events)
    {
        this.events = events
    }

    render()
    {
        if (this.element)
        {
            console.error("RawContent Rendered Twice")
            return
        }

        const element = createElement("div", null, "raw-content-container")

        const content_resizer = new ResizeObserver(entities => {
            if (this.events)
                this.events.fire(this.name+"_resize")
        })

        content_resizer.observe(element)

        this.element = element
        this.resizer = content_resizer

        return element
    }
}

class ContentListItem
{
    constructor(name, events, value)
    {
        this.name = name
        this.events = events
        this.value = value
        this.list = null

        this.selected = false
        this.item_string = null
        this.element = null
    }

    render()
    {
        this.element = document.createElement("div")
        return this.element;
    }

    update_selected(selected)
    {
        this.selected = selected
        if (selected)
            this.element.classList.add("selected")
        else
            this.element.classList.remove("selected")
    }

    select()
    {
        if (this.selected)
            this.list.update_selected(null)
        else
            this.list.update_selected(this.item_string)
    }

    set_list(list)
    {
        this.list = list
    }

    set_item_string(item_string)
    {
        this.item_string = item_string
    }

    set_order(order)
    {
        this.element.style.order = toString(order)
    }

    update_value(new_value)
    {
        this.value = new_value
    }

    destroy()
    {
        this.element?.remove()
    }
}

class ContentListItemListButton extends ContentListItem
{
    constructor(name, events, label)
    {
        super(name, events, label)
    }

    update_value(value)
    {
        super.update_value(value)
        this.element.innerText = value
    }

    update_selected(selected)
    {
        super.update_selected(selected)
    }

    render()
    {
        this.element = createElement("div", null, "ContentListItemButton")
        const obj = this
        this.element.onclick = (e) => {
            this.events.fire("list_button_press", obj, e)
        }
        this.update_value(this.value)
        return this.element
    }
}

class ContentListItemStringInput extends ContentListItem
{
    constructor(name, events, value)
    {
        super(name, events, value)
    }

    update_value(value)
    {
        super.update_value(value)
        this.label.innerText = value.label
        this.input.value = value.value

        if (value.edit)
            this.input.classList.remove("no-edit")
        else
            this.input.classList.add("no-edit")
    }

    update_selected(selected)
    {
        super.update_selected(selected)
    }

    render()
    {
        this.element = createElement("div", null, "ContentListItemStringInput")
       
        this.label = createElement("div", null, "label")
        this.input = createElement("input", null, "input")

        this.element.appendChild(this.label)
        // this.element.appendChild(createElement("div", null, "v-border"))
        this.element.appendChild(this.input)

        const stop = () => {
            this.events.fire("set_property", this.value.key, this.input.value)
        }

        this.input.onblur = stop
        this.input.onkeydown = (e) => {
            e.stopPropagation()
            if (e.key == "Enter")
                stop()
        }

        this.update_value(this.value)
        return this.element
    }
}

class ContentListItemNumberInput extends ContentListItem
{
    constructor(name, events, value)
    {
        super(name, events, value)
    }

    update_value(value)
    {
        super.update_value(value)
        this.label.innerText = value.label
        this.input.value = value.value
    }

    update_selected(selected)
    {
        super.update_selected(selected)
    }

    render()
    {
        this.element = createElement("div", null, "ContentListItemNumberInput")
       
        this.label = createElement("div", null, "label")
        this.input = createElement("input", null, "input")
        document.createElement("input").type = "number"

        this.element.appendChild(this.label)
        // this.element.appendChild(createElement("div", null, "v-border"))
        this.element.appendChild(this.input)

        const stop = () => {
            this.events.fire("set_property", this.value.key, this.input.value)
        }

        this.input.onblur = stop
        this.input.onkeydown = (e) => {
            e.stopPropagation()
            if (e.key == "Enter")
            {
                this.input.blur()
                stop()
            }
        }

        this.update_value(this.value)
        return this.element
    }
}


const xyz = ["x", "y", "z"]
class ContentListItemVector3Input extends ContentListItem
{
    constructor(name, events, value)
    {
        super(name, events, value)
    }

    update_value(value)
    {
        super.update_value(value)
        this.label.innerText = value.label
        this.input.value = `${value.value.x}, ${value.value.y}, ${value.value.z}`

        for (let i = 0; i < 3; i++)
        {
            this.number_containers[i].input.value = value.value[xyz[i]]
        }
    }

    update_selected(selected)
    {
        super.update_selected(selected)
    }

    render()
    {
        this.element = createElement("div", null, "ContentListItemVectorInput")

        this.label_container = createElement("div", null, "label-container")
       
        this.label = createElement("div", null, "label")
        this.input = createElement("input", null, "input")

        this.number_container = createElement("div", null, "number-container")

        this.label_container.appendChild(this.label)
        // this.element.appendChild(createElement("div", null, "v-border"))
        this.label_container.appendChild(this.input)

        this.element.appendChild(this.label_container)
        this.element.appendChild(this.number_container)

        this.number_containers = []
        for (let i = 0; i < 3; i++)
        {
            const container = createElement("div", null, "container")
            const container_label = createElement("div", null, "label")
            const container_input = createElement("input", null, "input")
            container_input.type = "number"

            container_label.innerText = xyz[i]

            this.number_containers.push({
                container: container,
                label: container_label,
                input: container_input
            })

            container.appendChild(container_label)
            container.appendChild(container_input)
            this.number_container.appendChild(container)
        }
        

        const stop = () => {
            this.events.fire("set_property", this.value.key, this.input.value)
        }

        this.input.onblur = stop
        this.input.onkeydown = (e) => {
            e.stopPropagation()
            if (e.key == "Enter")
            {
                this.input.blur()
                stop()
            }
        }

        this.update_value(this.value)
        return this.element
    }
}

class ContentListItemHeader extends ContentListItem
{
    constructor(name, events, label)
    {
        super(name, events, label)
    }

    update_value(value)
    {
        super.update_value(value)
        this.element.innerText = value
    }

    render()
    {
        this.element = createElement("div", null, "ContentListItemHeader")
        this.element.onclick = (e) => {
            this.events.fire(this, e)
        }
        this.update_value(this.value)
        return this.element
    }
}

const TYPE_MATCH = {
    "list-button": ContentListItemListButton,
    "header": ContentListItemHeader,
    "string_input": ContentListItemStringInput,
    "number_input": ContentListItemNumberInput,
    "vector3_input": ContentListItemVector3Input
}

function GetListItemString(list_item)
{
    return list_item.type+":"+list_item.name
}

class ContentList
{
    constructor(name)
    {
        this.name = name
        this.list = [] // List of inputted data
        this.name_table = {} // table of objects with keys as type:name
        this.events = new Events();

        this.element = null

        this.selected = null
    }

    update_list(new_list)
    {
        const needed_strings = {}
        new_list.map((list_item, i) => {
            const str = GetListItemString(list_item)
            needed_strings[str] = list_item

            let object = this.name_table[str]
            if (this.name_table[str] == undefined)
            {
                if (!TYPE_MATCH[list_item.type])
                    return console.warn(`No list item type "${list_item.type}" found in "${this.name}"`)
                object = new (TYPE_MATCH[list_item.type])(list_item.name, this.events, list_item.value)
                object.set_list(this)
                object.set_item_string(str)
                this.element.appendChild(object.render())
                this.name_table[str] = object
            }

            object.update_value(list_item.value)
            this.name_table[str].set_order(i)
        })

        this.list.map((list_item, i) => {
            const str = GetListItemString(list_item)

            if (needed_strings[str] == undefined)
            {
                this.name_table[str].destroy()
                delete this.name_table[str] 
            }
        })

        this.list = new_list
    }

    update_values(values) // Values by string type:name
    {
        Object.keys(values).map(key => {
            this.name_table[key].update_value(values[key])
        })
    }

    update_value(key, value)
    {
        this.name_table[key].update_value(value)
    }

    update_selected(selected)
    {
        const last_selected = this.selected
        this.selected = selected
        Object.keys(this.name_table).map(item_string => {
            const item = this.name_table[item_string]
            if (item_string == last_selected)
                item.update_selected(false)

            if (item_string == selected)
                item.update_selected(true)
        })
    }

    render()
    {
        const element = createElement("div", null, "ContentList")
        this.element = element

        this.update_list(this.list)

        return element
    }
}

export { ContentList }

class PropertyList extends ContentList
{
    constructor(name, data_function)
    {
        super(name)
        this.data_function = data_function
        this.data = null
    }

    set_data_function(data_function)
    {
        this.data_function = data_function
    }

    update_data(data)
    {
        this.data = data

        const list = this.data_function(data)
        this.update_list(list)
    }
}

export { PropertyList }

class StaticItem
{
    constructor(_type, id, class_name)
    {
        this._type = _type
        this.id = id
        this.class_name = class_name
    }

    render()
    {
        this.element = createElement(this._type, this.id, this.class_name)
        return this.element
    }
}

export {StaticItem}

class HBorder extends StaticItem
{
    constructor()
    {
        super("div", null, "h-border")
    }
}

class VBorder extends StaticItem
{
    constructor()
    {
        super("div", null, "v-border")
    }
}

export { HBorder, VBorder }

class Bars
{
    constructor(root)
    {
        this.root = root

        this.items = []

        this.events = new Events();
    }

    addItem(item)
    {
        this.items.push(item)
    }

    render()
    {
        this.items.map((item) => {
            const element = item.render()
            this.root.appendChild(element)
        })
    }

    setEvents(events)
    {
        this.events = events
    }
}

export { 
    Bars,
    
    Events,
    createKey, 

    RawContent,

    Container,
    Bar,
    MiniColumn,
    Column,

    IconButton, 
    IconButtonGroup, 
    IconButtonSelectGroup
}
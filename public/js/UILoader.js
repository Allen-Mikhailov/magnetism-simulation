import * as Bars from "./bars.js"

class UILoader
{
    constructor()
    {
        this.events = new Bars.Events()
        this.bars = new Bars.Bars(document.getElementById("root"))
        this.bars.setEvents(this.events)

        this.top_bar = new Bars.Bar("top_bar")
        this.tool_bar = new Bars.Bar("tool_bar")

        this.middle_content = new Bars.HContainer("middle_content")

        this.explorer = new Bars.ContentList("explorer")
        // this.property_manager = 

        this.main_content = new Bars.RawContent("main_content")
        this.main_content.setEvents(this.events)

        const middle_vertical = new Bars.VContainer("middle_vertical")

        middle_vertical.addItem(this.tool_bar)
        middle_vertical.addItem(new Bars.HBorder());
        middle_vertical.addItem(this.main_content)

        this.middle_content.addItem(this.explorer)
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
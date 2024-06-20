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

        this.main_content = new Bars.RawContent("main_content")
        this.main_content.setEvents(this.events)

        this.middle_content = new Bars.HContainer("middle_content")
        this.explorer = new Bars.ContentList("explorer")

        // Organizing
        this.bars.addItem(this.top_bar)
        this.bars.addItem(this.tool_bar)
        this.bars.addItem(this.main_content)
    }

    render()
    {
        this.bars.render()
    }
}

export default UILoader
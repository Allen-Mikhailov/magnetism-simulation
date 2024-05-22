import { Color } from "./threejs/three"

const color = new Color(1, 1, 1);

function sample_array(array, index, apply)
{
    apply = apply || ((v1, v2, i) =>  v1*i+v2*(1-i))
    return apply(array[Math.ceil(index)], array[Math.floor(index)], index%1)
}

function color_lerp(v1, v2, i)
{
    return v1.lerp(v2, i)
}

class ColorBand
{
    constructor(colors)
    {
        this.colors = colors
        this.modifier = (x) => x
        this.scale = null
        this.color_scale = null
    }

    set_modifier(modifier)
    {
        this.modifier = modifier
    }

    compute_scale(array, points)
    {
        const scale = []
        const color_scale = []
        const modified_array = []
        array.map((value) => {
            modified_array.push(this.modifier(value))
        })
        modified_array.sort()

        for (let i = 0; i < points; i++)
        {
            const index = i/(points-1)
            scale.push(sample_array(modified_array, index * ((array.length-1) / points)))
            color_scale.push(sample_array(this.colors, index * ((this.colors-1) / points), color_lerp))
        }

        this.scale = scale
        this.color_scale = color_scale
    }

    get_color(value)
    {
        if (this.scale == null)
        {
            console.error("ColorBand scale was not computed beforehand");
            return
        }

        const modded_value = this.modifier(value)

        let index = 0
        while (index+1 < this.scale.length && value > this.scale[index+1])
        {
            index++;
        }

        let alpha = Math.max(modded_value - this.scale[index], 0)/this.scale[index+1]
        return this.color_scale[index].lerp(this.color_scale[index+1], alpha)
    }
}

export default ColorBand
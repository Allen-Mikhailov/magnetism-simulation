import { Color } from "./threejs/three.js"

const color = new Color(1, 1, 1);

function sample_array(array, index, apply)
{
    apply = apply || ((v1, v2, i) =>  v1*i+v2*(1-i))
    return apply(array[Math.floor(index)], array[Math.ceil(index)], index%1)
}

function color_lerp(v1, v2, i)
{
    return v1.clone().lerp(v2, i)
}

class ColorBand
{
    constructor(colors)
    {
        this.colors = colors
        this.modifier = (x) => x
        this.scale = null
        this.color_scale = null

        console.log("colors", colors)
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

        // console.log("init", modified_array, points)

        for (let i = 0; i < points; i++)
        {
            const index = i/(points-1)
            scale.push(sample_array(modified_array, index * (modified_array.length-1)))
            color_scale.push(sample_array(this.colors, index * (this.colors.length-1), color_lerp))
        }

        this.scale = scale
        this.color_scale = color_scale
    }

    get_index(value)
    {
        const modded_value = this.modifier(value)

        let index = 0
        while (index+2 < this.scale.length && modded_value > this.scale[index+1])
        {
            index++;
        }

        let alpha = Math.max(modded_value - this.scale[index], 0)/(this.scale[index+1]-this.scale[index])

        return index+alpha
    }

    get_color(value)
    {
        let index = this.get_index(value)
        return sample_array(this.color_scale, index, color_lerp)
    }
}

export default ColorBand
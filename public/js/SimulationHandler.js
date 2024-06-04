import { Universe } from "../pkg/magnetism_simulation.js";
import { load_from_object } from "./SimulationObjectClasses.js";

import { createKey } from "./bars.js";

class SimulationHandler
{
    constructor()
    {
        this.sim_objects = {}
        this.universe = new Universe();
    }

    clear()
    {

    }

    from_json(json_obj)
    {
        this.sim_objects = {}
        Object.keys(json_obj.sim_objects).map((key) => {
            const sim_object = json_obj.sim_objects[key]
            const json = sim_object.to_json()
            json_obj.sim_objects[key] = json
        })
    }

    to_json()
    {
        const json_obj = {}
        json_obj.sim_objects = {}

        Object.keys(this.sim_objects).map((key) => {
            const sim_object = this.sim_objects[key]
            const json = sim_object.to_json()
            json_obj.sim_objects[key] = json
        })
        return sim_objects
    }
}

export {SimulationHandler}
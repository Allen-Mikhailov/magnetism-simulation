mod vector3;
use cgmath::*;
use vector3::Vector3;

use wasm_bindgen::prelude::*;

use std::{ops::Sub};
use std::ptr;

const PI: f64 = std::f64::consts::PI;
enum ObjectType {
    StraightWire,
    Undefined,
}

#[wasm_bindgen]
pub struct SimulationObject
{
    _type: ObjectType,
    active: bool,
    handle: usize,
    pos: Vector3,
    direction: Vector3,
    length: f64
}

impl SimulationObject {
    pub fn new() -> SimulationObject
    {
        let pos: Vector3 = Vector3::new(0f64, 0f64, 0f64);
        let direction: Vector3 = Vector3::new(0f64, 0f64, 0f64);
        return SimulationObject {
            _type: ObjectType::Undefined,
            active: true,
            handle: 0,
            pos,
            direction,
            length: 0f64,

        }
    }
}

pub fn apply_straight_wire(wire: &SimulationObject, pos: &Vector3) -> Vector3
{
    let dir: cgmath::Vector3<f64> = wire.direction.normalize().to_cg();

    let up = Vector3 {
        x: 0f64, y: 1f64, z: 0f64,
    }.to_cg();

    let to_up = Quaternion::between_vectors(dir, up);
    let from_up = Quaternion::between_vectors(up, dir);

    let l: f64 = wire.length;
    let w: Vector3 = wire.pos;
    let f: cgmath::Vector3<f64> = to_up.rotate_vector(pos.sub(w).to_cg());

    let c: f64 = f.x*f.x+f.z*f.z;


    let mut integral: f64 = (l-f.y)*(l*l-2f64*f.y*l+f.y*f.y+c).sqrt()/(c*l*l- 2f64*c*l*f.y+c*f.y*f.y+c*c);
    integral += f.y/(c*(f.y*f.y+c).sqrt());
    integral /= l;

    let field: cgmath::Vector3<f64> = from_up.rotate_vector(Vector3 {
        x: l*f.z*integral,
        y: 0f64,
        z: -l*f.x*integral,
    }.to_cg());

    return Vector3 {
        x: field.x,
        y: field.y,
        z: field.z,
    };
}


#[wasm_bindgen]
pub struct Universe {
    object_list: Vec<SimulationObject>,

    straight_wires: Vec<usize>,

    record_point_count: usize,
    record_points: Vec<Vector3>,
    record_point_vectors: Vec<Vector3>,


}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let record_points = Vec::new();
        let record_point_vectors: Vec<Vector3> = Vec::new();

        let object_list: Vec<SimulationObject> = Vec::new();
        let straight_wires: Vec<usize> = Vec::new();
        
        return Universe {
            object_list,
            straight_wires,

            record_point_count: 0,
            record_points,
            record_point_vectors,
        }
    }

    pub fn get_next_handle(&mut self) -> usize
    {
        let sim_count: usize = self.object_list.len();
        for i in 0..sim_count
        {
            if self.object_list[i].active == false
            {
                return i;
            }
        }

        let new_object: SimulationObject = SimulationObject::new();
        self.object_list.push(new_object);

        return sim_count;
    }

    pub fn free_handle(&mut self, handle: usize)
    {
        self.object_list[handle as usize].active = false;

        match self.object_list[handle as usize]._type
        {
            ObjectType::StraightWire => {
                for i in 0..self.straight_wires.len()
                {
                    if self.straight_wires[i] == handle
                    {
                        self.straight_wires.remove(i);
                        break;
                    }
                }
            },
            ObjectType::Undefined => {

            }
        }
    }

    pub fn add_straight_wire(&mut self, pos: Vector3, direction: Vector3, length: f64) -> usize
    {
        let handle = self.get_next_handle();
        self.object_list[handle]._type = ObjectType::StraightWire;
        self.object_list[handle].pos = pos;
        self.object_list[handle].direction = direction;
        self.object_list[handle].length = length;

        return handle;
    }

    // Value functions
    pub fn set_object_position(&mut self, handle: usize, position: Vector3)
    {
        self.object_list[handle].pos = position;
    }

    pub fn set_object_direction(&mut self, handle: usize, direction: Vector3)
    {
        self.object_list[handle].direction = direction;
    }

    pub fn set_object_length(&mut self, handle: usize, length: f64)
    {
        self.object_list[handle].length = length;
    }


    pub fn compute_field(&self, p: &Vector3) -> Vector3
    {
        // for container in self.
        let mut field: Vector3 = Vector3::zero();

        for wire_handle in self.straight_wires.iter()
        {
            field = field + apply_straight_wire(&self.object_list[*wire_handle], p);
        }

        return field;
    }

    pub fn compute_record_points(&mut self)
    {
        // Assume
        self.record_point_vectors = Vec::with_capacity(self.record_points.len());
        for i in 0..self.record_points.len()
        {
            self.record_point_vectors.push(self.compute_field(&self.record_points[i]));
        }
    }

    pub fn set_record_point_count(&mut self, count: usize)
    {
        self.record_point_count = count;
        self.record_points = Vec::new();
        self.record_point_vectors = Vec::new();
        for i in 0..count
        {
            self.record_points.push(Vector3 {x: 0f64, y: 0f64, z: 0f64});
            self.record_point_vectors.push(Vector3 {x: 0f64, y: 0f64, z: 0f64});
        }
    }

    pub fn record_point_vectors_ptr(&self) -> * const Vector3
    {
        return self.record_point_vectors.as_ptr();
    }

    pub fn record_points_ptr(&self) -> * const Vector3
    {
        return self.record_points.as_ptr();
    }
}
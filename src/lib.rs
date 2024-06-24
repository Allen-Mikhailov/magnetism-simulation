mod vector3;
use cgmath::*;
use vector3::Vector3;

use wasm_bindgen::prelude::*;

use std::{ops::Sub};
use std::ptr;

const PI: f64 = std::f64::consts::PI;
enum ObjectType {
    StraightWire,
    V6,
}

#[wasm_bindgen]
pub struct SimulationObject
{
    _type: ObjectType,
    active: bool,
    pos: Vector3,
    direction: Vector3,
    length: f64
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

    straight_wires: Vec<SimulationObject>,

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
        let straight_wires: Vec<SimulationObject> = Vec::new();
        
        return Universe {
            object_list,
            straight_wires,

            record_points,
            record_point_vectors,
        }
    }


    pub fn compute_field(&self, p: &Vector3) -> Vector3
    {
        // for container in self.
        let mut field: Vector3 = Vector3::zero();

        for wire in &self.straight_wires
        {
            field = field + apply_straight_wire(wire, p);
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

    pub fn get_record_point_ptr(&self) -> * const Vector3
    {
        // let test = &self.buffer_test;
        // std::mem::forget(self.buffer_test);
        return self.record_points.as_ptr();
    }

    pub fn record_point_vectors_ptr(&self) -> * const Vector3
    {
        return self.record_point_vectors.as_ptr();
    }

    pub fn get_record_point_count(&self) -> usize
    {
        return  self.record_points.len();
    }
}
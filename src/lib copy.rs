mod vector3;
use cgmath::*;
use vector3::Vector3;

use wasm_bindgen::prelude::*;

use std::{ops::Sub};
use std::ptr;

const PI: f64 = std::f64::consts::PI;

use rand::prelude::*;
use rand_chacha::ChaCha8Rng;

trait SimulationObject {
    fn modify_sand(&self, sand: &mut Vec<Vector3>)
    {
        
    }

    fn is_sand_modifier(&self) -> bool
    {
        return false;
    }

    fn apply_field(&self, pos: Vector3) -> Vector3
    {
        return Vector3::zero();
    }

    fn is_field_producer(&self) -> bool
    {
        return false;
    }
}

#[wasm_bindgen]
pub struct RecordPointMatrix
{
    pos: Vector3,
    size: Vector3,
    point_scale: Vector3,
    point_randomness: f64,
    random_seed: u64,
}

#[wasm_bindgen]
impl RecordPointMatrix {
    pub fn new(pos: Vector3, 
        size: Vector3, 
        point_scale: Vector3, 
        point_randomness: f64, 
        random_seed: u64, ) -> RecordPointMatrix {
        return RecordPointMatrix {
            pos, size, point_scale, point_randomness, random_seed
        }
    }
}

impl SimulationObject for RecordPointMatrix {
    fn is_sand_modifier(&self) -> bool {
        return true;
    }

    fn modify_sand(&self, sand: &mut Vec<Vector3>) {
        let mut rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(self.random_seed);
        for x in 0..self.point_scale.x as usize
        {
            for y in 0..self.point_scale.y as usize
            {
                for z in 0..self.point_scale.z as usize
                {
                    sand.push(Vector3 {
                        x: ((x as f64)/(self.point_scale.x-1f64)-0.5f64)*self.size.x
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.x,
                        y: ((y as f64)/(self.point_scale.y-1f64)-0.5f64)*self.size.y
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.y,
                        z: ((z as f64)/(self.point_scale.z-1f64)-0.5f64)*self.size.z
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.z,
                    });
                }
            }
        }
    }
}

#[wasm_bindgen]
pub struct RecordPointSphere
{
    pos: Vector3,
    size: Vector3,
    rings: u64,
    point_scale: u64,
    point_randomness: f64,
    random_seed: u64,
}

#[wasm_bindgen]
impl RecordPointSphere {
    pub fn new(pos: Vector3, 
        size: Vector3,
        rings: u64,  
        point_scale: u64, 
        point_randomness: f64, 
        random_seed: u64, ) -> RecordPointSphere {
        return RecordPointSphere {
            pos, size, rings, point_scale, point_randomness, random_seed
        }
    }
}

impl SimulationObject for RecordPointSphere {
    fn is_sand_modifier(&self) -> bool {
        return true;
    }

    fn modify_sand(&self, sand: &mut Vec<Vector3>) {
        let mut rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(self.random_seed);
        for x in 0..self.point_scale
        {
            let x_rot = PI * 2f64*(x as f64 / self.point_scale as f64);
            for y in 0..self.point_scale
            {
                let y_rot = PI * 2f64*(y as f64 / self.point_scale as f64);
                let rot_vector = Vector3 {
                    x: y_rot.cos()*x_rot.sin(),
                    y: y_rot.sin()*x_rot.sin(),
                    z: x_rot.cos()
                };
                for ring in 0..self.rings
                {
                    let ring_i = (ring as f64 + 1f64)/(self.rings as f64);
                    sand.push(Vector3 {
                        x: rot_vector.x * self.size.x * ring_i * 0.5f64
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.x,
                        y: rot_vector.y * self.size.y * ring_i * 0.5f64
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.y,
                        z: rot_vector.z * self.size.z * ring_i * 0.5f64
                            + (rng.gen_range(-1f64..1f64))*self.point_randomness + self.pos.z,
                    });
                }
            }
        }
    }
}

#[wasm_bindgen]
pub enum Shape
{
    Block,
    Sphere
}

#[wasm_bindgen]
pub struct NoPointArea
{
    pos: Vector3,
    size: Vector3,
    shape: Shape
}

#[wasm_bindgen]
impl NoPointArea {
    pub fn new(shape: u32, pos: Vector3, size: Vector3) -> NoPointArea
    {
        let shap: Shape = match shape
        {
            0 => Shape::Block,
            1 => Shape::Sphere,
            _ => Shape::Block
        };
        return NoPointArea {
            pos,
            size,
            shape: shap
        }
    }
}

impl SimulationObject for NoPointArea {
    fn is_sand_modifier(&self) -> bool {
        return true;
    }

    fn modify_sand(&self, sand: &mut Vec<Vector3>) {
        let length: usize = sand.len();
        'main: for i in (0..length-1usize).rev()
        {
            let p =  sand[i];
            let relative_pos = self.pos-p;
            match self.shape 
            {
                Shape::Block => {
                    if relative_pos.x.abs() < self.size.x / 2f64
                        && relative_pos.y.abs() < self.size.y / 2f64
                        && relative_pos.z.abs() < self.size.z / 2f64
                    {
                        sand.remove(i);
                        continue 'main;
                    }
                },
                Shape::Sphere => {
                    if ((relative_pos.x/self.size.x).powf(2f64).abs() 
                        +(relative_pos.y/self.size.y).powf(2f64).abs() 
                        +(relative_pos.z/self.size.z).powf(2f64).abs() ).sqrt() <= 1f64
                    {
                        sand.remove(i);
                        continue 'main;
                    }
                }
            }
        }
    }
}

#[wasm_bindgen]
pub struct StraightWire
{
    pos: Vector3,
    direction: Vector3,
    length: f64
}

#[wasm_bindgen]
impl StraightWire
{
    pub fn new(pos: Vector3, direction: Vector3, length: f64) -> StraightWire
    {
        return StraightWire {
            pos,
            direction,
            length
        }
    }

    pub fn set_pos(&mut self, pos: Vector3)
    {
        self.pos = pos;
    }

    pub fn set_direction(&mut self, direction: Vector3)
    {
        self.direction = direction;
    }

    pub fn set_length(&mut self, length: f64)
    {
        self.length = length;
    }
}

impl SimulationObject for StraightWire {
    fn is_field_producer(&self) -> bool {
        return true;
    }

    fn apply_field(&self, pos: Vector3) -> Vector3 {
        let dir: cgmath::Vector3<f64> = self.direction.normalize().to_cg();

        let up = Vector3 {
            x: 0f64, y: 1f64, z: 0f64,
        }.to_cg();

        let to_up = Quaternion::between_vectors(dir, up);
        let from_up = Quaternion::between_vectors(up, dir);

        let l: f64 = self.length;
        let w: Vector3 = self.pos;
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
}

#[wasm_bindgen]
pub struct Container
{
    package: Box<dyn SimulationObject>,
}

#[wasm_bindgen]
impl Container 
{
    pub fn box_record_point_matrix(matrix: RecordPointMatrix) -> Container
    {
        return Container { package: Box::new(matrix)};
    }

    pub fn box_record_point_sphere(sphere: RecordPointSphere) -> Container
    {
        return Container { package: Box::new(sphere)};
    }

    pub fn box_no_point_area(area: NoPointArea) -> Container
    {
        return Container { package: Box::new(area)};
    }

    pub fn box_straight_wire(wire: StraightWire) -> Container
    {
        return Container { package: Box::new(wire)};
    }
}


#[wasm_bindgen]
pub struct Universe {
    objects: Vec<Container>,
    field_objects: Vec<Container>,

    record_points: Vec<Vector3>,
    record_point_vectors: Vec<Vector3>,


}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let record_points = Vec::new();
        let record_point_vectors: Vec<Vector3> = Vec::new();

        let objects: Vec<Container> = Vec::new();
        let field_objects: Vec<Container> = Vec::new();
        
        return Universe {
            record_points,
            record_point_vectors,

            objects,
            field_objects
        }
    }

    pub fn compute_field(&self, p: &Vector3) -> Vector3
    {
        // for container in self.
        let mut field: Vector3 = Vector3::zero();

        for container in &self.field_objects
        {
            field = field + (*container.package).apply_field(*p);
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

    pub fn add_record_points(&mut self)
    {
        let mut new_sand = Vec::new();

        for container in &self.objects
        {
            if (*container.package).is_sand_modifier()
            {
                (*container.package).modify_sand(&mut new_sand);
            }
        }

        self.record_points = new_sand;
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

    pub fn add_object(&mut self, container: Container)
    {
        self.objects.push(container);
        // if (container.package)
    }

    pub fn remove_object(&mut self, container: Container)
    {
        for i in 0..self.objects.len()
        {
            if ptr::eq(&(self.objects[i]), &container)
            {
                self.objects.remove(i);
                break;
            }
        }
    }
}

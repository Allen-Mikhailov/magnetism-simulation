mod vector3;
use vector3::Vector3;

use wasm_bindgen::prelude::*;

use std::ops::Sub;
use std::vec;
use js_sys::Math::min;
use js_sys::Object;
use js_sys::{Array};

const PI: f64 = std::f64::consts::PI;

use rand::prelude::*;
use rand_chacha::ChaCha8Rng;

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
impl Vector3 {
    pub fn js_new(x: f64, y: f64, z: f64) -> Vector3
    {
        return Vector3 {
            x,
            y,
            z
        };
    }
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


#[wasm_bindgen]
pub struct Universe {
    record_points: Vec<Vector3>,
    record_point_vectors: Vec<Vector3>,

    record_point_matrixs: Vec<RecordPointMatrix>,
    record_point_spheres: Vec<RecordPointSphere>,

    no_point_areas: Vec<NoPointArea>
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let record_points = Vec::new();
        let record_point_vectors: Vec<Vector3> = Vec::new();

        let record_point_matrixs: Vec<RecordPointMatrix> = Vec::new();
        let no_point_areas: Vec<NoPointArea>   = Vec::new();
        let record_point_spheres: Vec<RecordPointSphere> = Vec::new();
        
        return Universe {
            record_points,
            record_point_vectors,

            record_point_matrixs,
            record_point_spheres,

            no_point_areas
        }
    }

    pub fn compute_field(&self, p: &Vector3) -> Vector3
    {
        let wl = 10;
        let w: Vector3 = Vector3 {
            x: 0f64, y: -5f64, z: 0f64
        };
        let f: Vector3 = p.sub(w);
        let c1: f64 = f.x*f.x+f.z*f.z;

        let d1: f64 = f.y-wl as f64;

        return Vector3 {
            x: f.z*(d1/(c1*(d1*d1+c1).sqrt())-f.y/(c1+(f.y*f.y+c1).sqrt())),
            y: 0f64,
            z: -f.x*(d1/(c1*(d1*d1+c1).sqrt())-f.y/(c1+(f.y*f.y+c1).sqrt())),
        }
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
        self.record_points = Vec::new();
        for matrix in &self.record_point_matrixs
        {
            let mut rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(matrix.random_seed);
            for x in 0..matrix.point_scale.x as usize
            {
                for y in 0..matrix.point_scale.y as usize
                {
                    for z in 0..matrix.point_scale.z as usize
                    {
                        self.record_points.push(Vector3 {
                            x: ((x as f64)/(matrix.point_scale.x-1f64)-0.5f64)*matrix.size.x
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness + matrix.pos.x,
                            y: ((y as f64)/(matrix.point_scale.y-1f64)-0.5f64)*matrix.size.y
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness + matrix.pos.y,
                            z: ((z as f64)/(matrix.point_scale.z-1f64)-0.5f64)*matrix.size.z
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness + matrix.pos.z,
                        });
                    }
                }
            }
        }

        for sphere in &self.record_point_spheres
        {
            let mut rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(sphere.random_seed);
            for x in 0..sphere.point_scale
            {
                let x_rot = PI * 2f64*(x as f64 / sphere.point_scale as f64);
                for y in 0..sphere.point_scale
                {
                    let y_rot = PI * 2f64*(y as f64 / sphere.point_scale as f64);
                    let rot_vector = Vector3 {
                        x: y_rot.cos()*x_rot.sin(),
                        y: y_rot.sin()*x_rot.sin(),
                        z: x_rot.cos()
                    };
                    for ring in 0..sphere.rings
                    {
                        let ring_i = (ring as f64 + 1f64)/(sphere.rings as f64);
                        self.record_points.push(Vector3 {
                            x: rot_vector.x * sphere.size.x * ring_i * 0.5f64
                                + (rng.gen_range(-1f64..1f64))*sphere.point_randomness + sphere.pos.x,
                            y: rot_vector.y * sphere.size.y * ring_i * 0.5f64
                                + (rng.gen_range(-1f64..1f64))*sphere.point_randomness + sphere.pos.y,
                            z: rot_vector.z * sphere.size.z * ring_i * 0.5f64
                                + (rng.gen_range(-1f64..1f64))*sphere.point_randomness + sphere.pos.z,
                        });
                    }
                }
            }
        }

        let length: usize = self.record_points.len();
        'main: for i in (0..length-1usize).rev()
        {
            let p =  self.record_points[i];
            for area in &self.no_point_areas
            {
                let relative_pos = area.pos-p;
                match area.shape 
                {
                    Shape::Block => {
                        if relative_pos.x.abs() < area.size.x 
                            && relative_pos.y.abs() < area.size.y
                            && relative_pos.z.abs() < area.size.z
                        {
                            self.record_points.remove(i);
                            continue 'main;
                        }
                    },
                    Shape::Sphere => {
                        if ((relative_pos.x/area.size.x).powf(2f64).abs() 
                            +(relative_pos.y/area.size.y).powf(2f64).abs() 
                            +(relative_pos.z/area.size.z).powf(2f64).abs() ).sqrt() <= 1f64
                        {
                            self.record_points.remove(i);
                            continue 'main;
                        }
                    }
                }
            }
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

    pub fn add_record_point_matrix(&mut self, matrix: RecordPointMatrix)
    {
        self.record_point_matrixs.push(matrix);
    }

    pub fn add_no_point_area(&mut self, no_point_area: NoPointArea)
    {
        self.no_point_areas.push(no_point_area);
    }

    pub fn add_point_sphere(&mut self, point_sphere: RecordPointSphere)
    {
        self.record_point_spheres.push(point_sphere);
    }
}

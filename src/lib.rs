mod vector3;
use vector3::Vector3;

use wasm_bindgen::prelude::*;

use std::vec;
use std::f32::consts::PI;
use js_sys::Math::min;
use js_sys::Object;
use js_sys::{Array};

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
pub struct NoPointCube
{
    pos: Vector3,
    size: Vector3,
}

#[wasm_bindgen]
impl NoPointCube {
    pub fn new(pos: Vector3, size: Vector3) -> NoPointCube
    {
        return NoPointCube {
            pos,
            size
        }
    }
}


#[wasm_bindgen]
pub struct Universe {
    record_points: Vec<Vector3>,
    record_point_vectors: Vec<Vector3>,

    record_point_matrixs: Vec<RecordPointMatrix>,
    no_point_cubes: Vec<NoPointCube>
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let record_points = Vec::new();
        let record_point_vectors: Vec<Vector3> = Vec::new();

        let record_point_matrixs: Vec<RecordPointMatrix> = Vec::new();
        let no_point_cubes: Vec<NoPointCube>   = Vec::new();
        
        return Universe {
            record_points,
            record_point_vectors,

            record_point_matrixs,
            no_point_cubes
        }
    }

    pub fn compute_field(&self, p: &Vector3) -> Vector3
    {
        const UP: Vector3 = Vector3 {
            x: 1f64,y: 1f64,z: 1f64
        };
        return UP.cross(p)/(p.magnitude());
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
                            x: ((x as f64)/(matrix.point_scale.x-1f64)-0.5f64)*2f64*matrix.size.x
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness,
                            y: ((y as f64)/(matrix.point_scale.y-1f64)-0.5f64)*2f64*matrix.size.y
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness,
                            z: ((z as f64)/(matrix.point_scale.z-1f64)-0.5f64)*2f64*matrix.size.z
                                + (rng.gen_range(-1f64..1f64))*matrix.point_randomness,
                        });
                    }
                }
            }
        }

        let length: usize = self.record_points.len();
        'main: for i in (0..length-1usize).rev()
        {
            let p =  self.record_points[i];
            for cube in &self.no_point_cubes
            {
                let relative_pos = cube.pos-p;
                if relative_pos.x.abs() < cube.size.x 
                    && relative_pos.y.abs() < cube.size.y
                    && relative_pos.z.abs() < cube.size.z
                {
                    self.record_points.remove(i);
                    continue 'main;
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

    pub fn add_no_point_cube(&mut self, no_point_cube: NoPointCube)
    {
        self.no_point_cubes.push(no_point_cube);
    }
}

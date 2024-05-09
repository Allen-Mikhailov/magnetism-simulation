use wasm_bindgen::prelude::*;

use std::{
    f64::consts::PI,
    ops::{Add, Div, Mul, Sub},
};

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
#[repr(C)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[allow(dead_code)]
impl Vector3 {
    pub fn new(x: f64, y: f64, z: f64) -> Vector3 {
        Vector3 { x, y, z }
    }

    pub fn zero() -> Vector3 {
        Vector3 {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    }

    pub fn from_u32(x: u32, y: u32, z: u32) -> Vector3 {
        Vector3 {
            x: x.try_into().unwrap(),
            y: y.try_into().unwrap(),
            z: z.try_into().unwrap(),
        }
    }

    pub fn from_i32(x: i32, y: i32, z: i32) -> Vector3 {
        Vector3 {
            x: x.try_into().unwrap(),
            y: y.try_into().unwrap(),
            z: z.try_into().unwrap(),
        }
    }
}

impl Add for Vector3 {
    type Output = Vector3;

    fn add(self, rhs: Self) -> Self::Output {
        Vector3 {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
        }
    }
}

impl Sub for Vector3 {
    type Output = Vector3;

    fn sub(self, rhs: Self) -> Self::Output {
        Vector3 {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
        }
    }
}

impl Mul<f64> for Vector3 {
    type Output = Vector3;

    fn mul(self, scalar: f64) -> Self::Output {
        Vector3 {
            x: self.x * scalar,
            y: self.y * scalar,
            z: self.z * scalar,
        }
    }
}

impl Div<f64> for Vector3 {
    type Output = Vector3;

    fn div(self, scalar: f64) -> Self::Output {
        Vector3 {
            x: self.x / scalar,
            y: self.y / scalar,
            z: self.z / scalar,
        }
    }
}

impl PartialEq for Vector3 {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y && self.z == other.z
    }
}

#[allow(dead_code)]
impl Vector3 {
    pub fn magnitude(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2) + self.z.powi(2)).sqrt()
    }

    pub fn dot(&self, other: &Vector3) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    pub fn cross(&self, other: &Vector3) -> Vector3 {
        Vector3 {
            x: self.y * other.z - other.y * self.z,
            y: -(self.x * other.z - other.x * self.z),
            z: self.x * other.y - other.x * self.y,
        }
    }

    pub fn angle(&self, other: Vector3) -> f64 {
        (self.dot(&other) / (self.magnitude() * other.magnitude())).acos()
    }

    pub fn angle_deg(&self, other: Vector3) -> f64 {
        (self.dot(&other) / (self.magnitude() * other.magnitude())).acos() * (180.0 / PI)
    }

    pub fn normalize(&self) -> Vector3 {
        self.clone() / self.magnitude()
    }
}
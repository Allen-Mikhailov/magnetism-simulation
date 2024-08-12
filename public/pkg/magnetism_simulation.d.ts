/* tslint:disable */
/* eslint-disable */
/**
*/
export class SimulationObject {
  free(): void;
}
/**
*/
export class Universe {
  free(): void;
/**
* @returns {Universe}
*/
  static new(): Universe;
/**
* @returns {number}
*/
  get_next_handle(): number;
/**
* @param {number} handle
*/
  free_handle(handle: number): void;
/**
* @param {Vector3} pos
* @param {Vector3} direction
* @param {number} length
* @returns {number}
*/
  add_straight_wire(pos: Vector3, direction: Vector3, length: number): number;
/**
* @param {number} handle
* @param {Vector3} position
*/
  set_object_position(handle: number, position: Vector3): void;
/**
* @param {number} handle
* @param {Vector3} direction
*/
  set_object_direction(handle: number, direction: Vector3): void;
/**
* @param {number} handle
* @param {number} length
*/
  set_object_length(handle: number, length: number): void;
/**
* @param {Vector3} p
* @returns {Vector3}
*/
  compute_field(p: Vector3): Vector3;
/**
*/
  compute_record_points(): void;
/**
* @param {number} count
*/
  set_record_point_count(count: number): void;
/**
* @returns {number}
*/
  record_point_vectors_ptr(): number;
/**
* @returns {number}
*/
  record_points_ptr(): number;
/**
* @param {number} index
*/
  compute_line(index: number): void;
/**
*/
  compute_lines(): void;
/**
* @param {number} count
*/
  set_field_line_step_count(count: number): void;
/**
* @param {number} lines
* @param {number} max_line_size
*/
  set_lines_count(lines: number, max_line_size: number): void;
/**
* @returns {number}
*/
  field_line_polarities_ptr(): number;
/**
* @returns {number}
*/
  field_line_start_points_ptr(): number;
/**
* @returns {number}
*/
  field_lines_ptr(): number;
}
/**
*/
export class Vector3 {
  free(): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
* @returns {Vector3}
*/
  static js_new(x: number, y: number, z: number): Vector3;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  set(x: number, y: number, z: number): void;
/**
*/
  x: number;
/**
*/
  y: number;
/**
*/
  z: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_simulationobject_free: (a: number) => void;
  readonly __wbg_universe_free: (a: number) => void;
  readonly universe_new: () => number;
  readonly universe_get_next_handle: (a: number) => number;
  readonly universe_free_handle: (a: number, b: number) => void;
  readonly universe_add_straight_wire: (a: number, b: number, c: number, d: number) => number;
  readonly universe_set_object_position: (a: number, b: number, c: number) => void;
  readonly universe_set_object_direction: (a: number, b: number, c: number) => void;
  readonly universe_set_object_length: (a: number, b: number, c: number) => void;
  readonly universe_compute_field: (a: number, b: number) => number;
  readonly universe_compute_record_points: (a: number) => void;
  readonly universe_set_record_point_count: (a: number, b: number) => void;
  readonly universe_record_point_vectors_ptr: (a: number) => number;
  readonly universe_record_points_ptr: (a: number) => number;
  readonly universe_compute_line: (a: number, b: number) => void;
  readonly universe_compute_lines: (a: number) => void;
  readonly universe_set_field_line_step_count: (a: number, b: number) => void;
  readonly universe_set_lines_count: (a: number, b: number, c: number) => void;
  readonly universe_field_line_polarities_ptr: (a: number) => number;
  readonly universe_field_line_start_points_ptr: (a: number) => number;
  readonly universe_field_lines_ptr: (a: number) => number;
  readonly __wbg_vector3_free: (a: number) => void;
  readonly __wbg_get_vector3_x: (a: number) => number;
  readonly __wbg_set_vector3_x: (a: number, b: number) => void;
  readonly __wbg_get_vector3_y: (a: number) => number;
  readonly __wbg_set_vector3_y: (a: number, b: number) => void;
  readonly __wbg_get_vector3_z: (a: number) => number;
  readonly __wbg_set_vector3_z: (a: number, b: number) => void;
  readonly vector3_js_new: (a: number, b: number, c: number) => number;
  readonly vector3_set: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;

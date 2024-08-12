let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

const SimulationObjectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_simulationobject_free(ptr >>> 0));
/**
*/
export class SimulationObject {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SimulationObjectFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simulationobject_free(ptr);
    }
}

const UniverseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_universe_free(ptr >>> 0));
/**
*/
export class Universe {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Universe.prototype);
        obj.__wbg_ptr = ptr;
        UniverseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UniverseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_universe_free(ptr);
    }
    /**
    * @returns {Universe}
    */
    static new() {
        const ret = wasm.universe_new();
        return Universe.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get_next_handle() {
        const ret = wasm.universe_get_next_handle(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} handle
    */
    free_handle(handle) {
        wasm.universe_free_handle(this.__wbg_ptr, handle);
    }
    /**
    * @param {Vector3} pos
    * @param {Vector3} direction
    * @param {number} length
    * @returns {number}
    */
    add_straight_wire(pos, direction, length) {
        _assertClass(pos, Vector3);
        var ptr0 = pos.__destroy_into_raw();
        _assertClass(direction, Vector3);
        var ptr1 = direction.__destroy_into_raw();
        const ret = wasm.universe_add_straight_wire(this.__wbg_ptr, ptr0, ptr1, length);
        return ret >>> 0;
    }
    /**
    * @param {number} handle
    * @param {Vector3} position
    */
    set_object_position(handle, position) {
        _assertClass(position, Vector3);
        var ptr0 = position.__destroy_into_raw();
        wasm.universe_set_object_position(this.__wbg_ptr, handle, ptr0);
    }
    /**
    * @param {number} handle
    * @param {Vector3} direction
    */
    set_object_direction(handle, direction) {
        _assertClass(direction, Vector3);
        var ptr0 = direction.__destroy_into_raw();
        wasm.universe_set_object_direction(this.__wbg_ptr, handle, ptr0);
    }
    /**
    * @param {number} handle
    * @param {number} length
    */
    set_object_length(handle, length) {
        wasm.universe_set_object_length(this.__wbg_ptr, handle, length);
    }
    /**
    * @param {Vector3} p
    * @returns {Vector3}
    */
    compute_field(p) {
        _assertClass(p, Vector3);
        const ret = wasm.universe_compute_field(this.__wbg_ptr, p.__wbg_ptr);
        return Vector3.__wrap(ret);
    }
    /**
    */
    compute_record_points() {
        wasm.universe_compute_record_points(this.__wbg_ptr);
    }
    /**
    * @param {number} count
    */
    set_record_point_count(count) {
        wasm.universe_set_record_point_count(this.__wbg_ptr, count);
    }
    /**
    * @returns {number}
    */
    record_point_vectors_ptr() {
        const ret = wasm.universe_record_point_vectors_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    record_points_ptr() {
        const ret = wasm.universe_record_points_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    */
    compute_line(index) {
        wasm.universe_compute_line(this.__wbg_ptr, index);
    }
    /**
    */
    compute_lines() {
        wasm.universe_compute_lines(this.__wbg_ptr);
    }
    /**
    * @param {number} count
    */
    set_field_line_step_count(count) {
        wasm.universe_set_field_line_step_count(this.__wbg_ptr, count);
    }
    /**
    * @param {number} lines
    * @param {number} max_line_size
    */
    set_lines_count(lines, max_line_size) {
        wasm.universe_set_lines_count(this.__wbg_ptr, lines, max_line_size);
    }
    /**
    * @returns {number}
    */
    field_line_polarities_ptr() {
        const ret = wasm.universe_field_line_polarities_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    field_line_start_points_ptr() {
        const ret = wasm.universe_field_line_start_points_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    field_lines_ptr() {
        const ret = wasm.universe_field_lines_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const Vector3Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vector3_free(ptr >>> 0));
/**
*/
export class Vector3 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Vector3.prototype);
        obj.__wbg_ptr = ptr;
        Vector3Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Vector3Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vector3_free(ptr);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_vector3_x(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_vector3_x(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_vector3_y(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_vector3_y(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get z() {
        const ret = wasm.__wbg_get_vector3_z(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set z(arg0) {
        wasm.__wbg_set_vector3_z(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {Vector3}
    */
    static js_new(x, y, z) {
        const ret = wasm.vector3_js_new(x, y, z);
        return Vector3.__wrap(ret);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    set(x, y, z) {
        wasm.vector3_set(this.__wbg_ptr, x, y, z);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('magnetism_simulation_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;

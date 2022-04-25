import {Vector2} from 'three';
import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

export default {
    uniforms: {
        texture1: {type: 't', value: null},
        radius: {type: 'n', value: 0.2},
        pos: {type: 'v2', value: new Vector2(0.5)},
        aspect: {type: 'n', value: 1.0}
    },
    vertexShader: vertex,
    fragmentShader: fragment
};

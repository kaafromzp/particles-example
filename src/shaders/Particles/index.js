import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

export default {
    uniforms: {
        texture1: {type: 't', value: null},
        texture2: {type: 't', value: null},
        time: {type: 'f', value: 0.0},
        radius: {type: 'f', value: 0.5}
    },
    vertexShader: vertex,
    fragmentShader: fragment
};

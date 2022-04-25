import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

export default {
    uniforms: {
        texture1: {type: 't', value: null},
        time: {type: 'f', value: 0.0}
    },
    vertexShader: vertex,
    fragmentShader: fragment
};

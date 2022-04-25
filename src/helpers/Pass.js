import { MeshStandardMaterial } from 'three';
import { SphereBufferGeometry } from 'three';
import { PointLight } from 'three';
import {
    FogExp2,
    FloatType,
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    NearestFilter,
    DataTexture, 
    RGBAFormat, 
    WebGLRenderTarget,
    MeshBasicMaterial,
    Scene, 
    Mesh,
    Points,
    ShaderMaterial,
    TextureLoader
} from 'three';
import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import EmitterShader from '../shaders/Emitter';
import ParticlesShader from '../shaders/Particles';
class TestPass extends Pass {
    constructor(camera, width, height) {
        super();
        this.aplhaMap = new TextureLoader().load( 'assets/alphaMap.jpg' );
        this.heightMap = new TextureLoader().load( 'assets/heightMap.jpg' );
        this.camera = camera;
        this.width = width;
        this.height = height;
        this.cntr = false;
        const pars = {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: FloatType
        };

        this.target1 = new WebGLRenderTarget(
            width,
            height,
            pars
        );
        this.target2 = new WebGLRenderTarget(
            width,
            height,
            pars
        );
        this.emitterMaterial = new  ShaderMaterial({
            ...EmitterShader
        });
        this.fsQuadEmitter = new  FullScreenQuad(this.emitterMaterial);
        this.initScene();
        this.initTexture();
    }

    initScene() {
        // this.box = new Mesh(new BoxBufferGeometry(1, 1, 1), new MeshBasicMaterial({wireframe: true}));
        const geometry = new BufferGeometry();
        const vertices = new Float32Array(1024 * 1024 * 3).fill(0);

        const arr = [];
        for (let i = 0; i < 1024 * 1024; i += 1) {
            arr.push(i);
        }
        const uv = new Float32Array(arr);

        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        geometry.setAttribute('test', new BufferAttribute(uv, 1));
        this.particlesMaterial = new ShaderMaterial({...ParticlesShader, transparent: true});
        this.particles = new Points(geometry, this.particlesMaterial);
        this.particles.rotation.set(Math.PI/2,0, -Math.PI/8);
        this.light = new PointLight(0xffffff,0.7,0,2.0);
        this.light.position.set(1,1,1);
        this.light2 = new PointLight(0xffffff,0.7,0,2.0);
        this.light2.position.set(-1,1,1);
        this.sphere = new Mesh(new SphereBufferGeometry(0.5), new MeshStandardMaterial({color: 0x4444ff, roughness: 0.9, metalness: 0.5, transparent: false, opacity: 1.0}))

        this.scene = new Scene();
        // this.scene.add(this.box);
        this.scene.add(this.particles);
        this.scene.add(this.sphere);
        this.scene.add(this.light);
        this.scene.add(this.light2);
    }

    initTexture() {
        const width = 1024;
        const height = 1024;

        const size = width * height;
        const data = new Float32Array(4* size );

        for ( let i = 0; i < size; i +=16 ) {
            data[ i ] = Math.random();
            data[ i + 1 ] = Math.random();
            data[ i + 2 ] = Math.random();
            data[ i + 3 ] = 0; //lifetime

            data[ i + 4 ] = data[ i ];
            data[ i + 5 ] = data[ i + 1];
            data[ i + 6 ] = data[ i + 2];
            data[ i + 7 ] = Math.random();

            data[ i + 8 ] = Math.random();
            data[ i + 9 ] = Math.random();
            data[ i + 10 ] = Math.random();
            data[ i + 11 ] = Math.random();

            data[ i + 12 ] = Math.random();
            data[ i + 13 ] = Math.random();
            data[ i + 14 ] = Math.random();
            data[ i + 15 ] = Math.random();
        }

        this.texture = new DataTexture( data, width, height, RGBAFormat,FloatType );
        this.texture.needsUpdate = true;
    }

    initialRender (renderer) {
        const currentTarget = this.cntr ? this.target1: this.target2;
        this.cntr = !this.cntr;

        renderer.setRenderTarget( currentTarget);
        this.emitterMaterial.uniforms.texture1.value = this.texture;
        this.emitterMaterial.uniforms.time.value = 0.0;
        this.fsQuadEmitter.render(renderer);

        // renderer.setRenderTarget( null);
        // this.fsQuadEmitter.render(renderer);
    }

    render(renderer, writeBuffer, readBuffer, deltaTime) {
        const currentTarget = this.cntr ? this.target1: this.target2;
        const prevTarget = this.cntr ? this.target2: this.target1;
        this.cntr = !this.cntr;

        renderer.setSize(this.width,this.height);
        renderer.setRenderTarget(currentTarget);
        this.emitterMaterial.uniforms.texture1.value = prevTarget.texture
        this.emitterMaterial.uniforms.time.value = deltaTime;
        this.fsQuadEmitter.render(renderer);
        this.particlesMaterial.uniforms.texture1.value = this.aplhaMap || null;
        this.particlesMaterial.uniforms.texture2.value = this.heightMap || null;
        this.particlesMaterial.uniforms.time.value = deltaTime;
        this.particlesMaterial.uniforms.radius.value = 0.5;

        renderer.setRenderTarget(null);
        renderer.setSize(window.innerWidth,window.innerHeight);
        renderer.render(this.scene, this.camera);

    }
}
export default TestPass;

import {
    Clock,
    PerspectiveCamera,
    WebGLRenderer
} from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Pass from './helpers/Pass';
import WEBGL from './helpers/WebGL';

export default class Viewer3D {
    constructor() {
        this.WEBGLCheck();

        if (this.canvas && this.context) {
            this.init();
            this.animate();
        }
    }

    WEBGLCheck() {
        if (WEBGL.isWebGL2Available() === false) {
            if (WEBGL.isWebGLAvailable() === false) {
                document.body.appendChild(WEBGL.getWebGLErrorMessage());
            } else {
                // eslint-disable-next-line no-console
                console.log('webgl v1 is available');
                this.canvas = document.createElement('canvas');
                this.context = this.canvas.getContext('webgl', {antialias: true});
            }
        } else {
            // eslint-disable-next-line no-console
            console.log('webgl v2 is available');
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('webgl2', {antialias: true});
        }
    }

    initRenderer() {
        const renderer = new WebGLRenderer(this.canvas, this.context, {
            antialias: true,
            alpha: true
            // PhysicallyCorrectLights: true
        });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.autoClear = false;

        document.body.appendChild(renderer.domElement);

        this.renderer = renderer;
    }

    initComposer() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.pass = new Pass(this.camera, 1024, 1024);
        this.composer.addPass(this.pass);

        this.pass.initialRender(this.renderer);
    }

    initCamera() {
        this.camera = new PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1e-2,
            1e3
        );
        this.camera.position.set(0, 0, 2);
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
    }

    init() {
        this.initRenderer();
        this.initCamera();
        this.initControls();

        this.clock = new Clock(true);

        this.initComposer();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }, false);


    }

    animate(time) {
        // Console.log('animate');

        requestAnimationFrame((time) => this.animate(time));
        this.controls.update();
        this.render(time);
    }

    render(time) {
        this.composer.render(time);
    }
}

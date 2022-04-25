/**
 * @author alteredq / http://alteredqualia.com/
 */
import * as THREE from 'three';
THREE.EffectComposer = function(renderer, renderTarget) {
    this.renderer = renderer;

    if (renderTarget === undefined) {
        let parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };

        let size = renderer.getDrawingBufferSize(new THREE.Vector2());
        renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, parameters);
        renderTarget.texture.name = 'EffectComposer.rt1';
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.renderToScreen = true;

    this.passes = [];

    // Dependencies

    if (THREE.CopyShader === undefined) {
        console.error('THREE.EffectComposer relies on THREE.CopyShader');
    }

    if (THREE.ShaderPass === undefined) {
        console.error('THREE.EffectComposer relies on THREE.ShaderPass');
    }

    this.copyPass = new THREE.ShaderPass(THREE.CopyShader);

    this._previousFrameTime = Date.now();
};

Object.assign(THREE.EffectComposer.prototype, {
    swapBuffers() {
        let tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    },

    addPass(pass) {
        this.passes.push(pass);

        let size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
        pass.setSize(size.width, size.height);
    },

    insertPass(pass, index) {
        this.passes.splice(index, 0, pass);
    },

    isLastEnabledPass(passIndex) {
        for (let i = passIndex + 1; i < this.passes.length; i++) {
            if (this.passes[i].enabled) {
                return false;
            }
        }

        return true;
    },

    render(deltaTime) {
        // DeltaTime value is in seconds

        if (deltaTime === undefined) {
            deltaTime = (Date.now() - this._previousFrameTime) * 0.001;
        }

        this._previousFrameTime = Date.now();

        let currentRenderTarget = this.renderer.getRenderTarget();

        let maskActive = false;

        let pass,
            i,
            il = this.passes.length;

        for (i = 0; i < il; i++) {
            pass = this.passes[i];

            if (pass.enabled === false) {
                continue;
            }

            pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
            pass.render(
                this.renderer,
                this.writeBuffer,
                this.readBuffer,
                deltaTime,
                maskActive
            );

            if (pass.needsSwap) {
                if (maskActive) {
                    let context = this.renderer.context;

                    context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

                    this.copyPass.render(
                        this.renderer,
                        this.writeBuffer,
                        this.readBuffer,
                        deltaTime
                    );

                    context.stencilFunc(context.EQUAL, 1, 0xffffffff);
                }

                this.swapBuffers();
            }

            if (THREE.MaskPass !== undefined) {
                if (pass instanceof THREE.MaskPass) {
                    maskActive = true;
                } else if (pass instanceof THREE.ClearMaskPass) {
                    maskActive = false;
                }
            }
        }

        this.renderer.setRenderTarget(currentRenderTarget);
    },

    reset(renderTarget) {
        if (renderTarget === undefined) {
            let size = this.renderer.getDrawingBufferSize(new THREE.Vector2());

            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize(size.width, size.height);
        }

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
    },

    setSize(width, height) {
        this.renderTarget1.setSize(width, height);
        this.renderTarget2.setSize(width, height);

        for (let i = 0; i < this.passes.length; i++) {
            this.passes[i].setSize(width, height);
        }
    }
});

THREE.Pass = function() {
    // If set to true, the pass is processed by the composer
    this.enabled = true;

    // If set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;

    // If set to true, the pass clears its buffer before rendering
    this.clear = false;

    // If set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
    this.renderToScreen = false;
};

Object.assign(THREE.Pass.prototype, {
    setSize(width, height) {},

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        console.error('THREE.Pass: .render() must be implemented in derived pass.');
    }
});

// Helper for passes that need to fill the viewport with a single quad.
THREE.Pass.FullScreenQuad = (function() {
    let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let geometry = new THREE.PlaneBufferGeometry(2, 2);

    let FullScreenQuad = function(material) {
        this._mesh = new THREE.Mesh(geometry, material);
    };

    Object.defineProperty(FullScreenQuad.prototype, 'material', {
        get() {
            return this._mesh.material;
        },

        set(value) {
            this._mesh.material = value;
        }
    });

    Object.assign(FullScreenQuad.prototype, {
        render(renderer) {
            renderer.render(this._mesh, camera);
        }
    });

    return FullScreenQuad;
}());

THREE.CopyShader = {
    uniforms: {
        tDiffuse: {value: null},
        opacity: {value: 1.0}
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'
    ].join('\n'),

    fragmentShader: [
        'uniform float opacity;',

        'uniform sampler2D tDiffuse;',

        'varying vec2 vUv;',

        'void main() {',

        'vec4 texel = texture2D( tDiffuse, vUv );',
        'gl_FragColor = opacity * texel;',

        '}'
    ].join('\n')
};

THREE.RenderPass = function(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    THREE.Pass.call(this);

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
};

THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.RenderPass,

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        let oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        this.scene.overrideMaterial = this.overrideMaterial;

        let oldClearColor, oldClearAlpha;

        if (this.clearColor) {
            oldClearColor = renderer.getClearColor().getHex();
            oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(this.clearColor, this.clearAlpha);
        }

        if (this.clearDepth) {
            renderer.clearDepth();
        }

        renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
        // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
        if (this.clear) {
            renderer.clear(
                renderer.autoClearColor,
                renderer.autoClearDepth,
                renderer.autoClearStencil
            );
        }
        renderer.render(this.scene, this.camera);
        if (this.clearColor) {
            renderer.setClearColor(oldClearColor, oldClearAlpha);
        }

        this.scene.overrideMaterial = null;
        renderer.autoClear = oldAutoClear;
    }
});

THREE.ShaderPass = function(shader, textureID) {
    THREE.Pass.call(this);

    this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

    if (shader instanceof THREE.ShaderMaterial) {
        this.uniforms = shader.uniforms;

        this.material = shader;
    } else if (shader) {
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        this.material = new THREE.ShaderMaterial({
            defines: {...shader.defines},
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
    }

    this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);
};

THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.ShaderPass,

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        if (this.uniforms[this.textureID]) {
            this.uniforms[this.textureID].value = readBuffer.texture;
        }

        this.fsQuad.material = this.material;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
            if (this.clear) {
                renderer.clear(
                    renderer.autoClearColor,
                    renderer.autoClearDepth,
                    renderer.autoClearStencil
                );
            }
            this.fsQuad.render(renderer);
        }
    }
});

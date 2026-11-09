# Integration (three r162+, tested on r170)

Replace your `PropertySceneBuilder.ts` + `MaterialsLibrary.ts` with this folder.
`PropertySceneBuilder.buildProperty(id, scene)` keeps the same signature and `userData.id`s.
It also returns `interiorLights`.

```ts
import { configureRenderer, setupSkyAndSun, createPostFX } from './RealismKit';

const quality = configureRenderer(renderer);                   // auto: GPU sniffing -> 'high' | 'medium' | 'low'
const sky = setupSkyAndSun(renderer, scene, { preset: 'day', quality });
const fx  = createPostFX(renderer, scene, camera, w, h, { quality });   // raises camera.far to 4500 itself

const nodes = PropertySceneBuilder.buildProperty(propertyId, scene);
sky.setPreset('day', nodes.interiorLights);                    // after build ('day' | 'golden' | 'dusk')
await fx.warmup();                                             // async shader compile + texture bake -> no first-frame stall

// frame loop (replace renderer.render):
MaterialsLibrary.update(clock.elapsedTime);                    // animates water
fx.render();                                                   // adaptive: sheds AO / resolution if frame time > 27 ms
// resize: fx.setSize(w, h)        after moving a shadow caster: fx.invalidateShadows()
```

Performance design
- Textures bake in 5 ms slices (materials usable immediately); `await MaterialsLibrary.whenReady()` for a loader.
- Static meshes are merged per material; Manhattan is 2 draw calls (instanced, windows in shader).
- Shadow maps refresh ~6 Hz; AO starts OFF on medium/low and turns on only if frames are fast.
- Resolution is scaled down automatically when the GPU can't keep ~37 fps, and restored when it can.

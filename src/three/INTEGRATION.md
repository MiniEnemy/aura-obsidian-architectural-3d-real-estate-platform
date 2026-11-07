# Integration (three r162+, tested on r170)

Drop this folder over your existing `PropertySceneBuilder.ts` + `MaterialsLibrary.ts`.
`PropertySceneBuilder.buildProperty(id, scene)` has the same signature and returns the same
`SceneInteractiveNodes` fields (+ `interiorLights`). Interactive `userData.id`s are unchanged.

```ts
import { configureRenderer, setupSkyAndSun, createPostFX } from './RealismKit';

const quality = configureRenderer(renderer);                 // 'high' | 'medium' | 'low' auto-detected
const sky = setupSkyAndSun(renderer, scene, { preset: 'day', quality });
const fx  = createPostFX(renderer, scene, camera, w, h, { quality });

const nodes = PropertySceneBuilder.buildProperty(propertyId, scene);
sky.setPreset('day', nodes.interiorLights);                  // 'day' | 'golden' | 'dusk'

// frame loop (replace renderer.render):
MaterialsLibrary.update(clock.elapsedTime);                  // animates water
fx.render();
// resize: fx.setSize(w, h)
```
Camera `far` should be >= 600 (hills/skyline).

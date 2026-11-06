import * as THREE from 'three';
import { LightingMode } from '../types/property';

export class SkyboxGenerator {
  public scene: THREE.Scene;
  public sunLight: THREE.DirectionalLight;
  public fillLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;
  private skyMesh: THREE.Mesh;
  private starsParticles: THREE.Points;
  private poolLights: THREE.PointLight[] = [];
  private gardenLights: THREE.PointLight[] = [];
  public eaveDownlights: THREE.PointLight[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Ambient light - bright, warm architectural illumination
    this.ambientLight = new THREE.AmbientLight(0xfff6ec, 0.85);
    this.scene.add(this.ambientLight);

    // Primary Sun directional light positioned specifically to illuminate the front facade
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.sunLight.position.set(18, 32, 28);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -24;
    this.sunLight.shadow.camera.right = 24;
    this.sunLight.shadow.camera.top = 24;
    this.sunLight.shadow.camera.bottom = -24;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Soft secondary fill light from opposite angle to prevent harsh pitch-black shadows
    this.fillLight = new THREE.DirectionalLight(0xbcd7f5, 0.9);
    this.fillLight.position.set(-20, 20, -15);
    this.scene.add(this.fillLight);

    // Hemisphere light simulating sky dome bounce and grass ground bounce
    this.hemiLight = new THREE.HemisphereLight(0xe4f0fc, 0x4a5d3f, 0.85);
    this.scene.add(this.hemiLight);

    // Gradient Sky Dome
    const skyGeo = new THREE.SphereGeometry(150, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x629ad2
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Horizon haze ring
    const horizonGeo = new THREE.CylinderGeometry(148, 148, 40, 32, 1, true);
    const horizonMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0xd8eafc,
      transparent: true,
      opacity: 0.6
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.position.y = 15;
    this.scene.add(horizonMesh);

    // Starfield for night mode
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 142;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 6;
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.0
    });
    this.starsParticles = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starsParticles);

    // Pool underwater illumination point lights
    const poolLight = new THREE.PointLight(0x00e1ff, 2.0, 20);
    poolLight.position.set(0, -0.2, -11);
    this.poolLights.push(poolLight);
    this.scene.add(poolLight);

    // Architectural Garden and Facade Accent Spotlights
    const gLight1 = new THREE.PointLight(0xffdf99, 1.8, 16);
    gLight1.position.set(8, 1.2, 11);
    const gLight2 = new THREE.PointLight(0xffdf99, 1.8, 16);
    gLight2.position.set(-8, 1.2, 11);
    this.gardenLights.push(gLight1, gLight2);
    this.scene.add(gLight1, gLight2);

    // Recessed eave downlights projecting down the front facade
    for (const x of [-5, 0, 5]) {
      const eaveLight = new THREE.PointLight(0xffe8ba, 1.4, 8);
      eaveLight.position.set(x, 6.7, 9.8);
      this.eaveDownlights.push(eaveLight);
      this.scene.add(eaveLight);
    }

    // Default to bright daytime
    this.setMode('daytime');
  }

  public setMode(mode: LightingMode) {
    const skyMat = this.skyMesh.material as THREE.MeshBasicMaterial;
    const starMat = this.starsParticles.material as THREE.PointsMaterial;

    switch (mode) {
      case 'morning':
        this.sunLight.color.setHex(0xffdfaa);
        this.sunLight.intensity = 2.0;
        this.sunLight.position.set(28, 20, 22);
        this.fillLight.color.setHex(0xd6e5f7);
        this.fillLight.intensity = 0.8;
        this.ambientLight.color.setHex(0xfff1df);
        this.ambientLight.intensity = 0.8;
        this.hemiLight.color.setHex(0xffe6cb);
        this.hemiLight.groundColor.setHex(0x3e4a36);
        this.hemiLight.intensity = 0.8;
        skyMat.color.setHex(0x8eb9de);
        starMat.opacity = 0;
        this.scene.fog = new THREE.FogExp2(0xd6e7f8, 0.0035);
        this.poolLights.forEach((l) => (l.intensity = 1.0));
        this.gardenLights.forEach((l) => (l.intensity = 1.2));
        this.eaveDownlights.forEach((l) => (l.intensity = 1.0));
        break;

      case 'daytime':
        this.sunLight.color.setHex(0xfffaed);
        this.sunLight.intensity = 2.4;
        this.sunLight.position.set(16, 34, 26);
        this.fillLight.color.setHex(0xc5ddf7);
        this.fillLight.intensity = 0.95;
        this.ambientLight.color.setHex(0xfff8ee);
        this.ambientLight.intensity = 0.95;
        this.hemiLight.color.setHex(0xddeeff);
        this.hemiLight.groundColor.setHex(0x4a5d3f);
        this.hemiLight.intensity = 0.95;
        skyMat.color.setHex(0x5692ce);
        starMat.opacity = 0;
        this.scene.fog = new THREE.FogExp2(0xaad1f4, 0.002);
        this.poolLights.forEach((l) => (l.intensity = 1.4));
        this.gardenLights.forEach((l) => (l.intensity = 0.8));
        this.eaveDownlights.forEach((l) => (l.intensity = 0.8));
        break;

      case 'evening':
        this.sunLight.color.setHex(0xff8b3d);
        this.sunLight.intensity = 2.0;
        this.sunLight.position.set(-25, 14, 20);
        this.fillLight.color.setHex(0x9a729e);
        this.fillLight.intensity = 0.7;
        this.ambientLight.color.setHex(0x734a42);
        this.ambientLight.intensity = 0.65;
        this.hemiLight.color.setHex(0xffa066);
        this.hemiLight.groundColor.setHex(0x282330);
        this.hemiLight.intensity = 0.7;
        skyMat.color.setHex(0x4f3659);
        starMat.opacity = 0.3;
        this.scene.fog = new THREE.FogExp2(0x4f3659, 0.006);
        this.poolLights.forEach((l) => (l.intensity = 2.8));
        this.gardenLights.forEach((l) => (l.intensity = 2.5));
        this.eaveDownlights.forEach((l) => (l.intensity = 2.2));
        break;

      case 'night':
        this.sunLight.color.setHex(0x8eb6e5);
        this.sunLight.intensity = 0.65;
        this.sunLight.position.set(-10, 28, 18);
        this.fillLight.color.setHex(0x1a2942);
        this.fillLight.intensity = 0.4;
        this.ambientLight.color.setHex(0x242e42);
        this.ambientLight.intensity = 0.5;
        this.hemiLight.color.setHex(0x223652);
        this.hemiLight.groundColor.setHex(0x11161f);
        this.hemiLight.intensity = 0.5;
        skyMat.color.setHex(0x0c111c);
        starMat.opacity = 0.95;
        this.scene.fog = new THREE.FogExp2(0x0c111c, 0.007);
        this.poolLights.forEach((l) => (l.intensity = 3.8));
        this.gardenLights.forEach((l) => (l.intensity = 3.2));
        this.eaveDownlights.forEach((l) => (l.intensity = 2.8));
        break;
    }
  }
}

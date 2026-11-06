import * as THREE from 'three';

export class AvatarFigure extends THREE.Group {
  private bodyMesh: THREE.Group;

  constructor() {
    super();

    this.bodyMesh = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x333b45,
      metalness: 0.6,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85
    });

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.3
    });

    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 1.62;
    this.bodyMesh.add(head);

    // Halo / Rim ring
    const ringGeo = new THREE.TorusGeometry(0.13, 0.015, 8, 24);
    const ring = new THREE.Mesh(ringGeo, bronzeMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.62;
    this.bodyMesh.add(ring);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.65, 12);
    const torso = new THREE.Mesh(torsoGeo, mat);
    torso.position.y = 1.15;
    this.bodyMesh.add(torso);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.75, 12);
    const leftLeg = new THREE.Mesh(legGeo, mat);
    leftLeg.position.set(-0.1, 0.42, 0);
    const rightLeg = new THREE.Mesh(legGeo, mat);
    rightLeg.position.set(0.1, 0.42, 0);
    this.bodyMesh.add(leftLeg, rightLeg);

    // Base pedestal ring
    const baseGeo = new THREE.RingGeometry(0.25, 0.28, 32);
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.02;
    this.bodyMesh.add(base);

    this.add(this.bodyMesh);
  }

  public updateDirection(yaw: number) {
    this.bodyMesh.rotation.y = yaw;
  }
}

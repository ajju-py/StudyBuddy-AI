import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FallbackScene } from './FallbackScene';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const KnowledgeSphereScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setPrefersReducedMotion(true);
      return;
    }

    // Check WebGL availability
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Central Knowledge Sphere Group
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Outer Geometric Wireframe (Knowledge Cage)
    const outerGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    sphereGroup.add(outerMesh);

    // Inner Glowing Core (Cognitive Core)
    const innerGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.5,
      flatShading: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    sphereGroup.add(innerMesh);

    // Innermost Dense Spark
    const sparkGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sphereGroup.add(sparkMesh);

    // 4. Orbiting Particle Constellation
    const particleCount = 240;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Distribute evenly in a spherical shell (r between 2.8 and 4.2)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 1.4;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      particleSizes[i] = Math.random() * 2 + 1;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4.0, 20);
    cyanLight.position.set(5, 4, 4);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3.5, 20);
    violetLight.position.set(-5, -4, 2);
    scene.add(violetLight);

    // 6. Interactive Mouse Movement
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow (LERP)
      targetRotationY += (mouseX * 0.8 - targetRotationY) * 0.05;
      targetRotationX += (mouseY * 0.8 - targetRotationX) * 0.05;

      // Rotate Knowledge Sphere
      sphereGroup.rotation.y = elapsedTime * 0.25 + targetRotationY;
      sphereGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + targetRotationX;

      // Inner Core counter-rotation & subtle pulse
      innerMesh.rotation.y = -elapsedTime * 0.4;
      innerMesh.rotation.z = elapsedTime * 0.2;
      const pulseScale = 1.0 + Math.sin(elapsedTime * 2.0) * 0.06;
      innerMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Rotate Particle Cloud
      particlePoints.rotation.y = -elapsedTime * 0.1;
      particlePoints.rotation.x = Math.cos(elapsedTime * 0.08) * 0.1;

      // Subtle float
      sphereGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.12;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [hasWebGL, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <FallbackScene reason="Reduced motion mode enabled" />;
  }

  if (!hasWebGL) {
    return <FallbackScene reason="WebGL unavailable on this device" />;
  }

  return (
    <div className="relative w-full h-[360px] md:h-[480px] flex items-center justify-center overflow-hidden">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle interaction tip overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-400/60 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/20">
          Interactive 3D Knowledge Core • Hover / Drag to explore
        </span>
      </div>
    </div>
  );
};

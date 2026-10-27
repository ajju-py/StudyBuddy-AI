import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Network, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
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

interface ConceptNodeData {
  id: number;
  name: string;
  category: string;
  description: string;
  coords: [number, number, number];
  color: number;
  connectedTo: number[]; // indices of connected nodes
}

const NODES_DATA: ConceptNodeData[] = [
  {
    id: 0,
    name: 'Data Structures',
    category: 'Foundations',
    description: 'Arrays, Trees, Graphs, and Hash Maps forming memory abstractions.',
    coords: [-2.2, 0.8, 0.2],
    color: 0x1E3A5F,
    connectedTo: [1, 5],
  },
  {
    id: 1,
    name: 'Algorithms',
    category: 'Core Theory',
    description: 'Divide-and-conquer, dynamic programming, and complexity analysis.',
    coords: [-0.6, 1.6, 0.5],
    color: 0xC25E34,
    connectedTo: [7],
  },
  {
    id: 2,
    name: 'Architecture',
    category: 'Hardware Systems',
    description: 'ALU, pipeline hazard resolution, and memory hierarchies.',
    coords: [-2.0, -1.2, -0.4],
    color: 0x57534E,
    connectedTo: [3],
  },
  {
    id: 3,
    name: 'Operating Systems',
    category: 'Systems Software',
    description: 'Process scheduling, virtual memory paging, and concurrency locks.',
    coords: [-0.4, -0.7, 0.3],
    color: 0x1E3A5F,
    connectedTo: [4, 6],
  },
  {
    id: 4,
    name: 'Networks',
    category: 'Communications',
    description: 'TCP/IP socket flow, routing tables, and congestion avoidance.',
    coords: [1.2, -1.3, -0.3],
    color: 0x57534E,
    connectedTo: [6],
  },
  {
    id: 5,
    name: 'Databases',
    category: 'Data & Storage',
    description: 'B+ Tree indexing, ACID transactions, and normalization forms.',
    coords: [0.9, 0.6, -0.5],
    color: 0x2D5A43,
    connectedTo: [6],
  },
  {
    id: 6,
    name: 'Distributed Systems',
    category: 'Advanced Systems',
    description: 'Raft consensus, CAP theorem, and fault-tolerant replication.',
    coords: [2.3, -0.4, 0.4],
    color: 0xC25E34,
    connectedTo: [],
  },
  {
    id: 7,
    name: 'Machine Learning',
    category: 'AI & Analytics',
    description: 'Gradient descent, backpropagation, and transformer attention.',
    coords: [1.8, 1.7, 0.2],
    color: 0x1E3A5F,
    connectedTo: [],
  },
];

interface KnowledgeSphereSceneProps {
  onSelectConcept?: (conceptName: string) => void;
}

export const KnowledgeSphereScene: React.FC<KnowledgeSphereSceneProps> = ({ onSelectConcept }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ConceptNodeData | null>(NODES_DATA[1]); // Default Algorithms

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setPrefersReducedMotion(true);
      return;
    }

    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 380;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF9F8F6);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Graph Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // 5. Construct Nodes & Edges
    const nodeMeshes: THREE.Mesh[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.24, 24, 24);

    NODES_DATA.forEach((node) => {
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.3,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(...node.coords);
      mesh.userData = { nodeData: node };
      graphGroup.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Construct Edges
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xD5D1C4,
      transparent: true,
      opacity: 0.8,
      linewidth: 1,
    });

    NODES_DATA.forEach((node) => {
      node.connectedTo.forEach((targetIdx) => {
        const targetNode = NODES_DATA[targetIdx];
        if (!targetNode) return;

        const points = [
          new THREE.Vector3(...node.coords),
          new THREE.Vector3(...targetNode.coords),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        graphGroup.add(line);
      });
    });

    // 6. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getPointerCoords = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (e: MouseEvent) => {
      getPointerCoords(e);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hovered = intersects[0].object.userData.nodeData as ConceptNodeData;
        setSelectedNode(hovered);
      } else {
        container.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      getPointerCoords(e);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const clicked = intersects[0].object.userData.nodeData as ConceptNodeData;
        setSelectedNode(clicked);
        onSelectConcept?.(clicked.name);
      }
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('click', handleClick);

    // 7. Resize Listener
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Subtle Restrained Animation
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle, restrained orbital sway (not endless rapid spinning)
      graphGroup.rotation.y = Math.sin(elapsed * 0.15) * 0.25;
      graphGroup.rotation.x = Math.cos(elapsed * 0.1) * 0.1;

      // Pulse selected node
      nodeMeshes.forEach((mesh) => {
        const data = mesh.userData.nodeData as ConceptNodeData;
        if (selectedNode && data.id === selectedNode.id) {
          const pulse = 1.15 + Math.sin(elapsed * 4.0) * 0.05;
          mesh.scale.set(pulse, pulse, pulse);
        } else {
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      sphereGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, [hasWebGL, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <FallbackScene reason="Reduced motion preference active" onSelectConcept={onSelectConcept} />;
  }

  if (!hasWebGL) {
    return <FallbackScene reason="WebGL unavailable" onSelectConcept={onSelectConcept} />;
  }

  return (
    <div className="surface-card rounded-xl border border-[#E5E2D9] overflow-hidden flex flex-col md:flex-row">
      {/* 3D Visual Canvas */}
      <div className="relative flex-1 h-[280px] sm:h-[340px] md:h-[400px] bg-[#F9F8F6]">
        <div ref={mountRef} className="w-full h-full" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-[#E5E2D9] px-2.5 py-1 rounded text-[11px] font-mono text-[#57534E] flex items-center gap-1.5 shadow-xs">
          <Network className="w-3.5 h-3.5 text-[#C25E34]" />
          <span>Curriculum Topology (Click nodes to inspect)</span>
        </div>
      </div>

      {/* Concept Inspector HUD */}
      <div className="w-full md:w-80 p-5 bg-[#FDFCFB] border-t md:border-t-0 md:border-l border-[#E5E2D9] flex flex-col justify-between space-y-4">
        {selectedNode ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
                {selectedNode.category}
              </span>
              <h4 className="text-lg font-bold text-[#18181B] font-serif-title">
                {selectedNode.name}
              </h4>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              {selectedNode.description}
            </p>

            {selectedNode.connectedTo.length > 0 && (
              <div className="pt-2 border-t border-[#E5E2D9] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8C877D] tracking-wider">
                  Prerequisites / Feeds Into:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.connectedTo.map((idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5F3ED] text-[#18181B] border border-[#E5E2D9]"
                    >
                      {NODES_DATA[idx]?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[#8C877D] italic">
            Hover or click any node in the constellation to inspect its academic curriculum connections.
          </div>
        )}

        <div className="pt-2">
          {selectedNode && onSelectConcept && (
            <button
              onClick={() => onSelectConcept(selectedNode.name)}
              className="w-full py-2 px-3 rounded-lg btn-terracotta text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Study Topic with AI Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

<template>
  <div class="xingxing-container">
    <div id="canvas-container" ref="canvasContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import xingXingTexture from '../assets/xingxing.png';

// Reactive references
const canvasContainer = ref(null);

// Scene variables
let scene, camera, renderer, monkeyMesh;
let isDragging = false;
let draggedObject = null;
let dragControls, orbitControls;
let clock, lastElapsedTime = 0;
let originalVertices = [];
let squishFactor = 0.3;
let velocity = new THREE.Vector3(0, 0, 0);
let gravity = new THREE.Vector3(0, -0.01, 0);
let trees = [];
let clouds = [];
let mountains = [];
let isActive = true; // To control animation when component is active

// Create the monkey
const createMonkey = () => {
  // Create a slightly stretched, rounded box for monkey-like shape
  const geometry = new RoundedBoxGeometry(1.2, 1.3, 1.0, 8, 0.4);
  
  // Store original vertices for physics calculations
  originalVertices = geometry.attributes.position.array.slice();
  
  // Load the texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(xingXingTexture, (texture) => {
    // Once texture is loaded, we can add the monkey to the scene
    console.log("Xing Xing texture loaded successfully");
  });
  
  // Create a material with the texture
  const material = new THREE.MeshPhongMaterial({ 
    map: texture,
    specular: 0x333333,
    shininess: 15,
    bumpScale: 0.05
  });
  
  monkeyMesh = new THREE.Mesh(geometry, material);
  monkeyMesh.position.set(0, 1, 0);
  
  // Add simple ears to the monkey
  const earGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  const earMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B4513,
    specular: 0x111111,
    shininess: 5
  });
  
//   const leftEar = new THREE.Mesh(earGeometry, earMaterial);
//   leftEar.scale.set(0.4, 0.4, 0.2);
//   leftEar.position.set(-0.6, 0.6, 0);
//   monkeyMesh.add(leftEar);
  
//   const rightEar = new THREE.Mesh(earGeometry, earMaterial);
//   rightEar.scale.set(0.4, 0.4, 0.2);
//   rightEar.position.set(0.6, 0.6, 0);
//   monkeyMesh.add(rightEar);
  
  // Add simple eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  
//   const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
//   leftEye.position.set(-0.3, 0.3, 0.5);
//   monkeyMesh.add(leftEye);
  
//   const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
//   rightEye.position.set(0.3, 0.3, 0.5);
//   monkeyMesh.add(rightEye);
  
  scene.add(monkeyMesh);
};

// Create Tibetan jungle environment
const createTibetanJungle = () => {
  // Create mountains in the background
  createMountains();
  
  // Create trees
  createTrees();
  
  // Create clouds
  createClouds();
  
  // Create terrain/ground
  createTerrain();
  
  // Create ambient fog for atmosphere
  scene.fog = new THREE.FogExp2(0xC9DF8A, 0.01);
};

// Create mountains
const createMountains = () => {
  const mountainGeometry = new THREE.ConeGeometry(8, 12, 4);
  const mountainMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B7355, // Brownish color for mountains
    flatShading: true
  });
  
  // Create multiple mountains at different positions
  for (let i = 0; i < 8; i++) {
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    const scale = 1 + Math.random() * 2;
    mountain.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
    
    const distance = 15 + Math.random() * 10;
    const angle = (i / 8) * Math.PI * 2;
    mountain.position.x = Math.sin(angle) * distance;
    mountain.position.z = Math.cos(angle) * distance;
    mountain.position.y = -2 - mountain.scale.y * 2;
    
    // Add snow caps
    const snowCapGeometry = new THREE.ConeGeometry(1, 2, 4);
    const snowMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
    snowCap.position.y = 5;
    snowCap.scale.set(0.8, 0.3, 0.8);
    mountain.add(snowCap);
    
    scene.add(mountain);
    mountains.push(mountain);
  }
};

// Create trees
const createTrees = () => {
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
  const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  
  const leafGeometry = new THREE.ConeGeometry(1, 2, 8);
  const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  
  // Create multiple trees at random positions
  for (let i = 0; i < 30; i++) {
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    // Position trees in a circular area around the center
    const distance = 4 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    trunk.position.x = Math.sin(angle) * distance;
    trunk.position.z = Math.cos(angle) * distance;
    trunk.position.y = -2 + trunk.geometry.parameters.height / 2;
    
    // Create leaves for the tree
    const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
    leaves.position.y = trunk.geometry.parameters.height / 2 + 0.5;
    trunk.add(leaves);
    
    // Add another smaller cone for layered look
    const topLeaves = new THREE.Mesh(leafGeometry, leafMaterial);
    topLeaves.position.y = leaves.position.y + 0.8;
    topLeaves.scale.set(0.6, 0.6, 0.6);
    trunk.add(topLeaves);
    
    scene.add(trunk);
    trees.push(trunk);
  }
};

// Create clouds
const createClouds = () => {
  const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
  const cloudMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.8
  });
  
  // Create several cloud clusters
  for (let i = 0; i < 10; i++) {
    const cloudCluster = new THREE.Group();
    
    // Position clouds high in the sky
    const distance = 15 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    cloudCluster.position.x = Math.sin(angle) * distance;
    cloudCluster.position.y = 10 + Math.random() * 5;
    cloudCluster.position.z = Math.cos(angle) * distance;
    
    // Create multiple spheres for each cloud cluster
    const numPuffs = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < numPuffs; j++) {
      const cloudPuff = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudPuff.position.x = Math.random() * 2 - 1;
      cloudPuff.position.y = Math.random() * 0.5;
      cloudPuff.position.z = Math.random() * 2 - 1;
      cloudPuff.scale.set(
        0.5 + Math.random() * 0.5,
        0.4 + Math.random() * 0.3,
        0.5 + Math.random() * 0.5
      );
      cloudCluster.add(cloudPuff);
    }
    
    scene.add(cloudCluster);
    clouds.push(cloudCluster);
  }
};

// Create terrain
const createTerrain = () => {
  // Create green jungle floor
  const groundGeometry = new THREE.CircleGeometry(20, 32);
  const groundMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x556B2F, // Dark olive green
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  scene.add(ground);
  
  // Add some rocks
  const rockGeometry = new THREE.DodecahedronGeometry(0.5);
  const rockMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x808080,
    flatShading: true
  });
  
  for (let i = 0; i < 15; i++) {
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.scale.set(
      0.3 + Math.random() * 0.7,
      0.2 + Math.random() * 0.5,
      0.3 + Math.random() * 0.7
    );
    
    const distance = 3 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    rock.position.x = Math.sin(angle) * distance;
    rock.position.z = Math.cos(angle) * distance;
    rock.position.y = -2 + rock.scale.y * 0.5;
    rock.rotation.y = Math.random() * Math.PI;
    
    scene.add(rock);
  }
  
  // Add some grass tufts
  const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x7CFC00 });
  
  for (let i = 0; i < 200; i++) {
    const height = 0.1 + Math.random() * 0.3;
    const grassGeometry = new THREE.ConeGeometry(0.05, height, 5);
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    
    const distance = Math.random() * 15;
    const angle = Math.random() * Math.PI * 2;
    grass.position.x = Math.sin(angle) * distance;
    grass.position.z = Math.cos(angle) * distance;
    grass.position.y = -2 + height / 2;
    
    grass.rotation.y = Math.random() * Math.PI;
    grass.rotation.x = Math.random() * 0.2;
    
    scene.add(grass);
  }
};

// Apply squish effect to the mesh
const applySquish = (mesh, factor) => {
  const positionAttribute = mesh.geometry.attributes.position;
  const positions = positionAttribute.array;
  
  for (let i = 0; i < positions.length; i += 3) {
    const originalY = originalVertices[i + 1];
    
    // Apply squish effect (flatten vertically, expand horizontally)
    positions[i] = originalVertices[i] * (1 + factor * (1 - Math.abs(originalY) / 1.5));
    positions[i + 1] = originalY * (1 - factor * 0.3);
    positions[i + 2] = originalVertices[i + 2] * (1 + factor * (1 - Math.abs(originalY) / 1.5));
  }
  
  positionAttribute.needsUpdate = true;
};

// Gradually restore original shape
const restoreShape = () => {
  if (!monkeyMesh) return;
  
  const positionAttribute = monkeyMesh.geometry.attributes.position;
  const positions = positionAttribute.array;
  
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = originalVertices[i];
    positions[i + 1] = originalVertices[i + 1];
    positions[i + 2] = originalVertices[i + 2];
  }
  
  positionAttribute.needsUpdate = true;
};

// Handle window resize
const onWindowResize = () => {
  if (!canvasContainer.value || !renderer || !camera) return;
  
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// Animation loop
const animate = () => {
  if (!isActive) return;
  
  requestAnimationFrame(animate);
  
  if (!clock) return;
  
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;
  
  // Animate clouds
  clouds.forEach((cloud, index) => {
    cloud.position.x += Math.sin(elapsedTime * 0.1 + index) * 0.01;
    cloud.position.y += Math.cos(elapsedTime * 0.05 + index * 0.5) * 0.005;
  });
  
  // Animate trees slightly swaying in the wind
  trees.forEach((tree, index) => {
    tree.rotation.z = Math.sin(elapsedTime * 0.5 + index * 0.3) * 0.02;
  });
  
  if (!isDragging && monkeyMesh) {
    // Apply gravity
    velocity.add(gravity);
    
    // Update position
    monkeyMesh.position.add(velocity);
    
    // Floor collision
    if (monkeyMesh.position.y < -2 + 0.65) { // half of height
      monkeyMesh.position.y = -2 + 0.65;
      
      // Bounce with damping
      velocity.y = -velocity.y * 0.6;
      
      // Apply horizontal friction
      velocity.x *= 0.95;
      velocity.z *= 0.95;
      
      // Apply squish effect on impact
      if (velocity.y < -0.05) {
        applySquish(monkeyMesh, Math.min(Math.abs(velocity.y) * 2, squishFactor));
        
        // Gradually restore shape
        setTimeout(restoreShape, 300);
      }
    }
    
    // Apply slow rolling friction
    if (Math.abs(velocity.y) < 0.01 && monkeyMesh.position.y <= -2 + 0.65 + 0.01) {
      velocity.x *= 0.97;
      velocity.z *= 0.97;
    }
    
    // Wobble effect when moving
    if (velocity.length() > 0.01) {
      const wobble = Math.sin(elapsedTime * 10) * 0.05 * velocity.length();
      applySquish(monkeyMesh, wobble);
    }
  }
  
  if (orbitControls) orbitControls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
};

// Initialize the Three.js scene
const initScene = async () => {
  // Make sure the canvasContainer is mounted
  await nextTick();
  
  const container = canvasContainer.value;
  if (!container) {
    console.error('Canvas container not found');
    return;
  }
  
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue background
  
  // Add sky gradient
  scene.fog = new THREE.Fog(0x87CEEB, 20, 100); // Foggy effect for depth
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Add directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffaa, 1);
  sunLight.position.set(5, 10, 7);
  sunLight.castShadow = true;
  
  // Improve shadow quality
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  
  scene.add(sunLight);
  
  // Create camera
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 1, 5);
  
  // Create renderer with shadows
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Clear previous canvas if exists
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  container.appendChild(renderer.domElement);
  
  // Create the Tibetan jungle environment
  createTibetanJungle();
  
  // Create the monkey mesh
  createMonkey();
  
  // Set up controls
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  
  const objects = [monkeyMesh];
  dragControls = new DragControls(objects, camera, renderer.domElement);
  
  dragControls.addEventListener('dragstart', (event) => {
    orbitControls.enabled = false;
    isDragging = true;
    draggedObject = event.object;
    velocity.set(0, 0, 0); // Reset velocity when grabbed
  });
  
  dragControls.addEventListener('drag', (event) => {
    // Apply squish effect during dragging
    applySquish(event.object, 0.6);
  });
  
  dragControls.addEventListener('dragend', (event) => {
    orbitControls.enabled = true;
    isDragging = false;
    draggedObject = null;
    
    // Give the object some velocity based on mouse movement
    velocity.set(
      Math.random() * 0.1 - 0.05,
      Math.random() * 0.1,
      Math.random() * 0.1 - 0.05
    );
    
    // Restore shape gradually
    restoreShape();
  });
  
  // Initialize the clock
  clock = new THREE.Clock();
  
  // Start the animation loop
  animate();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  console.log("Tibetan jungle scene initialized successfully");
};

// Method to clean up resources
const cleanup = () => {
  isActive = false; // Stop animation
  
  window.removeEventListener('resize', onWindowResize);
  
  // Clean up resources
  if (renderer) {
    const container = canvasContainer.value;
    if (container && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    renderer.dispose();
  }
  
  if (monkeyMesh) {
    monkeyMesh.geometry.dispose();
    monkeyMesh.material.dispose();
  }
  
  // Clean up all the objects
  scene?.traverse(object => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
  
  // Clear arrays
  trees.length = 0;
  clouds.length = 0;
  mountains.length = 0;
};

// Lifecycle hooks
onMounted(() => {
  console.log("Xing Xing 3D component mounted");
  isActive = true;
  initScene();
});

onBeforeUnmount(() => {
  console.log("Xing Xing 3D component unmounting");
  cleanup();
});
</script>

<style scoped>
.xingxing-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  background: #000;
}

#canvas-container {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}
</style>
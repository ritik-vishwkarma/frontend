import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";

// Use a different image source that's more reliable
const topPosts = [
  {
    id: "1",
    image: "https://picsum.photos/id/1/150",
    likes: 10000,
    comments: 500,
    caption: "Amazing sunset view!",
  },
  {
    id: "2",
    image: "https://picsum.photos/id/2/150",
    likes: 9500,
    comments: 450,
    caption: "Delicious food at its best!",
  },
  {
    id: "3",
    image: "https://picsum.photos/id/3/150",
    likes: 9000,
    comments: 600,
    caption: "Workout motivation!",
  },
  {
    id: "4",
    image: "https://picsum.photos/id/4/150",
    likes: 8700,
    comments: 400,
    caption: "Exploring new places!",
  },
  {
    id: "5",
    image: "https://picsum.photos/id/5/150",
    likes: 8500,
    comments: 350,
    caption: "Tech gadgets are love!",
  },
];

// Create a custom 3D Post component that handles errors
const Post3D = ({ position, imageUrl }: { position: [number, number, number]; imageUrl: string }) => {
  const [hasError, setHasError] = useState(false);
  
  // Use a fallback colored box if image fails to load
  if (hasError) {
    return (
      <Box position={position} args={[1.5, 1.5, 0.1]} castShadow>
        <meshStandardMaterial color={`hsl(${position[0] * 60}, 100%, 70%)`} />
      </Box>
    );
  }
  
  function useLoader(TextureLoader: typeof THREE.TextureLoader, imageUrl: string): THREE.Texture | null {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
      const loader = new TextureLoader();
      loader.load(
        imageUrl,
        (loadedTexture) => setTexture(loadedTexture),
        undefined,
        () => setTexture(null) // Handle errors by setting texture to null
      );
    }, [TextureLoader, imageUrl]);

    return texture;
  }

  return (
    <mesh position={position} scale={1.5}>
      {/* Use a simple plane with a texture instead of the Drei Image component */}
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial>
        <primitive
          attach="map"
          object={useLoader(THREE.TextureLoader, imageUrl) ?? new THREE.Texture()}
          onUpdate={(self: THREE.Texture) => {
        if (!self.image) setHasError(true);
          }}
        />
      </meshBasicMaterial>
    </mesh>
  );
};

const PostPerformance = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-900">
      <h1 className="text-3xl font-bold text-white text-center col-span-2 mb-6">
        Post Performance Analysis
      </h1>
      
      {/* Top Engaging Posts - Card View */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">Top 5 Most Engaging Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topPosts.map((post) => (
            <div key={post.id} className="bg-gray-900 p-4 rounded-lg shadow-md">
              {/* Use img tag with error handling for the grid view */}
              <div className="aspect-square bg-gray-700 rounded-md overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.caption} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/${Math.floor(Math.random()*999999).toString(16)}/ffffff?text=Post+${post.id}`;
                  }}
                />
              </div>
              <p className="text-white mt-2 font-semibold">❤️ {post.likes} | 💬 {post.comments}</p>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.caption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Post Visualization - Using Custom Component */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg col-span-2 md:col-span-1">
        <h2 className="text-xl font-bold text-white mb-4">3D Post Performance</h2>
        <div style={{ height: "300px" }} className="relative">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <spotLight position={[0, 5, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

            {/* Use colorful boxes instead of images for better reliability */}
            {topPosts.map((post, index) => (
              <Box 
                key={post.id}
                position={[
                  Math.cos(index * Math.PI * 0.4) * 2, 
                  Math.sin(index * Math.PI * 0.4) * 2, 
                  0
                ]}
                args={[1.4, 1.4, 0.1 + (post.likes / 20000)]} // Height based on likes
                castShadow
              >
                <meshStandardMaterial color={`hsl(${index * 70}, 100%, 70%)`} />
              </Box>
            ))}
          </Canvas>
          
          <div className="absolute bottom-2 left-0 right-0 text-center text-gray-400 text-sm">
            Box height represents engagement level
          </div>
        </div>
      </div>
      
      {/* Engagement Analysis */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg col-span-2 md:col-span-1">
        <h2 className="text-xl font-bold text-white mb-4">Engagement Analysis</h2>
        <div className="space-y-4">
          {topPosts.map((post) => {
            const engagementRate = ((post.likes + post.comments) / 10000 * 100).toFixed(1);
            return (
              <div key={`analysis-${post.id}`} className="bg-gray-900 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">Post #{post.id}</span>
                  <span className="text-blue-400">{engagementRate}% engagement</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500" 
                    style={{ width: `${engagementRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Likes: {post.likes}</span>
                  <span>Comments: {post.comments}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PostPerformance;
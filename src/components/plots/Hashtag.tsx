import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useState, useEffect } from "react";
import { fetchHashtagData, HashtagCount } from "@/db";

const HashtagWordCloud = () => {
  const [hashtagData, setHashtagData] = useState<HashtagCount[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHashtagData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Now using the centralized function from db/index.ts
        const hashtagCounts = await fetchHashtagData();

        // Set the processed data
        setHashtagData(hashtagCounts);
      } catch (err) {
        console.error("Error fetching hashtag data:", err);
        setError("Failed to load hashtag data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHashtagData();
  }, []);

  return (
    <div className="w-full h-screen p-6">
      {/* Title and container */}
      <div className="flex justify-center mb-10">
        <div className="relative inline-block">
          <h1 className="text-3xl font-bold text-center text-white relative z-10 px-10 py-3">
            Instagram Hashtag Analysis
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl transform -rotate-1 z-0"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transform rotate-1 z-0"></div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span className="text-white">Loading hashtag data...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-900/50 p-4 rounded-lg mb-6 text-center">
          <p className="text-red-200">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white text-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main content - only show when data is loaded and no errors */}
      {!loading && !error && hashtagData.length > 0 && (
        <div className="bg-gray-950 p-6 rounded-xl shadow-lg mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-4">Top 10 Hashtags by Usage</h2>

          {/* 3D Word Cloud */}
          <div style={{ height: "500px" }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <fog attach="fog" args={["#202040", 5, 30]} />

              {hashtagData.map((tag, i) => {
                // Adjust the layout for more hashtags
                // For 10 hashtags, we can use dual rings to avoid overcrowding

                // Determine which ring this hashtag belongs to (inner or outer)
                const isInnerRing = i < 5;

                // Calculate position based on ring and position within that ring
                const ringIndex = isInnerRing ? i : i - 5;
                const itemsInRing = isInnerRing ? Math.min(5, hashtagData.length) : hashtagData.length - 5;
                const angle = (ringIndex / itemsInRing) * Math.PI * 2;

                // Inner ring is closer to center
                const radius = isInnerRing ? 6 : 10;
                const x = Math.sin(angle) * radius;
                const y = Math.cos(angle) * radius;

                // Scale the size based on count - use relative scaling based on max count
                const maxCount = Math.max(...hashtagData.map(t => t.count));
                const minSize = 0.8;  // Slightly smaller for more hashtags
                const maxSize = 2.5;  // Slightly smaller max size
                const size = minSize + ((tag.count / maxCount) * (maxSize - minSize));

                return (
                  <group key={tag.hashtag} position={[x, y, 0]}>
                    {hovered === tag.hashtag && (
                      <group>
                        <Text
                          position={[0, 0.8, 0]}
                          fontSize={0.7}
                          color="yellow"
                        >
                          {`#${i + 1}`}
                        </Text>
                      </group>
                    )}
                    <Text
                      color={hovered === tag.hashtag ? "yellow" : `hsl(${i * 36}, 100%, 70%)`}
                      fontSize={size}
                      maxWidth={10}
                      lineHeight={1}
                      letterSpacing={0.02}
                      textAlign="center"
                      onPointerOver={() => setHovered(tag.hashtag)}
                      onPointerOut={() => setHovered(null)}
                    >
                      {tag.hashtag}
                    </Text>
                  </group>
                );
              })}
            </Canvas>
          </div>

          {/* Instructions */}
          <p className="text-gray-400 text-sm mt-4 text-center">
            Hover over hashtags to see rank. Drag to rotate the view.
          </p>
        </div>
      )}

      {/* No hashtags found message */}
      {!loading && !error && hashtagData.length === 0 && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-white mb-4">No Hashtags Found</h2>
          <p className="text-gray-400">
            No hashtags were found in the analyzed posts. Try analyzing content with hashtags.
          </p>
        </div>
      )}
    </div>
  );
};

export default HashtagWordCloud;
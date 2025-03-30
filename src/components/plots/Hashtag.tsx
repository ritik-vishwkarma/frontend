import { useState, useEffect } from "react";
import { fetchHashtagData, HashtagCount } from "@/db";

const HashtagWordCloud = () => {
  const [hashtagData, setHashtagData] = useState<HashtagCount[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'cloud'>('grid');

  useEffect(() => {
    const loadHashtagData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Only fetch exactly 10 hashtags to ensure fixed layout
        const hashtagCounts = await fetchHashtagData(10);
        // Slice to ensure we only have 10 tags maximum
        setHashtagData(hashtagCounts.slice(0, 10));
      } catch (err) {
        console.error("Error fetching hashtag data:", err);
        setError("Failed to load hashtag data.");
      } finally {
        setLoading(false);
      }
    };

    loadHashtagData();
  }, []);

  return (
    <div className="w-full p-6">
      {/* Centered title */}
      <div className="flex justify-center mb-10">
        <div className="relative inline-block">
          <h1 className="text-3xl font-bold text-center text-white relative z-10 px-10 py-3">
            Instagram Hashtag Analysis
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl transform -rotate-1 z-0"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transform rotate-1 z-0"></div>
        </div>
      </div>
      
      {/* Toggle buttons in separate row */}
      <div className="flex justify-center mb-5">
        <div className="rounded-lg p-1 flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${view === 'grid'
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-blue-200/70 hover:bg-gray-700/50'
            }`}
          >
            Heat Map
          </button>
          <button
            onClick={() => setView('cloud')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${view === 'cloud'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-200/70 hover:bg-gray-700/50'
            }`}
          >
            Tag Cloud
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 border-2 border-t-blue-500 border-blue-200/20 rounded-full animate-spin"></div>
          <p className="mt-1 text-blue-300 text-xs">Loading hashtags...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-900/50 py-2 px-3 rounded mb-3 text-center max-w-md mx-auto">
          <p className="text-red-200 text-xs">{error}</p>
          <button
            className="mt-1 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-white text-xs"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main content with exactly 10 hashtags */}
      {!loading && !error && hashtagData.length > 0 && (
        <div className="max-w-3xl mx-auto">
          {/* Stretched background container */}
          <div className="bg-gray-950 backdrop-blur-md rounded-lg border border-white/10 shadow-md p-5 pb-7">
            {/* Non-scrollable fixed content container with increased height */}
            <div className="h-[380px]"> 
              {/* Heat Map Grid View - exact 2 columns with 5 rows */}
              {view === 'grid' && (
                <div className="h-full">
                  <div className="grid grid-cols-2 gap-4">
                    {hashtagData.map((tag, index) => {
                      // Calculate intensity based on usage count
                      const maxCount = Math.max(...hashtagData.map(t => t.count));
                      const minCount = Math.min(...hashtagData.map(t => t.count));
                      const range = maxCount - minCount || 1;
                      const intensity = (tag.count - minCount) / range;
                      
                      // Generate colors based on intensity using inline styles
                      const opacity = Math.max(0.4, Math.min(0.9, intensity));
                      
                      // Custom gradient background based on intensity
                      let gradientStyle;
                      if (intensity < 0.3) {
                        gradientStyle = {
                          background: `linear-gradient(135deg, rgba(30, 58, 138, ${opacity}) 0%, rgba(67, 56, 202, ${opacity}) 100%)`
                        };
                      } else if (intensity < 0.6) {
                        gradientStyle = {
                          background: `linear-gradient(135deg, rgba(79, 70, 229, ${opacity}) 0%, rgba(124, 58, 237, ${opacity}) 100%)`
                        };
                      } else if (intensity < 0.9) {
                        gradientStyle = {
                          background: `linear-gradient(135deg, rgba(139, 92, 246, ${opacity}) 0%, rgba(168, 85, 247, ${opacity}) 100%)`
                        };
                      } else {
                        gradientStyle = {
                          background: `linear-gradient(135deg, rgba(192, 38, 211, ${opacity}) 0%, rgba(236, 72, 153, ${opacity}) 100%)`
                        };
                      }

                      return (
                        <div
                          key={tag.hashtag}
                          className="relative rounded overflow-hidden transition-all duration-300 group hover:shadow-md"
                          onMouseEnter={() => setHovered(tag.hashtag)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          {/* Use inline style for gradient */}
                          <div className="absolute inset-0" style={gradientStyle}></div>

                          <div className="relative p-3 flex items-center">
                            {/* Rank badge for top 3 */}
                            {index < 3 && (
                              <div className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center text-xs font-bold
                                ${index === 0 ? 'bg-yellow-400 text-gray-900' :
                                  index === 1 ? 'bg-gray-300 text-gray-900' :
                                    'bg-amber-700 text-white'}`}
                              >
                                {index + 1}
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="font-medium text-white">{tag.hashtag}</div>
                              <div className="text-xs text-white/70">{tag.count} posts</div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-20 ml-2">
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-1.5 bg-white/70 rounded-full"
                                  style={{ width: `${(tag.count / maxCount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tag Cloud View - same fixed height container, non-scrollable */}
              {view === 'cloud' && (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-wrap justify-center items-center gap-4 p-5 max-w-xl">
                    {hashtagData.map((tag, index) => {
                      // Calculate size based on count
                      const maxCount = Math.max(...hashtagData.map(t => t.count));
                      const minCount = Math.min(...hashtagData.map(t => t.count));
                      const range = maxCount - minCount || 1;
                      const sizeFactor = 0.8 + ((tag.count - minCount) / range);
                      // Slightly larger font sizes for the expanded container
                      const fontSize = `${Math.max(0.9, Math.min(2.0, sizeFactor * 1.3))}rem`;

                      // Calculate color based on popularity rank
                      let textColor;
                      if (index === 0) textColor = 'text-yellow-400';
                      else if (index === 1) textColor = 'text-blue-300';
                      else if (index === 2) textColor = 'text-pink-400';
                      else if (index < 6) textColor = 'text-purple-300';
                      else textColor = 'text-blue-200/70';

                      const fontWeight = index < 3 ? 'font-bold' : 'font-medium';

                      return (
                        <div
                          key={tag.hashtag}
                          className={`relative transition-all duration-300 hover:scale-110 cursor-pointer ${textColor} ${fontWeight} px-2 hover:drop-shadow-glow`}
                          style={{ fontSize }}
                          onMouseEnter={() => setHovered(tag.hashtag)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          {tag.hashtag}

                          {/* Popup on hover */}
                          {hovered === tag.hashtag && (
                            <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800/90 border border-white/10 rounded px-2 py-1 shadow-md whitespace-nowrap">
                              <div className="text-xs">{tag.count} posts</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No hashtags found message */}
      {!loading && !error && hashtagData.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/5 mx-auto max-w-sm text-center">
          <svg className="w-8 h-8 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <h2 className="text-lg font-bold text-white mt-2">No Hashtags Found</h2>
          <p className="text-blue-200/70 text-xs">
            No hashtags found in the analyzed posts.
          </p>
        </div>
      )}
    </div>
  );
};

export default HashtagWordCloud;
import React, { useState } from 'react';
import axios from 'axios';
import { getCollectionName } from '../../db/index.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendationData {
    type: string;
    expected_average_likes: number;
    expected_average_comments: number;
    engagement_score: number;
}

const ModelPieChart: React.FC = () => {
    const [recommendationData, setRecommendationData] = useState<RecommendationData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showChart, setShowChart] = useState<boolean>(false);
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    // Function to fetch recommendations from the API
    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const collectionName = getCollectionName();

            // Make sure we have a valid collection name
            if (!collectionName || collectionName === 'Nothing to worry about!') {
                setError('No collection selected. Please analyze an Instagram profile first.');
                setLoading(false);
                return;
            }

            // Format the collection name correctly for the API
            const requestPayload = {
                collection_name: collectionName
            };

            // Fetch recommendation data from the endpoint
            const response = await axios.post(
                'http://127.0.0.1:8000/recommend',
                requestPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Parse the response into the format we need for the chart
            const parsedData = parseRecommendationData(response.data);
            setRecommendationData(parsedData);

            // Small delay to ensure smooth transition
            setTimeout(() => {
                setLoading(false);
                setShowChart(true);
            }, 300);

        } catch (err) {
            console.error('Failed to fetch recommendations:', err);

            // Enhanced error handling to show more useful messages
            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const responseData = err.response?.data;

                if (statusCode === 422) {
                    setError(`API validation error: ${JSON.stringify(responseData)}`);
                } else {
                    setError(`API error (${statusCode}): ${err.message}`);
                }
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
            }

            setLoading(false);
        }
    };

    // Function to parse the recommendation data from the API response
    const parseRecommendationData = (data: any): RecommendationData[] => {
        try {
            const results: RecommendationData[] = [];

            // Handle direct response where data is already the recommendation object
            if (typeof data === 'object' && !Array.isArray(data)) {
                // First check if it's the wrapper format with the recommendations inside
                if ('recommendations' in data) {
                    return parseRecommendationData(data.recommendations);
                }

                // Try to extract post type recommendations
                Object.entries(data).forEach(([type, stats]: [string, any]) => {
                    if (typeof stats === 'object' && 'expected_average_likes' in stats) {
                        results.push({
                            type,
                            expected_average_likes: stats.expected_average_likes,
                            expected_average_comments: stats.expected_average_comments,
                            engagement_score: stats.engagement_score
                        });
                    }
                });
            }
            // Handle string response that needs parsing
            else if (typeof data === 'string') {
                // Try to parse as JSON first in case it's a stringified object
                try {
                    const jsonData = JSON.parse(data);
                    return parseRecommendationData(jsonData);
                } catch {
                    // If not valid JSON, try to parse the text format
                    const lines = data.split('\n');

                    lines.forEach(line => {
                        if (line.includes(': {')) {
                            const typeParts = line.split(':');
                            const type = typeParts[0].trim().replace('Recommendations for next post types:', '').trim();

                            // Extract JSON part
                            const jsonMatch = line.match(/{.*?}/);
                            if (jsonMatch) {
                                const jsonStr = jsonMatch[0].replace(/'/g, '"');

                                try {
                                    const stats = JSON.parse(jsonStr);
                                    results.push({
                                        type,
                                        expected_average_likes: stats.expected_average_likes,
                                        expected_average_comments: stats.expected_average_comments,
                                        engagement_score: stats.engagement_score
                                    });
                                } catch (e) {
                                    console.error('Failed to parse recommendation JSON:', jsonStr, e);
                                }
                            }
                        }
                    });
                }
            }

            if (results.length === 0) {
                console.warn('No recommendation data could be parsed from:', data);
            }

            return results;
        } catch (e) {
            console.error('Error parsing recommendation data:', e);
            return [];
        }
    };

    // Colors for different post types - brighter colors for better visibility
    const COLORS = ['#60a5fa', '#5eead4', '#fcd34d', '#f472b6'];

    // Brighter colors for hover effects
    const HOVER_COLORS = ['#93c5fd', '#99f6e4', '#fde68a', '#fbcfe8'];

    // Format large numbers for display
    const formatLargeNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Function to get color based on whether segment is hovered
    const getSegmentColor = (index: number, segmentType: string): string => {
        return hoveredSegment === segmentType ? HOVER_COLORS[index % HOVER_COLORS.length] : COLORS[index % COLORS.length];
    };

    // Handle segment hover
    const handleSegmentHover = (type: string | null) => {
        setHoveredSegment(type);
    };

    // Custom tooltip for the pie chart - enhanced with bright colors and blur effect
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const colorIndex = recommendationData.findIndex(item => item.type === data.type);
            const bgColor = HOVER_COLORS[colorIndex % HOVER_COLORS.length];

            // Get the color with proper contrast for text

            return (
                <div className="backdrop-blur-xl bg-gray-800/70 p-5 rounded-lg shadow-2xl border border-white/20 transform transition-all duration-200">
                    <div className="relative z-10">
                        <div className={`absolute -inset-1 rounded-lg opacity-50 blur-sm`} style={{ backgroundColor: bgColor, filter: 'blur(8px)' }}></div>
                        <div className="relative p-3 rounded-lg" style={{ backgroundColor: `${bgColor}25` }}>
                            <h3 className="font-bold text-xl text-white mb-2">{`${data.type}`}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-100 font-medium">Engagement Score:</span>
                                    <span className="font-bold text-white text-lg">{formatLargeNumber(data.engagement_score)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded border border-white/20">
                                        <p className="text-xs text-gray-300">Expected Likes</p>
                                        <p className="font-medium text-white">{formatLargeNumber(data.expected_average_likes)}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded border border-white/20">
                                        <p className="text-xs text-gray-300">Expected Comments</p>
                                        <p className="font-medium text-white">{formatLargeNumber(data.expected_average_comments)}</p>
                                    </div>
                                </div>
                                {/* Removed the "Click to see detailed recommendation" text */}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex justify-center">
            {/* Initial button or loading state */}
            {!showChart ? (
                <div className="flex justify-center">
                    <button
                        onClick={fetchRecommendations}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg text-white font-medium text-lg transition-all ${loading
                            ? 'bg-blue-700 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        <div className="flex items-center">
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                    </svg>
                                    Get Recommendations
                                </>
                            )}
                        </div>
                    </button>
                </div>
            ) : (
                // Animated chart container that fades in
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full relative"
                    >
                        {/* Backdrop blur effect when tooltip is shown */}
                        {hoveredSegment && (
                            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm z-0"></div>
                        )}

                        <div className={`bg-gray-950 rounded-lg shadow-md p-6 mb-6 border border-gray-800 w-full relative z-10 transition-all duration-300 ${hoveredSegment ? 'bg-opacity-90' : 'bg-opacity-100'}`}>
                            {/* Header with title */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Post Type Recommendations</h2>
                                    <p className="text-sm text-gray-400">AI-powered engagement predictions</p>
                                </div>

                                <button
                                    onClick={fetchRecommendations}
                                    className="px-4 py-2 rounded-md text-white font-medium transition-all bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-900/40 text-red-200 p-4 rounded-md mb-4 border border-red-800/50">
                                    <p className="font-medium">Error</p>
                                    <p className="text-sm">{error}</p>
                                    <button
                                        onClick={fetchRecommendations}
                                        className="mt-3 px-3 py-1 rounded text-sm bg-red-700 hover:bg-red-600 text-white transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Results area */}
                            {recommendationData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`transition-opacity duration-300 ${hoveredSegment ? 'relative z-20' : ''}`}
                                >
                                    <div className="h-80 mb-6 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart onMouseLeave={() => handleSegmentHover(null)}>
                                                <Pie
                                                    data={recommendationData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="engagement_score"
                                                    nameKey="type"
                                                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                                    onMouseEnter={(data) => handleSegmentHover(data.type)}
                                                    onMouseLeave={() => handleSegmentHover(null)}
                                                >
                                                    {recommendationData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={getSegmentColor(index, entry.type)}
                                                            style={{
                                                                filter: hoveredSegment === entry.type ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                                                                opacity: hoveredSegment ? (hoveredSegment === entry.type ? 1 : 0.6) : 1,
                                                                transition: 'all 0.3s ease',
                                                                outline: 'none',
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    wrapperStyle={{ zIndex: 100, outline: 'none' }}
                                                />
                                                <Legend
                                                    formatter={(value) => (
                                                        <span className={`${hoveredSegment === value ? 'text-white font-bold' : 'text-gray-300'} transition-all duration-200`}>
                                                            {value}
                                                        </span>
                                                    )}
                                                    onMouseEnter={(data) => handleSegmentHover(data.value)}
                                                    onMouseLeave={() => handleSegmentHover(null)}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default ModelPieChart;
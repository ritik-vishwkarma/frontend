import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from "react";
import { fetchProcessedData, TimeData, PostTypeData } from "@/db";

const LikesCommentOverTime = () => {
    const [data, setData] = useState<PostTypeData[]>([]);
    const [timeData, setTimeData] = useState<TimeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [postCount, setPostCount] = useState(0);
    const [totalLikes, setTotalLikes] = useState(0);
    const [totalComments, setTotalComments] = useState(0);

    // Use useEffect to call the async function when component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get all processed data in one call
                const processedData = await fetchProcessedData();

                // Update state with processed data
                setTimeData(processedData.timeData);
                setData(processedData.postTypeData);
                setPostCount(processedData.postCount);
                setTotalLikes(processedData.totalLikes);
                setTotalComments(processedData.totalComments);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="p-6 text-white min-h-screen">
            <div className="flex justify-center mb-10">
                <div className="relative inline-block">
                    <h1 className="text-3xl font-bold text-center text-white relative z-10 px-10 py-3">
                        Instagram Engagement Analysis
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl transform -rotate-1 z-0"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transform rotate-1 z-0"></div>
                </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    <span>Loading data...</span>
                </div>
            )}

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

            {/* Data Overview Section */}
            {!loading && !error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-950 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-300">Total Posts</p>
                                    <p className="text-2xl font-bold text-white">
                                        {new Intl.NumberFormat().format(postCount)}
                                    </p>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-300">Total Likes</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {new Intl.NumberFormat().format(totalLikes)}
                                    </p>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-300">Total Comments</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {new Intl.NumberFormat().format(totalComments)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Grid with two columns for horizontal layout */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Engagement Trends - Left Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col h-full"
                    >
                        <Card className="bg-gray-950 border-gray-700 h-full">
                            <CardContent className="pt-6 flex flex-col h-full">
                                <h2 className="text-xl font-semibold mb-4 text-white">Likes & Comments Over Time</h2>
                                {timeData.length > 0 ? (
                                    <div className="flex justify-center flex-grow">
                                        <LineChart
                                            width={500}
                                            height={350}
                                            data={timeData}
                                            margin={{
                                                top: 20,
                                                right: 30, // Increased right margin to accommodate the secondary axis
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="date" stroke="#fff" />

                                            {/* Left Y-axis for Likes */}
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#82ca9d"
                                                tickFormatter={(value) => new Intl.NumberFormat('en', {
                                                    notation: 'compact',
                                                    compactDisplay: 'short'
                                                }).format(value)}
                                            />

                                            {/* Right Y-axis for Comments */}
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#8884d8"
                                                tickFormatter={(value) => new Intl.NumberFormat('en', {
                                                    notation: 'compact',
                                                    compactDisplay: 'short'
                                                }).format(value)}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    color: '#fff'
                                                }}
                                                formatter={(value) =>
                                                    typeof value === 'number'
                                                        ? new Intl.NumberFormat().format(value)
                                                        : value
                                                }
                                            />
                                            <Legend />

                                            {/* Likes line using the left axis */}
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="likes"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                name="Likes"
                                                dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
                                                activeDot={{ stroke: '#82ca9d', strokeWidth: 2, r: 6 }}
                                            />

                                            {/* Comments line using the right axis */}
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="comments"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                name="Comments"
                                                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                                                activeDot={{ stroke: '#8884d8', strokeWidth: 2, r: 6 }}
                                            />
                                        </LineChart>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center flex-grow text-gray-400 italic">
                                        No time-based data available
                                    </div>
                                )}
                                <div className="mt-4 text-center text-sm text-gray-400">
                                    Engagement metrics tracked over time
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Post Type Engagement - Right Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        <Card className="bg-gray-950 border-gray-700 h-full">
                            <CardContent className="pt-6 flex flex-col h-full">
                                <h2 className="text-xl font-semibold mb-4 text-white">Post Type Engagement</h2>
                                {data.length > 0 ? (
                                    <div className="flex justify-center flex-grow">
                                        <BarChart
                                            width={500}
                                            height={350}
                                            data={data}
                                            margin={{
                                                top: 20,
                                                right: 30, // Increased right margin to accommodate the secondary axis
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="postType" stroke="#fff" />

                                            {/* Left Y-axis for Likes */}
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#82ca9d"
                                                tickFormatter={(value) => new Intl.NumberFormat('en', {
                                                    notation: 'compact',
                                                    compactDisplay: 'short'
                                                }).format(value)}
                                            />

                                            {/* Right Y-axis for Comments */}
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#8884d8"
                                                tickFormatter={(value) => new Intl.NumberFormat('en', {
                                                    notation: 'compact',
                                                    compactDisplay: 'short'
                                                }).format(value)}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    color: '#fff'
                                                }}
                                                formatter={(value) =>
                                                    typeof value === 'number'
                                                        ? new Intl.NumberFormat().format(value)
                                                        : value
                                                }
                                            />
                                            <Legend />

                                            {/* We'll use two different Bar components instead of just positioning them side by side */}
                                            <Bar
                                                yAxisId="left"
                                                dataKey="likes"
                                                fill="#82ca9d"
                                                name="Likes"
                                                barSize={35}
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="comments"
                                                fill="#8884d8"
                                                name="Comments"
                                                barSize={35}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center flex-grow text-gray-400 italic">
                                        No post type data available
                                    </div>
                                )}
                                <div className="mt-4 text-center text-sm text-gray-400">
                                    Comparison of engagement metrics across different post types
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LikesCommentOverTime;
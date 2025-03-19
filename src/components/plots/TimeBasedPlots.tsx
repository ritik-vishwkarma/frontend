import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from "react";
import {
  fetchTimeEngagementData,
  DayData,
  HourData
} from "@/db";

// Define the available metrics for toggling
type MetricType = 'total' | 'likes' | 'comments' | 'ratio';

const TimeBasedInsights = () => {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total');

  // Format number to K and M
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Helper function to format ratio values
  const formatRatio = (value: number): string => {
    return value.toFixed(1);
  };

  // Helper function to get color for each metric
  const getColorForMetric = (metric: MetricType): string => {
    switch (metric) {
      case 'likes': return '#8884d8'; // Purple
      case 'comments': return '#82ca9d'; // Green
      case 'ratio': return '#ffb00f'; // Yellow/Gold
      default: return '#8B8000'; // Purple for total (default)
    }
  };

  // Helper function to get display name for each metric
  const getNameForMetric = (metric: MetricType): string => {
    switch (metric) {
      case 'likes': return 'Likes';
      case 'comments': return 'Comments';
      case 'ratio': return 'Like/Comment Ratio';
      default: return 'Total Engagement';
    }
  };

  // Helper function to format tooltip values based on metric
  const formatTooltipValue = (value: number, metric: MetricType): string => {
    if (metric === 'ratio') {
      return formatRatio(value);
    }
    return formatNumber(value);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the centralized data fetching function
        const { dayData: dayEngagementData, hourData: hourEngagementData } = await fetchTimeEngagementData();

        // Update state
        setDayData(dayEngagementData);
        setHourData(hourEngagementData);
      } catch (err) {
        console.error("Error loading time-based data:", err);
        setError("Failed to load engagement data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find peak engagement periods for insights based on selected metric
  const getBestDay = (): string => {
    if (dayData.length === 0) return "";
    const bestDay = dayData.reduce((max, day) =>
      day[selectedMetric] > max[selectedMetric] ? day : max, dayData[0]);
    return bestDay.fullDay;
  };

  const getPeakHours = (): string => {
    if (hourData.length === 0) return "";

    // Sort by selected metric (descending)
    const sortedHours = [...hourData].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
    const topHours = sortedHours.slice(0, 3);

    // Format the hours for display
    return topHours.map(h => h.hour).join(', ');
  };

  // Get description text based on selected metric
  const getMetricDescription = (): string => {
    switch (selectedMetric) {
      case 'likes':
        return `${getBestDay()} receives the most likes`;
      case 'comments':
        return `${getBestDay()} generates the most comments`;
      case 'ratio':
        return `${getBestDay()} has the highest like-to-comment ratio`;
      default:
        return `${getBestDay()} has the highest total engagement`;
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex justify-center mb-10">
        <div className="relative inline-block">
          <h1 className="text-3xl font-bold text-center text-white relative z-10 px-10 py-3">
            Optimal Posting Time Analysis
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl transform -rotate-1 z-0"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transform rotate-1 z-0"></div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span className="text-white">Loading engagement data...</span>
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

      {/* Metric Toggle Buttons */}
      {!loading && !error && (
        <div className="flex justify-center mb-6 gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${selectedMetric === 'total' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500 transition-colors`}
            onClick={() => setSelectedMetric('total')}
          >
            Total Engagement
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${selectedMetric === 'likes' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500 transition-colors`}
            onClick={() => setSelectedMetric('likes')}
          >
            Likes
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${selectedMetric === 'comments' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500 transition-colors`}
            onClick={() => setSelectedMetric('comments')}
          >
            Comments
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${selectedMetric === 'ratio' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-500 transition-colors`}
            onClick={() => setSelectedMetric('ratio')}
          >
            Like/Comment Ratio
          </button>
        </div>
      )}

      {/* Grid with two columns for horizontal layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Day to Post - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-gray-950 border-gray-700 h-full">
              <CardContent className="pt-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4 text-white">Best Day to Post</h2>
                <div className="flex justify-center flex-grow">
                  <BarChart
                    width={500}
                    height={350}
                    data={dayData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#fff" />
                    <YAxis
                      stroke="#fff"
                      tickFormatter={selectedMetric === 'ratio' ? formatRatio : formatNumber}
                      domain={selectedMetric === 'ratio' ? [0, 'auto'] : undefined}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '5px',
                        color: '#fff'
                      }}
                      labelFormatter={(label) => {
                        // Find the full day name from the data array
                        const dayItem = dayData.find(item => item.day === label);
                        return dayItem ? dayItem.fullDay : label;
                      }}
                      formatter={(value) => [
                        typeof value === 'number'
                          ? formatTooltipValue(value, selectedMetric as MetricType)
                          : value.toString(),
                        getNameForMetric(selectedMetric as MetricType)
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey={selectedMetric}
                      fill={getColorForMetric(selectedMetric as MetricType)}
                      name={getNameForMetric(selectedMetric as MetricType)}
                    />
                  </BarChart>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  {getBestDay() ? getMetricDescription() : "Analyzing engagement patterns..."}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement by Hour - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-gray-950 border-gray-700 h-full">
              <CardContent className="pt-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4 text-white">Engagement by Hour</h2>
                <div className="flex justify-center flex-grow">
                  <LineChart
                    width={500}
                    height={350}
                    data={hourData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="hour"
                      stroke="#fff"
                      interval={3} // Show fewer x-axis labels to avoid crowding
                    />
                    <YAxis
                      stroke="#fff"
                      tickFormatter={selectedMetric === 'ratio' ? formatRatio : formatNumber}
                      domain={selectedMetric === 'ratio' ? [0, 'auto'] : undefined}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '5px',
                        color: '#fff'
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value) => [
                        typeof value === 'number'
                          ? formatTooltipValue(value, selectedMetric as MetricType)
                          : value.toString(),
                        getNameForMetric(selectedMetric as MetricType)
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={getColorForMetric(selectedMetric as MetricType)}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      dot={{ r: 4 }}
                      name={getNameForMetric(selectedMetric as MetricType)}
                    />

                    {/* Add a gradient under the line */}
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={getColorForMetric(selectedMetric as MetricType)}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={getColorForMetric(selectedMetric as MetricType)}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="none"
                      fillOpacity={0.3}
                      fill="url(#engagementGradient)"
                    />
                  </LineChart>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  {getPeakHours() ? `Peak ${selectedMetric === 'ratio' ? 'like-to-comment ratio' : selectedMetric} hours: ${getPeakHours()}` : "Analyzing hourly engagement patterns..."}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TimeBasedInsights;
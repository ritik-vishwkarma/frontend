// Define your base API URL
const API_BASE_URL = 'http://localhost:3000/connection/samples'

// Define types based on your data structure
export interface InstagramPost {
  id: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  hashtags?: string[];
  timestamp?: string;
}

// Interface for the API response
export interface ApiResponse {
  status: string;
  count: number;
  data: ApiPost[];
}

// Interface for each post in the API response
export interface ApiPost {
  _id: string;
  type: string;
  likesCount: number;
  commentsCount: number;
  hashtags: string[];
  mentions: string[];
  caption: string;
  timestamp: string;
}

// Type definitions for our chart data
export interface TimeData {
  date: string;
  likes: number;
  comments: number;
}

export interface PostTypeData {
  postType: string;
  likes: number;
  comments: number;
  count: number;
}

// Define the interface for processed hashtag data
export interface HashtagCount {
  hashtag: string;
  count: number;
  likes: number;
}

/**
 * Gets the current collection name from storage or state
 * @returns The collection name to use for API calls
 */
export function getCollectionName(): string {
  // Try to get from localStorage first
  const storedName = localStorage.getItem('currentCollectionName');
  if (storedName) {
    return storedName;
  }

  // Fallback to a default collection if none is stored
  return 'Nothing to worry about!';
  // return "collection_2025_03_22t20_03_28_551z_9jllnv47v";
}

/**
 * Fetches Instagram posts from the API
 * @returns Promise resolving to an array of API posts
 */
export async function fetchPosts(collectionName?: string): Promise<ApiPost[]> {
  try {

    const collection = collectionName || getCollectionName();

    const response = await fetch(`${API_BASE_URL}/${collection}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched data:', data); // Debugging line

    // Handle both direct array and wrapped response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

/**
 * Process posts to get time-based engagement data
 * @param posts Array of Instagram posts to analyze
 * @returns Array of daily engagement metrics
 */
export function processTimeData(posts: ApiPost[]): TimeData[] {
  // Check if posts array is empty
  if (!posts || posts.length === 0) {
    return [];
  }

  // Create a map to store engagement by date
  const engagementByDate = new Map<string, TimeData>();

  posts.forEach(post => {
    if (post.timestamp) {
      // Get just the date part (YYYY-MM-DD)
      const date = new Date(post.timestamp).toISOString().split('T')[0];

      if (!engagementByDate.has(date)) {
        engagementByDate.set(date, { date, likes: 0, comments: 0 });
      }

      const dateData = engagementByDate.get(date)!;
      // Use the API field names (likesCount, commentsCount)
      dateData.likes += post.likesCount || 0;
      dateData.comments += post.commentsCount || 0;
    }
  });

  // Convert map to array and sort by date
  return Array.from(engagementByDate.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Process posts to get post type engagement data
 * @param posts Array of Instagram posts to analyze
 * @returns Array of engagement metrics by post type
 */
export function processPostTypeData(posts: ApiPost[]): PostTypeData[] {
  // Check if posts array is empty
  if (!posts || posts.length === 0) {
    return [];
  }

  // Initialize objects to store data by post type
  const postTypeData: Record<string, PostTypeData> = {};

  posts.forEach(post => {
    // Use the post.type field from the API response
    const postType = post.type || 'Other';

    // If this is the first post of this type, initialize the object
    if (!postTypeData[postType]) {
      postTypeData[postType] = {
        postType,
        likes: 0,
        comments: 0,
        count: 0
      };
    }

    // Add this post's data to the appropriate type
    postTypeData[postType].likes += post.likesCount || 0;
    postTypeData[postType].comments += post.commentsCount || 0;
    postTypeData[postType].count += 1;
  });

  // Convert to array format for the chart
  return Object.values(postTypeData);
}

/**
 * Processes an array of posts to extract hashtag usage statistics
 * @param posts Array of Instagram posts to analyze
 * @param limit Maximum number of hashtags to return (default: 10)
 * @returns Array of hashtags with their usage count and associated likes, sorted by frequency
 */
export function processHashtagData(posts: ApiPost[], limit: number = 10): HashtagCount[] {
  // Check if posts array is empty
  if (!posts || posts.length === 0) {
    return [];
  }

  // Create a map to store hashtag occurrences and associated likes
  const hashtagMap = new Map<string, { count: number, likes: number }>();

  // Loop through all posts
  posts.forEach(post => {
    // Check if the post has hashtags
    if (post.hashtags && Array.isArray(post.hashtags)) {
      // Get the likes for this post
      const postLikes = post.likesCount || 0;

      // Loop through each hashtag in the post
      post.hashtags.forEach(tag => {
        // Normalize hashtag (add # if missing)
        const hashtag = tag.startsWith('#') ? tag : `#${tag}`;

        // Update the count and likes in our map
        const current = hashtagMap.get(hashtag) || { count: 0, likes: 0 };
        hashtagMap.set(hashtag, {
          count: current.count + 1,
          likes: current.likes + postLikes
        });
      });
    }
  });

  // Convert map to array of objects
  const hashtagArray = Array.from(hashtagMap.entries()).map(([hashtag, data]) => ({
    hashtag,
    count: data.count,
    likes: data.likes
  }));

  // First sort by count (descending), then by likes (descending) for equal counts
  const sortedHashtags = hashtagArray.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count; // Sort by count first
    }
    return b.likes - a.likes; // If counts are equal, sort by likes
  });

  // Take the top hashtags based on limit parameter
  return sortedHashtags.slice(0, limit);
}

/**
 * Fetches and processes all data needed for dashboard visualization
 * @returns Object containing all processed data sets
 */
export async function fetchProcessedData(collectionName?: string) {
  try {
    const posts = await fetchPosts(collectionName);
    return {
      posts,
      timeData: processTimeData(posts),
      postTypeData: processPostTypeData(posts),
      hashtagData: processHashtagData(posts), // Added hashtag data
      postCount: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likesCount || 0), 0),
      totalComments: posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
    };
  } catch (error) {
    console.error('Error processing data:', error);
    throw error;
  }
}

/**
 * Fetches and processes only hashtag data
 * @param limit Maximum number of hashtags to return (default: 10)
 * @returns Array of processed hashtag data
 */
export async function fetchHashtagData(limit: number = 10): Promise<HashtagCount[]> {
  try {
    const posts = await fetchPosts();
    return processHashtagData(posts, limit);
  } catch (error) {
    console.error('Error fetching hashtag data:', error);
    throw error;
  }
}

// Add these interfaces to db/index.tsx
export interface DayData {
  day: string;
  fullDay: string;
  likes: number;
  comments: number;
  total: number;
  ratio: number;
}

export interface HourData {
  hour: string;
  likes: number;
  comments: number;
  total: number;
  ratio: number;
}

/**
 * Process posts to get engagement by day of week with multiple metrics
 * @param posts Array of Instagram posts to analyze
 * @returns Array of daily engagement metrics with multiple metrics
 */
/**
* Process posts to get engagement by day of week with multiple metrics
* @param posts Array of Instagram posts to analyze
* @returns Array of daily engagement metrics with multiple metrics
*/
export function processPostsByDay(posts: ApiPost[]): DayData[] {
  // Check if posts array is empty
  if (!posts || posts.length === 0) {
    return [];
  }

  // Create a map to track engagement by day
  const dayMap: Record<number, { likes: number, comments: number }> = {
    0: { likes: 0, comments: 0 }, // Sunday
    1: { likes: 0, comments: 0 }, // Monday
    2: { likes: 0, comments: 0 }, // Tuesday
    3: { likes: 0, comments: 0 }, // Wednesday
    4: { likes: 0, comments: 0 }, // Thursday
    5: { likes: 0, comments: 0 }, // Friday
    6: { likes: 0, comments: 0 }, // Saturday
  };

  // Process each post
  posts.forEach(post => {
    if (post.timestamp) {
      try {
        const date = new Date(post.timestamp);

        // Validate that the date is valid before using
        if (!isNaN(date.getTime())) {
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

          dayMap[dayOfWeek].likes += post.likesCount || 0;
          dayMap[dayOfWeek].comments += post.commentsCount || 0;
        } else {
          console.warn(`Invalid timestamp format in post ID ${post._id}: ${post.timestamp}`);
        }
      } catch (err) {
        console.warn(`Error processing timestamp in post ID ${post._id}: ${(err as Error).message}`);
      }
    }
  });

  // Convert to the required format for the chart
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  return Object.entries(dayMap).map(([dayIndex, data]) => {
    const index = parseInt(dayIndex);
    const commentCount = Math.max(data.comments, 1); // Avoid division by zero

    return {
      day: dayAbbr[index],
      fullDay: dayNames[index],
      likes: data.likes,
      comments: data.comments,
      total: data.likes + data.comments,
      ratio: +(data.likes / commentCount).toFixed(1)
    };
  }).sort((a, b) => {
    // Sort by day of week (Monday first)
    const dayOrder = { "Mon": 0, "Tue": 1, "Wed": 2, "Thur": 3, "Fri": 4, "Sat": 5, "Sun": 6 };
    return dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder];
  });
}

/**
 * Process posts to get engagement by hour of day with multiple metrics
 * @param posts Array of Instagram posts to analyze
 * @returns Array of hourly engagement metrics with multiple metrics
 */
export function processPostsByHour(posts: ApiPost[]): HourData[] {
  // Create a map to track engagement by hour
  const hourMap: Record<number, { likes: number, comments: number }> = {};

  // Initialize all hours to zero
  for (let i = 0; i < 24; i++) {
    hourMap[i] = { likes: 0, comments: 0 };
  }

  // Process each post
  posts.forEach(post => {
    if (post.timestamp) {
      const date = new Date(post.timestamp);
      const hour = date.getHours();

      hourMap[hour].likes += post.likesCount || 0;
      hourMap[hour].comments += post.commentsCount || 0;
    }
  });

  // Convert to the required format for the visualization
  const result = Object.entries(hourMap).map(([hourIndex, data]) => {
    const index = parseInt(hourIndex);
    // Format the hour with AM/PM for better readability
    const ampm = index >= 12 ? 'PM' : 'AM';
    const hour12 = index % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedHour = `${hour12}:00 ${ampm}`;
    const commentCount = data.comments || 1; // Avoid division by zero

    return {
      hour: formattedHour,
      likes: data.likes,
      comments: data.comments,
      total: data.likes + data.comments,
      ratio: +(data.likes / commentCount).toFixed(1)
    };
  });

  // Sort by hour for proper time sequence
  return result.sort((a, b) => {
    const hourA = parseInt(a.hour.split(':')[0]);
    const hourB = parseInt(b.hour.split(':')[0]);
    const isAmA = a.hour.includes('AM');
    const isAmB = b.hour.includes('AM');

    // Sort AM before PM
    if (isAmA && !isAmB) return -1;
    if (!isAmA && isAmB) return 1;

    // Within same AM/PM period, sort by hour
    return hourA - hourB;
  });
}

/**
 * Fetches and processes time-based engagement data
 * @returns Object containing day and hour engagement data
 */
export async function fetchTimeEngagementData(collectionName?: string) {
  try {

    const posts = await fetchPosts(collectionName);
    
    return {
      dayData: processPostsByDay(posts),
      hourData: processPostsByHour(posts)
    };
  } catch (error) {
    console.error('Error fetching time engagement data:', error);
    throw error;
  }
}
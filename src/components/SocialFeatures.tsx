import React, { useState, useEffect } from 'react';
import { X, Users, Heart, MessageCircle, Share2, Star, Trophy, Camera, Send, ThumbsUp, ThumbsDown, Award, TrendingUp, Zap, Target, Crown, Medal, Gift } from 'lucide-react';

interface Post {
  id: string;
  user: string;
  avatar: string;
  content: string;
  image?: string;
  foodName?: string;
  vishScore?: number;
  likes: number;
  comments: Comment[];
  timestamp: string;
  liked: boolean;
  badges?: string[];
}

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  reward: string;
  participants: number;
  timeLeft: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'nutrition' | 'taste' | 'social' | 'environmental';
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  badge: string;
  streak: number;
  achievements: string[];
}

interface SocialFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({ isOpen, onClose }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard' | 'achievements'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userStats, setUserStats] = useState({
    level: 12,
    xp: 2847,
    nextLevelXp: 3000,
    streak: 7,
    totalAnalyses: 156,
    badges: ['🏆 Vish Master', '🌱 Health Warrior', '📊 Data Lover']
  });

  useEffect(() => {
    if (isOpen) {
      loadSocialData();
    }
  }, [isOpen]);

  const loadSocialData = () => {
    // Mock social posts
    const mockPosts: Post[] = [
      {
        id: '1',
        user: 'Sarah Johnson',
        avatar: '👩‍🦰',
        content: 'Just hit my 30-day streak of healthy eating! 🎉 FoodCheck has been a game-changer for my nutrition journey.',
        foodName: 'Quinoa Power Bowl',
        vishScore: 87,
        likes: 42,
        comments: [
          { id: '1', user: 'Mike Chen', content: 'Amazing! What\'s your secret?', timestamp: '2h ago' },
          { id: '2', user: 'Lisa Park', content: 'So inspiring! 💪', timestamp: '1h ago' }
        ],
        timestamp: '3h ago',
        liked: false,
        badges: ['🏆 Streak Master', '🌱 Health Guru']
      },
      {
        id: '2',
        user: 'Alex Rodriguez',
        avatar: '👨‍💼',
        content: 'Challenge completed! 🎯 Managed to keep my daily sugar under 25g for a whole week. Feeling amazing!',
        likes: 38,
        comments: [
          { id: '1', user: 'Emma Wilson', content: 'That\'s incredible willpower!', timestamp: '30m ago' }
        ],
        timestamp: '5h ago',
        liked: true,
        badges: ['🍯 Sugar Warrior']
      },
      {
        id: '3',
        user: 'Emma Wilson',
        avatar: '👩‍🍳',
        content: 'Found this amazing organic dark chocolate with a Vish Score of 78! 🍫 Who says healthy can\'t be delicious?',
        foodName: 'Organic Dark Chocolate 85%',
        vishScore: 78,
        likes: 56,
        comments: [
          { id: '1', user: 'David Kim', content: 'Where did you find this treasure?', timestamp: '1h ago' },
          { id: '2', user: 'Lisa Park', content: 'Adding to my shopping list!', timestamp: '30m ago' },
          { id: '3', user: 'Tom Wilson', content: 'Dark chocolate is life! 🍫', timestamp: '15m ago' }
        ],
        timestamp: '6h ago',
        liked: false,
        badges: ['🍫 Chocolate Connoisseur', '🔍 Food Explorer']
      }
    ];

    // Mock challenges
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Vish Score Champion',
        description: 'Maintain an average Vish Score of 75+ for 7 days',
        progress: 65,
        reward: '🏆 Champion Badge + 500 XP',
        participants: 1247,
        timeLeft: '3 days left',
        difficulty: 'Hard',
        category: 'nutrition'
      },
      {
        id: '2',
        title: 'Fiber Focus',
        description: 'Consume 25g+ fiber daily for a week',
        progress: 43,
        reward: '🌾 Fiber Master Badge + 300 XP',
        participants: 892,
        timeLeft: '5 days left',
        difficulty: 'Medium',
        category: 'nutrition'
      },
      {
        id: '3',
        title: 'Sugar Reduction',
        description: 'Keep daily sugar under 25g for 5 days',
        progress: 80,
        reward: '🍯 Sugar Warrior Badge + 400 XP',
        participants: 654,
        timeLeft: '1 day left',
        difficulty: 'Medium',
        category: 'nutrition'
      },
      {
        id: '4',
        title: 'Social Butterfly',
        description: 'Share 5 food analyses with friends',
        progress: 20,
        reward: '🦋 Social Badge + 200 XP',
        participants: 423,
        timeLeft: '6 days left',
        difficulty: 'Easy',
        category: 'social'
      },
      {
        id: '5',
        title: 'Eco Warrior',
        description: 'Choose foods with 70+ environmental score for 3 days',
        progress: 33,
        reward: '🌍 Eco Badge + 350 XP',
        participants: 567,
        timeLeft: '4 days left',
        difficulty: 'Medium',
        category: 'environmental'
      }
    ];

    // Mock leaderboard
    const mockLeaderboard: LeaderboardUser[] = [
      { 
        rank: 1, 
        name: 'Emma Wilson', 
        avatar: '👩‍🍳', 
        score: 4847, 
        badge: '🥇',
        streak: 45,
        achievements: ['🏆 Vish Master', '🌱 Health Guru', '🍫 Chocolate Expert', '📊 Data Lover']
      },
      { 
        rank: 2, 
        name: 'Alex Rodriguez', 
        avatar: '👨‍💼', 
        score: 4634, 
        badge: '🥈',
        streak: 32,
        achievements: ['🍯 Sugar Warrior', '💪 Fitness Pro', '🎯 Goal Crusher']
      },
      { 
        rank: 3, 
        name: 'Sarah Johnson', 
        avatar: '👩‍🦰', 
        score: 4521, 
        badge: '🥉',
        streak: 28,
        achievements: ['🔥 Streak Master', '🌱 Health Warrior', '📈 Progress Pro']
      },
      { 
        rank: 4, 
        name: 'Mike Chen', 
        avatar: '👨‍🍳', 
        score: 4398, 
        badge: '🏅',
        streak: 21,
        achievements: ['🍜 Recipe Master', '🥗 Salad King']
      },
      { 
        rank: 5, 
        name: 'Lisa Park', 
        avatar: '👩‍💻', 
        score: 4287, 
        badge: '🏅',
        streak: 19,
        achievements: ['💻 Tech Foodie', '📱 App Expert']
      },
      { 
        rank: 6, 
        name: 'David Kim', 
        avatar: '👨‍⚕️', 
        score: 4156, 
        badge: '🏅',
        streak: 15,
        achievements: ['⚕️ Health Expert', '🧬 Nutrition Scientist']
      },
      { 
        rank: 7, 
        name: 'You', 
        avatar: '😊', 
        score: 2847, 
        badge: '⭐',
        streak: 7,
        achievements: ['🏆 Vish Master', '🌱 Health Warrior', '📊 Data Lover']
      }
    ];

    setPosts(mockPosts);
    setChallenges(mockChallenges);
    setLeaderboard(mockLeaderboard);
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const addComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      content,
      timestamp: 'now'
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));
  };

  const createPost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      user: 'You',
      avatar: '😊',
      content: newPost,
      likes: 0,
      comments: [],
      timestamp: 'now',
      liked: false,
      badges: userStats.badges
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setShowCreatePost(false);
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, participants: challenge.participants + 1 }
        : challenge
    ));
    alert('Challenge joined! Good luck! 🎯');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return '🥗';
      case 'taste': return '😋';
      case 'social': return '👥';
      case 'environmental': return '🌍';
      default: return '🎯';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">FoodCheck Community</h2>
                <p className="text-purple-100">Connect, compete, and grow together</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Stats Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Lv.{userStats.level}</div>
                  <div className="text-xs text-purple-100">Level</div>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>XP</span>
                    <span>{userStats.xp}/{userStats.nextLevelXp}</span>
                  </div>
                  <div className="w-full bg-purple-700 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.streak}</div>
                  <div className="text-xs text-purple-100">Day Streak</div>
                </div>
              </div>
              <div className="flex space-x-2">
                {userStats.badges.slice(0, 3).map((badge, index) => (
                  <span key={index} className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-6 mt-4">
            {[
              { id: 'feed', label: 'Community Feed', icon: <MessageCircle className="h-4 w-4" /> },
              { id: 'challenges', label: 'Challenges', icon: <Trophy className="h-4 w-4" /> },
              { id: 'leaderboard', label: 'Leaderboard', icon: <Crown className="h-4 w-4" /> },
              { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-200 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Create Post */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">😊</div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex-1 text-left px-4 py-2 bg-gray-100 dark:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Share your food discovery...
                  </button>
                  <button className="text-gray-400 hover:text-purple-600">
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Create Post Modal */}
              {showCreatePost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Post</h3>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share your food experience..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => setShowCreatePost(false)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createPost}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Feed */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">{post.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-semibold text-gray-900 dark:text-white">{post.user}</div>
                        {post.badges && post.badges.length > 0 && (
                          <div className="flex space-x-1">
                            {post.badges.slice(0, 2).map((badge, index) => (
                              <span key={index} className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

                  {/* Food Analysis Card */}
                  {post.foodName && post.vishScore && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{post.foodName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Analyzed with FoodCheck</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{post.vishScore}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center space-x-6 mb-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-2 ${post.liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-600 transition-colors`}
                    >
                      <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">{comment.user}</div>
                              <div className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addComment(post.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button className="text-purple-600 hover:text-purple-700">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Active Challenges</h3>
                <p className="text-gray-600 dark:text-gray-400">Join challenges to earn XP, badges, and improve your health</p>
              </div>

              <div className="grid gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getCategoryIcon(challenge.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{challenge.timeLeft}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">{challenge.participants} participants</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Reward: {challenge.reward}
                      </div>
                      <button 
                        onClick={() => joinChallenge(challenge.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Join Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Community Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-400">Top performers this month</p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                  <h4 className="text-lg font-semibold text-white">🏆 Monthly Champions</h4>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {leaderboard.map((user) => (
                    <div key={user.rank} className={`p-4 flex items-center space-x-4 ${user.name === 'You' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="text-2xl">{user.badge}</div>
                      <div className="text-2xl">{user.avatar}</div>
                      <div className="flex-1">
                        <div className={`font-semibold ${user.name === 'You' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{user.rank} • {user.streak} day streak
                        </div>
                        <div className="flex space-x-1 mt-1">
                          {user.achievements.slice(0, 3).map((achievement, index) => (
                            <span key={index} className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">{user.score.toLocaleString()}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Achievements</h3>
                <p className="text-gray-600 dark:text-gray-400">Unlock badges and rewards for your healthy choices</p>
              </div>

              {/* Achievement Categories */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nutrition Achievements */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🥗</span>
                    Nutrition Master
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">🏆 Vish Master</span>
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">🌱 Health Warrior</span>
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🍯 Sugar Slayer</span>
                      <span className="text-gray-400">3/5</span>
                    </div>
                  </div>
                </div>

                {/* Social Achievements */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">👥</span>
                    Social Butterfly
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">💬 Conversation Starter</span>
                      <span className="text-purple-600 dark:text-purple-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🤝 Community Helper</span>
                      <span className="text-gray-400">2/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">📸 Photo Sharer</span>
                      <span className="text-gray-400">1/5</span>
                    </div>
                  </div>
                </div>

                {/* Streak Achievements */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🔥</span>
                    Streak Legend
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">🔥 7-Day Streak</span>
                      <span className="text-orange-600 dark:text-orange-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">⚡ 30-Day Streak</span>
                      <span className="text-gray-400">7/30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">💎 100-Day Streak</span>
                      <span className="text-gray-400">7/100</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Achievements */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">📊</span>
                    Data Explorer
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">📊 Data Lover</span>
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">🔍 Food Detective</span>
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🎯 Analysis Pro</span>
                      <span className="text-gray-400">156/500</span>
                    </div>
                  </div>
                </div>

                {/* Environmental Achievements */}
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🌍</span>
                    Eco Warrior
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🌱 Green Choice</span>
                      <span className="text-gray-400">12/25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">♻️ Eco Champion</span>
                      <span className="text-gray-400">0/50</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🌍 Planet Protector</span>
                      <span className="text-gray-400">0/100</span>
                    </div>
                  </div>
                </div>

                {/* Special Achievements */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">⭐</span>
                    Special Badges
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🎂 Birthday Analyzer</span>
                      <span className="text-gray-400">Locked</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🎄 Holiday Helper</span>
                      <span className="text-gray-400">Seasonal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">👑 VIP Member</span>
                      <span className="text-gray-400">Premium</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🎯 Achievement Progress</h4>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">15</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">42</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Available</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
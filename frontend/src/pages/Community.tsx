import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import PostCard from '../components/community/PostCard';
import CreatePost from '../components/community/CreatePost';
import CommunityFilter from '../components/community/CommunityFilter';

// Sample data - replace with actual data from your API
const samplePosts = [
  {
    id: '1',
    authorName: 'John Doe',
    content:
      'Just completed my first month of daily meditation! The mental clarity and reduced anxiety have been incredible. Anyone else experiencing similar benefits?',
    timestamp: '2023-12-30T12:00:00Z',
    likes: 15,
    isLiked: false,
    category: 'Mental Health',
    isAnonymous: false,
    comments: [
      {
        id: '1',
        authorName: 'Sarah Smith',
        content: 'That's amazing! How long do you meditate each day?',
        timestamp: '2023-12-30T12:30:00Z',
        isAnonymous: false,
      },
    ],
  },
  {
    id: '2',
    authorName: 'Anonymous',
    content:
      'Struggling with work-life balance lately. Would love some advice on setting boundaries and managing stress.',
    timestamp: '2023-12-30T11:00:00Z',
    likes: 8,
    isLiked: true,
    category: 'Support Request',
    isAnonymous: true,
    comments: [],
  },
  {
    id: '3',
    authorName: 'Emily Johnson',
    content:
      'Just achieved my financial savings goal for the year! Here are some tips that helped me stay on track...',
    timestamp: '2023-12-30T10:00:00Z',
    likes: 25,
    isLiked: false,
    category: 'Success Stories',
    isAnonymous: false,
    comments: [
      {
        id: '2',
        authorName: 'Michael Brown',
        content: 'Congratulations! Would love to hear more about your strategy.',
        timestamp: '2023-12-30T10:15:00Z',
        isAnonymous: false,
      },
    ],
  },
];

const Community: React.FC = () => {
  const [posts, setPosts] = useState(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreatePost = (values: {
    content: string;
    category: string;
    isAnonymous: boolean;
  }) => {
    const newPost = {
      id: String(Date.now()),
      authorName: values.isAnonymous ? 'Anonymous' : 'Current User', // Replace with actual user name
      content: values.content,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      category: values.category,
      isAnonymous: values.isAnonymous,
      comments: [],
    };

    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: String(Date.now()),
                  authorName: 'Current User', // Replace with actual user name
                  content,
                  timestamp: new Date().toISOString(),
                  isAnonymous: false,
                },
              ],
            }
          : post
      )
    );
  };

  const filteredPosts = posts
    .filter((post) =>
      selectedCategory === 'All'
        ? true
        : post.category === selectedCategory
    )
    .filter((post) =>
      searchQuery
        ? post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'discussed':
          return b.comments.length - a.comments.length;
        case 'trending':
          // Simple trending algorithm based on recent engagement
          const aScore = b.likes + b.comments.length * 2;
          const bScore = a.likes + a.comments.length * 2;
          return aScore - bScore;
        default: // recent
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Community
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CreatePost onSubmit={handleCreatePost} />
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
          {filteredPosts.length === 0 && (
            <Card>
              <CardContent>
                <Typography variant="body1" color="textSecondary" align="center">
                  No posts found. Be the first to share something!
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <CommunityFilter
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
            onSearchChange={setSearchQuery}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Community;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  userLiked: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  userLiked: boolean;
  comments: Comment[];
  commentCount: number;
}

interface CommunityState {
  posts: Post[];
  activePost: Post | null;
  categories: string[];
  popularTags: string[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    tag: string | null;
    searchQuery: string;
    sortBy: 'recent' | 'popular' | 'commented';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: CommunityState = {
  posts: [],
  activePost: null,
  categories: [],
  popularTags: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    tag: null,
    searchQuery: '',
    sortBy: 'recent',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { community: CommunityState };
      const { filters, pagination } = state.community;
      const response = await axios.get('/api/community/posts', {
        params: {
          category: filters.category,
          tag: filters.tag,
          search: filters.searchQuery,
          sortBy: filters.sortBy,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
      }
      return rejectWithValue('Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (post: Omit<Post, 'id' | 'userId' | 'username' | 'createdAt' | 'updatedAt' | 'likes' | 'userLiked' | 'comments' | 'commentCount'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/community/posts', post);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create post');
      }
      return rejectWithValue('Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'community/updatePost',
  async ({ id, data }: { id: string; data: Partial<Post> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/community/posts/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update post');
      }
      return rejectWithValue('Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'community/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/community/posts/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
      }
      return rejectWithValue('Failed to delete post');
    }
  }
);

export const addComment = createAsyncThunk(
  'community/addComment',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/community/posts/${postId}/comments`, {
        content,
      });
      return { postId, comment: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
      }
      return rejectWithValue('Failed to add comment');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'community/toggleLike',
  async ({ postId, type }: { postId: string; type: 'post' | 'comment'; commentId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/community/posts/${postId}/${type === 'comment' ? `comments/${commentId}/` : ''}like`
      );
      return { postId, type, commentId, liked: response.data.liked };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
      }
      return rejectWithValue('Failed to toggle like');
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setActivePost(state, action: PayloadAction<Post | null>) {
      state.activePost = action.payload;
    },
    updateFilters(
      state,
      action: PayloadAction<Partial<CommunityState['filters']>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination.total = action.payload.total;
        state.categories = action.payload.categories;
        state.popularTags = action.payload.popularTags;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Post
    builder
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.pagination.total += 1;
      });

    // Update Post
    builder
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.activePost?.id === action.payload.id) {
          state.activePost = action.payload;
        }
      });

    // Delete Post
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        if (state.activePost?.id === action.payload) {
          state.activePost = null;
        }
        state.pagination.total -= 1;
      });

    // Add Comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
          post.commentCount += 1;
        }
        if (state.activePost?.id === action.payload.postId) {
          state.activePost.comments.push(action.payload.comment);
          state.activePost.commentCount += 1;
        }
      });

    // Toggle Like
    builder
      .addCase(toggleLike.fulfilled, (state, action) => {
        if (action.payload.type === 'post') {
          const post = state.posts.find((p) => p.id === action.payload.postId);
          if (post) {
            post.userLiked = action.payload.liked;
            post.likes += action.payload.liked ? 1 : -1;
          }
          if (state.activePost?.id === action.payload.postId) {
            state.activePost.userLiked = action.payload.liked;
            state.activePost.likes += action.payload.liked ? 1 : -1;
          }
        } else {
          const post = state.posts.find((p) => p.id === action.payload.postId);
          if (post) {
            const comment = post.comments.find(
              (c) => c.id === action.payload.commentId
            );
            if (comment) {
              comment.userLiked = action.payload.liked;
              comment.likes += action.payload.liked ? 1 : -1;
            }
          }
          if (state.activePost?.id === action.payload.postId) {
            const comment = state.activePost.comments.find(
              (c) => c.id === action.payload.commentId
            );
            if (comment) {
              comment.userLiked = action.payload.liked;
              comment.likes += action.payload.liked ? 1 : -1;
            }
          }
        }
      });
  },
});

export const {
  setActivePost,
  updateFilters,
  setPage,
  clearFilters,
} = communitySlice.actions;

export default communitySlice.reducer;

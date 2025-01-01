import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Avatar,
  Box,
  TextField,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  isAnonymous: boolean;
}

interface Post {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  category: string;
  isAnonymous: boolean;
  comments: Comment[];
}

interface Props {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

const PostCard: React.FC<Props> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>
            {post.isAnonymous ? 'A' : post.authorName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">
              {post.isAnonymous ? 'Anonymous' : post.authorName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </Typography>
          </Box>
          <Chip
            label={post.category}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            startIcon={post.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
            onClick={() => onLike(post.id)}
          >
            {post.likes}
          </Button>
          <Button
            size="small"
            startIcon={<Comment />}
            onClick={() => setShowComments(!showComments)}
          >
            {post.comments.length}
          </Button>
          <Button size="small" startIcon={<Share />}>
            Share
          </Button>
        </Box>
      </CardContent>

      <Collapse in={showComments}>
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              maxRows={3}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>
          </Box>

          {post.comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                  {comment.isAnonymous ? 'A' : comment.authorName[0]}
                </Avatar>
                <Typography variant="subtitle2">
                  {comment.isAnonymous ? 'Anonymous' : comment.authorName}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ ml: 1 }}
                >
                  {formatDistanceToNow(new Date(comment.timestamp), {
                    addSuffix: true,
                  })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4 }}>
                {comment.content}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PostCard;

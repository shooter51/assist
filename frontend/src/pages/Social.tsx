import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  platform: 'twitter' | 'facebook';
}

const Social: React.FC = () => {
  const [openPost, setOpenPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'facebook'>('twitter');

  // Mock data - replace with actual data from API
  const posts: Post[] = [
    {
      id: '1',
      author: {
        name: 'John Doe',
        avatar: 'JD',
      },
      content: 'Just finished setting up the new AI assistant! 🚀 #AI #Tech',
      timestamp: '2024-03-20 14:30',
      likes: 42,
      comments: 5,
      platform: 'twitter',
    },
    {
      id: '2',
      author: {
        name: 'Sarah Smith',
        avatar: 'SS',
      },
      content: 'Excited to share our latest project updates with the team!',
      timestamp: '2024-03-19 16:45',
      likes: 28,
      comments: 3,
      platform: 'facebook',
    },
  ];

  const handlePost = () => {
    // Implement post creation logic
    setPostContent('');
    setOpenPost(false);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Social Media Feed</Typography>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={() => setOpenPost(true)}
              >
                New Post
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>{post.author.avatar}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{post.author.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.timestamp} • {post.platform}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button startIcon={<FavoriteIcon />} size="small">
                      {post.likes}
                    </Button>
                    <Button startIcon={<CommentIcon />} size="small">
                      {post.comments}
                    </Button>
                    <Button startIcon={<ShareIcon />} size="small">
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* New Post Dialog */}
        <Dialog open={openPost} onClose={() => setOpenPost(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Twitter"
                onClick={() => setSelectedPlatform('twitter')}
                color={selectedPlatform === 'twitter' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Facebook"
                onClick={() => setSelectedPlatform('facebook')}
                color={selectedPlatform === 'facebook' ? 'primary' : 'default'}
              />
            </Box>
            <TextField
              label="What's on your mind?"
              fullWidth
              multiline
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <IconButton>
                <ImageIcon />
              </IconButton>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPost(false)}>Cancel</Button>
            <Button
              onClick={handlePost}
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!postContent.trim()}
            >
              Post
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Social; 
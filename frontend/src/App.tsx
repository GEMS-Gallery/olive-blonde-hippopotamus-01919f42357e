import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardActions, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AuthClient } from '@dfinity/auth-client';

interface Post {
  id: bigint;
  title: string;
  content: string;
  timestamp: bigint;
  author: string | null;
  authorPrincipal: string | null;
}

interface AppProps {
  authClient: AuthClient;
}

const App: React.FC<AppProps> = ({ authClient }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, []);

  const checkAuth = async () => {
    const isAuth = await authClient.isAuthenticated();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      const principal = await authClient.getIdentity().getPrincipal().toText();
      setUserPrincipal(principal);
    }
  };

  const login = async () => {
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: () => {
        checkAuth();
      },
    });
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal(null);
  };

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await backend.getPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      alert('Please login to create a post');
      return;
    }
    setLoading(true);
    try {
      const result = await backend.createPost(newPost.title, newPost.content, [newPost.author]);
      if ('ok' in result) {
        setOpenDialog(false);
        setNewPost({ title: '', content: '', author: '' });
        fetchPosts();
      } else {
        console.error('Error creating post:', result.err);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Crypto Blog
          </Typography>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Logged in as: {userPrincipal}
              </Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" onClick={login}>Login with Internet Identity</Button>
          )}
          <Button color="inherit" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            New Post
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={4}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={Number(post.id)}>
                <Card className="h-full flex flex-col">
                  <CardContent className="flex-grow">
                    <Typography gutterBottom variant="h5" component="div">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(Number(post.timestamp) / 1000000).toLocaleString()}
                    </Typography>
                    {post.author && (
                      <Typography variant="caption" color="text.secondary" className="ml-auto">
                        by {post.author}
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Content"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Author (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.author}
            onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePost} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <footer className="bg-gray-200 py-4 mt-8">
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2023 Crypto Blog. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
};

export default App;

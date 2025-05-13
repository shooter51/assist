import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
}

const Email: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [openCompose, setOpenCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
  });

  // Mock data - replace with actual data from API
  const emails: Email[] = [
    {
      id: '1',
      from: 'john@example.com',
      subject: 'Project Update',
      preview: 'Here are the latest updates on the project...',
      date: '2024-03-20 10:30',
      read: false,
    },
    {
      id: '2',
      from: 'sarah@example.com',
      subject: 'Meeting Notes',
      preview: 'Attached are the notes from our meeting...',
      date: '2024-03-19 15:45',
      read: true,
    },
  ];

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCompose = () => {
    // Implement email composition logic
    setComposeData({ to: '', subject: '', body: '' });
    setOpenCompose(false);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Email List */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Inbox</Typography>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => setOpenCompose(true)}
                  >
                    Compose
                  </Button>
                </Box>
                <List>
                  {emails.map((email) => (
                    <React.Fragment key={email.id}>
                      <ListItem
                        button
                        onClick={() => handleEmailClick(email)}
                        selected={selectedEmail?.id === email.id}
                      >
                        <ListItemAvatar>
                          <Avatar>{email.from[0].toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={email.subject}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {email.from}
                              </Typography>
                              {` — ${email.preview}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Email Content */}
          <Grid item xs={12} md={8}>
            {selectedEmail ? (
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">{selectedEmail.subject}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      From: {selectedEmail.from}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date: {selectedEmail.date}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">{selectedEmail.preview}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button startIcon={<ReplyIcon />}>Reply</Button>
                    <Button startIcon={<ForwardIcon />}>Forward</Button>
                    <Button startIcon={<DeleteIcon />} color="error">
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Select an email to view its content
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Compose Dialog */}
        <Dialog open={openCompose} onClose={() => setOpenCompose(false)} maxWidth="md" fullWidth>
          <DialogTitle>New Message</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="To"
                  fullWidth
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject"
                  fullWidth
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={6}
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCompose(false)}>Cancel</Button>
            <Button onClick={handleCompose} variant="contained">
              Send
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Email; 
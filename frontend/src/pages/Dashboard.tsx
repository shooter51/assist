import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  // Mock data - replace with actual data from API
  const stats = [
    { title: 'Files', value: '1,234', icon: <FolderIcon /> },
    { title: 'Emails', value: '56', icon: <EmailIcon /> },
    { title: 'Social Posts', value: '89', icon: <ShareIcon /> },
  ];

  const recentActivity = [
    { type: 'file', text: 'New document uploaded: Project_Report.pdf', time: '2 hours ago' },
    { type: 'email', text: 'New email received from john@example.com', time: '3 hours ago' },
    { type: 'social', text: 'New post shared on Twitter', time: '5 hours ago' },
  ];

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.title}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4">{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.text}
                          secondary={activity.time}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard; 
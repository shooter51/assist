import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  Snackbar,
  FormGroup,
  Slider,
} from '@mui/material';
import Layout from '../components/Layout';
import useSettings from '../hooks/useSettings';
import useNotifications from '../hooks/useNotifications';

interface Settings {
  email: {
    enabled: boolean;
    server: string;
    port: string;
    username: string;
    password: string;
  };
  nas: {
    enabled: boolean;
    host: string;
    share: string;
    username: string;
    password: string;
  };
  social: {
    twitter: {
      enabled: boolean;
      apiKey: string;
      apiSecret: string;
    };
    facebook: {
      enabled: boolean;
      appId: string;
      appSecret: string;
    };
  };
  notifications: {
    email: boolean;
    desktop: boolean;
    sound: boolean;
    enabled: boolean;
    browser: boolean;
  };
}

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { playNotificationSound } = useNotifications();
  const [testVolume, setTestVolume] = useState(50);
  const [showTestAlert, setShowTestAlert] = useState(false);

  const handleSave = () => {
    // Implement settings save logic
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [setting]: event.target.checked,
      },
    });
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setTestVolume(newValue as number);
  };

  const handleTestSound = () => {
    playNotificationSound();
    setShowTestAlert(true);
    setTimeout(() => setShowTestAlert(false), 3000);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>

            {/* Email Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Email Integration
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email.enabled}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, enabled: e.target.checked },
                      })
                    }
                  />
                }
                label="Enable Email Integration"
              />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="SMTP Server"
                    fullWidth
                    value={settings.email.server}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, server: e.target.value },
                      })
                    }
                    disabled={!settings.email.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Port"
                    fullWidth
                    value={settings.email.port}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, port: e.target.value },
                      })
                    }
                    disabled={!settings.email.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Username"
                    fullWidth
                    value={settings.email.username}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, username: e.target.value },
                      })
                    }
                    disabled={!settings.email.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={settings.email.password}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, password: e.target.value },
                      })
                    }
                    disabled={!settings.email.enabled}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* NAS Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                NAS Integration
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.nas.enabled}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        nas: { ...settings.nas, enabled: e.target.checked },
                      })
                    }
                  />
                }
                label="Enable NAS Integration"
              />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Host"
                    fullWidth
                    value={settings.nas.host}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        nas: { ...settings.nas, host: e.target.value },
                      })
                    }
                    disabled={!settings.nas.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Share"
                    fullWidth
                    value={settings.nas.share}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        nas: { ...settings.nas, share: e.target.value },
                      })
                    }
                    disabled={!settings.nas.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Username"
                    fullWidth
                    value={settings.nas.username}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        nas: { ...settings.nas, username: e.target.value },
                      })
                    }
                    disabled={!settings.nas.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={settings.nas.password}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        nas: { ...settings.nas, password: e.target.value },
                      })
                    }
                    disabled={!settings.nas.enabled}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Social Media Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Social Media Integration
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Twitter
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.social.twitter.enabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            social: {
                              ...settings.social,
                              twitter: {
                                ...settings.social.twitter,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                    }
                    label="Enable Twitter Integration"
                  />
                  <TextField
                    label="API Key"
                    fullWidth
                    value={settings.social.twitter.apiKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          twitter: {
                            ...settings.social.twitter,
                            apiKey: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={!settings.social.twitter.enabled}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    label="API Secret"
                    type="password"
                    fullWidth
                    value={settings.social.twitter.apiSecret}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          twitter: {
                            ...settings.social.twitter,
                            apiSecret: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={!settings.social.twitter.enabled}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Facebook
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.social.facebook.enabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            social: {
                              ...settings.social,
                              facebook: {
                                ...settings.social.facebook,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                    }
                    label="Enable Facebook Integration"
                  />
                  <TextField
                    label="App ID"
                    fullWidth
                    value={settings.social.facebook.appId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          facebook: {
                            ...settings.social.facebook,
                            appId: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={!settings.social.facebook.enabled}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    label="App Secret"
                    type="password"
                    fullWidth
                    value={settings.social.facebook.appSecret}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          facebook: {
                            ...settings.social.facebook,
                            appSecret: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={!settings.social.facebook.enabled}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Notification Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.desktop}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          desktop: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Desktop Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sound}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          sound: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Sound Notifications"
              />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave}>
                Save Settings
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Settings saved successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Settings; 
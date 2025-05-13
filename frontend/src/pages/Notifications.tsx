import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Folder as FolderIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format } from 'date-fns';
import useNotifications from '../hooks/useNotifications';
import Layout from '../components/Layout';
import NotificationActions from '../components/NotificationActions';

type NotificationType = 'all' | 'email' | 'file' | 'social';
type TimeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'older';

const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    groupedNotifications,
    markAsRead,
    markAllAsRead,
    clear,
    clearAll,
    scheduleNotification,
    cancelScheduledNotification,
  } = useNotifications();

  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon />;
      case 'file':
        return <FolderIcon />;
      case 'social':
        return <ShareIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const filteredGroups = useMemo(() => {
    return groupedNotifications.filter((group) => {
      // Type filter
      if (typeFilter !== 'all' && group.type !== typeFilter) {
        return false;
      }

      // Time filter
      const date = new Date(group.latestTimestamp);
      if (timeFilter !== 'all') {
        switch (timeFilter) {
          case 'today':
            if (!isToday(date)) return false;
            break;
          case 'yesterday':
            if (!isYesterday(date)) return false;
            break;
          case 'thisWeek':
            if (!isThisWeek(date)) return false;
            break;
          case 'older':
            if (isToday(date) || isYesterday(date) || isThisWeek(date)) return false;
            break;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return group.notifications.some(
          (notification) =>
            notification.title.toLowerCase().includes(query) ||
            notification.message.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [groupedNotifications, typeFilter, timeFilter, searchQuery]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setSelectedNotification(notificationId);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleScheduleClick = () => {
    setScheduleDialogOpen(true);
  };

  const handleScheduleClose = () => {
    setScheduleDialogOpen(false);
    setScheduledTime('');
  };

  const handleScheduleSubmit = () => {
    if (selectedNotification && scheduledTime) {
      const notification = notifications.find((n) => n.id === selectedNotification);
      if (notification) {
        scheduleNotification(
          {
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
          },
          new Date(scheduledTime)
        );
      }
    }
    handleScheduleClose();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate to the relevant page based on notification type and data
    switch (notification.type) {
      case 'email':
        // Navigate to email view
        break;
      case 'file':
        // Navigate to file view
        break;
      case 'social':
        // Navigate to social post
        break;
    }
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Notifications</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton onClick={handleFilterClick}>
                  <FilterListIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </Box>
            </Box>

            <Tabs
              value={typeFilter}
              onChange={(_, value) => setTypeFilter(value)}
              sx={{ mb: 2 }}
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    All
                    <Chip
                      size="small"
                      label={notifications.length}
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                value="all"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Email
                    <Chip
                      size="small"
                      label={notifications.filter((n) => n.type === 'email').length}
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                value="email"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Files
                    <Chip
                      size="small"
                      label={notifications.filter((n) => n.type === 'file').length}
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                value="file"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Social
                    <Chip
                      size="small"
                      label={notifications.filter((n) => n.type === 'social').length}
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                value="social"
              />
            </Tabs>

            <List>
              {filteredGroups.map((group) => (
                <React.Fragment key={group.id}>
                  <ListItem
                    button
                    onClick={() => toggleGroup(group.id)}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon>{getNotificationIcon(group.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                          </Typography>
                          <Chip
                            size="small"
                            label={group.unreadCount}
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={format(new Date(group.latestTimestamp), 'MMM d, yyyy')}
                    />
                    <ListItemSecondaryAction>
                      {expandedGroups.has(group.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Collapse in={expandedGroups.has(group.id)}>
                    <List component="div" disablePadding>
                      {group.notifications.map((notification) => (
                        <ListItem
                          key={notification.id}
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            pl: 4,
                            bgcolor: notification.read ? 'inherit' : 'action.hover',
                            '&:hover': {
                              bgcolor: 'action.selected',
                            },
                          }}
                        >
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ display: 'block' }}
                                >
                                  {notification.message}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDistanceToNow(new Date(notification.timestamp), {
                                    addSuffix: true,
                                  })}
                                  {notification.scheduledFor && (
                                    <>
                                      {' • Scheduled for '}
                                      {format(new Date(notification.scheduledFor), 'PPp')}
                                    </>
                                  )}
                                </Typography>
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <NotificationActions
                              notification={notification}
                              onMarkAsRead={markAsRead}
                              onDelete={clear}
                              onSchedule={scheduleNotification}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            {filteredGroups.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No notifications found</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={handleFilterClose}
        >
          <MenuItem
            selected={timeFilter === 'all'}
            onClick={() => {
              setTimeFilter('all');
              handleFilterClose();
            }}
          >
            All Time
          </MenuItem>
          <MenuItem
            selected={timeFilter === 'today'}
            onClick={() => {
              setTimeFilter('today');
              handleFilterClose();
            }}
          >
            Today
          </MenuItem>
          <MenuItem
            selected={timeFilter === 'yesterday'}
            onClick={() => {
              setTimeFilter('yesterday');
              handleFilterClose();
            }}
          >
            Yesterday
          </MenuItem>
          <MenuItem
            selected={timeFilter === 'thisWeek'}
            onClick={() => {
              setTimeFilter('thisWeek');
              handleFilterClose();
            }}
          >
            This Week
          </MenuItem>
          <MenuItem
            selected={timeFilter === 'older'}
            onClick={() => {
              setTimeFilter('older');
              handleFilterClose();
            }}
          >
            Older
          </MenuItem>
        </Menu>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionClose}
        >
          {selectedNotification && (
            <>
              <MenuItem
                onClick={() => {
                  markAsRead(selectedNotification);
                  handleActionClose();
                }}
              >
                <ListItemIcon>
                  <CheckIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mark as read</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleScheduleClick}>
                <ListItemIcon>
                  <ScheduleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Schedule</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  clear(selectedNotification);
                  handleActionClose();
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={handleScheduleClose}>
          <DialogTitle>Schedule Notification</DialogTitle>
          <DialogContent>
            <TextField
              type="datetime-local"
              label="Schedule Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleScheduleClose}>Cancel</Button>
            <Button onClick={handleScheduleSubmit} variant="contained">
              Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Notifications; 
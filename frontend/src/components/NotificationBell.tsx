import React, { useState, useMemo } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Collapse,
  Fade,
  Grow,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Folder as FolderIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import useNotifications from '../hooks/useNotifications';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    today: true,
    yesterday: true,
    thisWeek: true,
    older: true,
  });
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clear,
    clearAll,
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const groupedNotifications = useMemo(() => {
    const groups: GroupedNotifications = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const date = new Date(notification.timestamp);
      if (isToday(date)) {
        groups.today.push(notification);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderNotificationGroup = (
    title: string,
    notifications: Notification[],
    groupKey: string
  ) => {
    if (notifications.length === 0) return null;

    return (
      <Box key={groupKey}>
        <ListItem
          button
          onClick={() => toggleGroup(groupKey)}
          sx={{ py: 1 }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">{title}</Typography>
                <Chip
                  size="small"
                  label={notifications.length}
                  color="primary"
                  sx={{ height: 20 }}
                />
              </Box>
            }
          />
          {expandedGroups[groupKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
        <Collapse in={expandedGroups[groupKey]}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <Grow
                key={notification.id}
                in={true}
                style={{ transformOrigin: '0 0 0' }}
                timeout={300}
              >
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                    pl: 4,
                  }}
                >
                  <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
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
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => clear(notification.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              </Grow>
            ))}
          </List>
        </Collapse>
        <Divider />
      </Box>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => {
                markAllAsRead();
                handleClose();
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {renderNotificationGroup('Today', groupedNotifications.today, 'today')}
            {renderNotificationGroup('Yesterday', groupedNotifications.yesterday, 'yesterday')}
            {renderNotificationGroup('This Week', groupedNotifications.thisWeek, 'thisWeek')}
            {renderNotificationGroup('Older', groupedNotifications.older, 'older')}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              color="error"
              onClick={() => {
                clearAll();
                handleClose();
              }}
            >
              Clear all
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 
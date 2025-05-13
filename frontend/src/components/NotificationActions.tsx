import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  OpenInNew as OpenInNewIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { emailApi, fileApi, socialApi } from '../services/api';

interface NotificationActionsProps {
  notification: {
    id: string;
    type: 'email' | 'file' | 'social';
    title: string;
    message: string;
    data?: any;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (notification: any, scheduledFor: Date) => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onSchedule,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setIsLoading(true);
    try {
      switch (notification.type) {
        case 'email':
          await emailApi.reply(notification.data.emailId, replyText);
          break;
        case 'social':
          await socialApi.reply(notification.data.postId, replyText);
          break;
      }
      setReplyDialogOpen(false);
      setReplyText('');
      onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    switch (notification.type) {
      case 'email':
        navigate(`/email/${notification.data.emailId}`);
        break;
      case 'file':
        navigate(`/files/${notification.data.fileId}`);
        break;
      case 'social':
        navigate(`/social/${notification.data.postId}`);
        break;
    }
    onMarkAsRead(notification.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: notification.title,
        text: notification.message,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const handleSchedule = () => {
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 1); // Default to 1 hour from now
    onSchedule(notification, scheduledFor);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {notification.type === 'email' && (
          <MenuItem onClick={() => {
            setReplyDialogOpen(true);
            handleClose();
          }}>
            <ListItemIcon>
              <ReplyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Quick Reply</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          handleOpen();
          handleClose();
        }}>
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          handleShare();
          handleClose();
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          handleSchedule();
          handleClose();
        }}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          onMarkAsRead(notification.id);
          handleClose();
        }}>
          <ListItemIcon>
            <CheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as read</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          onDelete(notification.id);
          handleClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quick Reply</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Original Message:
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {notification.message}
            </Typography>
            <TextField
              autoFocus
              multiline
              rows={4}
              fullWidth
              label="Your Reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReply}
            variant="contained"
            disabled={isLoading || !replyText.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationActions; 
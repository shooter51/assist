import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import useEmail from '../hooks/useEmail';
import { Email } from '../services/emailApi';

interface EmailDetailProps {
  email: Email;
  onReply: () => void;
  onForward: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onReply, onForward }) => {
  const {
    starEmail,
    deleteEmail,
    moveEmail,
    updateLabels,
  } = useEmail();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'star':
          await starEmail(email.id, !email.starred);
          break;
        case 'archive':
          await moveEmail(email.id, 'archive');
          break;
        case 'delete':
          await deleteEmail(email.id);
          break;
        case 'label':
          // TODO: Implement label selection dialog
          break;
      }
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const renderAttachments = () => {
    if (!email.attachments?.length) return null;

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Attachments
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {email.attachments.map((attachment) => (
            <Chip
              key={attachment.id}
              icon={<AttachFileIcon />}
              label={`${attachment.filename} (${formatFileSize(attachment.size)})`}
              onClick={() => window.open(attachment.url, '_blank')}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Email Header */}
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="h2" gutterBottom>
            {email.subject}
          </Typography>
          <Box>
            <Tooltip title={email.starred ? 'Unstar' : 'Star'}>
              <IconButton
                onClick={() => starEmail(email.id, !email.starred)}
                disabled={isLoading}
              >
                {email.starred ? <StarIcon color="primary" /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleMenuOpen} disabled={isLoading}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle2">{email.from}</Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(email.timestamp), 'PPpp')}
          </Typography>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          <Typography variant="body2" color="text.secondary">
            To: {email.to.join(', ')}
          </Typography>
          {email.cc && (
            <Typography variant="body2" color="text.secondary">
              CC: {email.cc.join(', ')}
            </Typography>
          )}
        </Box>

        {email.labels?.length > 0 && (
          <Box display="flex" gap={1} mb={2}>
            {email.labels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                icon={<LabelIcon />}
              />
            ))}
          </Box>
        )}

        <Box display="flex" gap={1}>
          <Button
            startIcon={<ReplyIcon />}
            onClick={onReply}
            disabled={isLoading}
          >
            Reply
          </Button>
          <Button
            startIcon={<ReplyAllIcon />}
            onClick={onReply}
            disabled={isLoading}
          >
            Reply All
          </Button>
          <Button
            startIcon={<ForwardIcon />}
            onClick={onForward}
            disabled={isLoading}
          >
            Forward
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Email Body */}
      <Box p={2} flex={1} sx={{ overflow: 'auto' }}>
        {email.htmlBody ? (
          <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
        ) : (
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              m: 0,
            }}
          >
            {email.body}
          </Typography>
        )}

        {renderAttachments()}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('star')}>
          <ListItemIcon>
            {email.starred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {email.starred ? 'Unstar' : 'Star'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('label')}>
          <ListItemIcon>
            <LabelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Label</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.7)"
        >
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default EmailDetail; 
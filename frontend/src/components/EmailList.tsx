import React, { useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import useEmail from '../hooks/useEmail';
import { Email } from '../services/emailApi';

interface EmailListProps {
  onSelectEmail: (email: Email) => void;
}

type SortField = 'date' | 'subject' | 'from';
type SortOrder = 'asc' | 'desc';

const EmailList: React.FC<EmailListProps> = ({ onSelectEmail }) => {
  const {
    emails,
    isLoading,
    error,
    filters,
    setFilters,
    starEmail,
    deleteEmail,
    moveEmail,
  } = useEmail();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Filter and sort emails
  const filteredEmails = useMemo(() => {
    let result = [...emails];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.from.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'from':
          comparison = a.from.localeCompare(b.from);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [emails, searchQuery, sortField, sortOrder]);

  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, emailId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEmailId(emailId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEmailId(null);
  };

  const handleAction = (action: string) => {
    if (!selectedEmailId) return;

    switch (action) {
      case 'star':
        starEmail(selectedEmailId, true);
        break;
      case 'unstar':
        starEmail(selectedEmailId, false);
        break;
      case 'archive':
        moveEmail(selectedEmailId, 'archive');
        break;
      case 'delete':
        deleteEmail(selectedEmailId);
        break;
    }

    handleMenuClose();
  };

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading emails: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box p={2} display="flex" gap={2} alignItems="center">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search emails..."
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
        <Tooltip title="Sort">
          <IconButton
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <SortIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Email List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredEmails.map((email) => (
            <ListItem
              key={email.id}
              button
              onClick={() => onSelectEmail(email)}
              sx={{
                bgcolor: email.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    starEmail(email.id, !email.starred);
                  }}
                >
                  {email.starred ? (
                    <StarIcon color="primary" />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      component="span"
                      variant="subtitle2"
                      sx={{ fontWeight: email.read ? 'normal' : 'bold' }}
                    >
                      {email.from}
                    </Typography>
                    {email.labels?.map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        sx={{ height: 20 }}
                      />
                    ))}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: email.read ? 'normal' : 'bold' }}
                    >
                      {email.subject}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {formatDistanceToNow(new Date(email.timestamp), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuOpen(e, email.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('star')}>
          <ListItemIcon>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Star</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EmailList; 
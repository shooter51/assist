import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Badge,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Label as LabelIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import useEmail from '../hooks/useEmail';
import LabelDialog from './LabelDialog';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface EmailFoldersProps {
  onFolderSelect: (folder: string) => void;
  selectedFolder: string;
}

const EmailFolders: React.FC<EmailFoldersProps> = ({
  onFolderSelect,
  selectedFolder,
}) => {
  const { stats } = useEmail();
  const [expanded, setExpanded] = React.useState({
    labels: true,
  });
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labels, setLabels] = useState<Label[]>([
    { id: 'starred', name: 'Starred', color: '#FFD700' },
    { id: 'important', name: 'Important', color: '#FF6B6B' },
    { id: 'work', name: 'Work', color: '#4CAF50' },
    { id: 'personal', name: 'Personal', color: '#2196F3' },
  ]);

  const handleExpandClick = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLabelDialogOpen = () => {
    setLabelDialogOpen(true);
  };

  const handleLabelDialogClose = () => {
    setLabelDialogOpen(false);
  };

  const handleLabelsSave = (newLabels: Label[]) => {
    setLabels(newLabels);
  };

  const mainFolders = [
    {
      id: 'inbox',
      name: 'Inbox',
      icon: <InboxIcon />,
      count: stats?.byFolder.inbox || 0,
    },
    {
      id: 'sent',
      name: 'Sent',
      icon: <SendIcon />,
      count: stats?.byFolder.sent || 0,
    },
    {
      id: 'drafts',
      name: 'Drafts',
      icon: <DraftsIcon />,
      count: stats?.byFolder.drafts || 0,
    },
    {
      id: 'archive',
      name: 'Archive',
      icon: <ArchiveIcon />,
      count: stats?.byFolder.archive || 0,
    },
    {
      id: 'trash',
      name: 'Trash',
      icon: <DeleteIcon />,
      count: stats?.byFolder.trash || 0,
    },
  ];

  return (
    <Box sx={{ width: 240, bgcolor: 'background.paper' }}>
      <List component="nav" sx={{ width: '100%' }}>
        {/* Main Folders */}
        {mainFolders.map((folder) => (
          <ListItem key={folder.id} disablePadding>
            <ListItemButton
              selected={selectedFolder === folder.id}
              onClick={() => onFolderSelect(folder.id)}
            >
              <ListItemIcon>{folder.icon}</ListItemIcon>
              <ListItemText primary={folder.name} />
              {folder.count > 0 && (
                <Badge
                  badgeContent={folder.count}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Labels Section */}
        <ListItem>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">
                  Labels
                </Typography>
                <Tooltip title="Manage Labels">
                  <IconButton size="small" onClick={handleLabelDialogOpen}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          <IconButton
            onClick={() => handleExpandClick('labels')}
            size="small"
          >
            {expanded.labels ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItem>

        <Collapse in={expanded.labels} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {labels.map((label) => (
              <ListItem key={label.id} disablePadding>
                <ListItemButton
                  selected={selectedFolder === label.id}
                  onClick={() => onFolderSelect(label.id)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <LabelIcon sx={{ color: label.color }} />
                  </ListItemIcon>
                  <ListItemText primary={label.name} />
                  {stats?.byLabel[label.id] > 0 && (
                    <Badge
                      badgeContent={stats.byLabel[label.id]}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <LabelDialog
        open={labelDialogOpen}
        onClose={handleLabelDialogClose}
        onSave={handleLabelsSave}
        initialLabels={labels}
      />
    </Box>
  );
};

export default EmailFolders; 
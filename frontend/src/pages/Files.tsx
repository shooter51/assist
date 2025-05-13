import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  CreateNewFolder as CreateFolderIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
}

const Files: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [openUpload, setOpenUpload] = useState(false);
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Mock data - replace with actual data from API
  const files: FileItem[] = [
    { id: '1', name: 'Documents', type: 'folder', modified: '2024-03-20' },
    { id: '2', name: 'Images', type: 'folder', modified: '2024-03-19' },
    { id: '3', name: 'report.pdf', type: 'file', size: '2.5 MB', modified: '2024-03-18' },
    { id: '4', name: 'presentation.pptx', type: 'file', size: '5.1 MB', modified: '2024-03-17' },
  ];

  const handlePathClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleUpload = () => {
    // Implement file upload logic
    setOpenUpload(false);
  };

  const handleCreateFolder = () => {
    // Implement folder creation logic
    setNewFolderName('');
    setOpenNewFolder(false);
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Card>
          <CardContent>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
              {currentPath.map((path, index) => (
                <Link
                  key={index}
                  color="inherit"
                  href="#"
                  onClick={() => handlePathClick(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  {path}
                </Link>
              ))}
            </Breadcrumbs>

            {/* Action Buttons */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUpload(true)}
              >
                Upload
              </Button>
              <Button
                variant="outlined"
                startIcon={<CreateFolderIcon />}
                onClick={() => setOpenNewFolder(true)}
              >
                New Folder
              </Button>
            </Box>

            {/* File List */}
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  button={file.type === 'folder'}
                  onClick={() => file.type === 'folder' && handleFolderClick(file.name)}
                >
                  <ListItemIcon>
                    {file.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${file.size || ''} • Modified: ${file.modified}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, border: '2px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
              <Typography>Drag and drop files here or click to select</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Folder Dialog */}
        <Dialog open={openNewFolder} onClose={() => setOpenNewFolder(false)}>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Files; 
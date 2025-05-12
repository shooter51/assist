import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  Autocomplete,
  colors,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Label as LabelIcon,
} from '@mui/icons-material';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (labels: Label[]) => void;
  initialLabels: Label[];
}

const predefinedColors = [
  colors.red[500],
  colors.pink[500],
  colors.purple[500],
  colors.deepPurple[500],
  colors.indigo[500],
  colors.blue[500],
  colors.lightBlue[500],
  colors.cyan[500],
  colors.teal[500],
  colors.green[500],
  colors.lightGreen[500],
  colors.lime[500],
  colors.yellow[500],
  colors.amber[500],
  colors.orange[500],
  colors.deepOrange[500],
];

const LabelDialog: React.FC<LabelDialogProps> = ({
  open,
  onClose,
  onSave,
  initialLabels,
}) => {
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(predefinedColors[0]);

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;

    const newLabel: Label = {
      id: Date.now().toString(),
      name: newLabelName.trim(),
      color: newLabelColor,
    };

    setLabels(prev => [...prev, newLabel]);
    setNewLabelName('');
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
  };

  const handleSaveEdit = () => {
    if (!editingLabel || !newLabelName.trim()) return;

    setLabels(prev =>
      prev.map(label =>
        label.id === editingLabel.id
          ? { ...label, name: newLabelName.trim(), color: newLabelColor }
          : label
      )
    );

    setEditingLabel(null);
    setNewLabelName('');
  };

  const handleDeleteLabel = (labelId: string) => {
    setLabels(prev => prev.filter(label => label.id !== labelId));
  };

  const handleSave = () => {
    onSave(labels);
    onClose();
  };

  const handleCancel = () => {
    setLabels(initialLabels);
    setEditingLabel(null);
    setNewLabelName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Labels</DialogTitle>
      <DialogContent>
        {/* Add/Edit Label Form */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            {editingLabel ? 'Edit Label' : 'Add New Label'}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  editingLabel ? handleSaveEdit() : handleAddLabel();
                }
              }}
            />
            <Autocomplete
              value={newLabelColor}
              onChange={(_, newValue) => setNewLabelColor(newValue || predefinedColors[0])}
              options={predefinedColors}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{ width: 100 }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  {...props}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: option,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            />
            <IconButton
              color="primary"
              onClick={editingLabel ? handleSaveEdit : handleAddLabel}
              disabled={!newLabelName.trim()}
            >
              {editingLabel ? <EditIcon /> : <AddIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Labels List */}
        <List>
          {labels.map((label) => (
            <ListItem
              key={label.id}
              sx={{
                bgcolor: editingLabel?.id === label.id ? 'action.selected' : 'transparent',
              }}
            >
              <Chip
                icon={<LabelIcon />}
                label={label.name}
                sx={{
                  bgcolor: label.color,
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleEditLabel(label)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteLabel(label.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabelDialog; 
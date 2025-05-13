import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import useEmail from '../hooks/useEmail';
import { Email, EmailDraft, Attachment } from '../services/emailApi';

interface EmailComposeProps {
  mode: 'new' | 'reply' | 'forward';
  originalEmail?: Email;
  onClose: () => void;
}

const EmailCompose: React.FC<EmailComposeProps> = ({
  mode,
  originalEmail,
  onClose,
}) => {
  const { sendEmail, uploadAttachment } = useEmail();
  const [draft, setDraft] = useState<EmailDraft>({
    to: mode === 'reply' ? [originalEmail?.from || ''] : [],
    cc: mode === 'reply' ? originalEmail?.cc : [],
    subject: mode === 'reply' 
      ? `Re: ${originalEmail?.subject}`
      : mode === 'forward'
      ? `Fwd: ${originalEmail?.subject}`
      : '',
    body: mode === 'reply'
      ? `\n\nOn ${new Date(originalEmail?.timestamp || '').toLocaleString()}, ${originalEmail?.from} wrote:\n${originalEmail?.body}`
      : mode === 'forward'
      ? `\n\n---------- Forwarded message ---------\nFrom: ${originalEmail?.from}\nDate: ${new Date(originalEmail?.timestamp || '').toLocaleString()}\nSubject: ${originalEmail?.subject}\n\n${originalEmail?.body}`
      : '',
    attachments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setIsLoading(true);
      try {
        const uploadedAttachments = await Promise.all(
          acceptedFiles.map(file => uploadAttachment(file))
        );
        setDraft(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), ...uploadedAttachments],
        }));
      } catch (err) {
        setError('Failed to upload attachments');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSend = async () => {
    if (!draft.to.length) {
      setError('Recipients are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendEmail(draft);
      onClose();
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (draft.body || draft.subject || draft.attachments?.length) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setDraft(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== attachmentId) || [],
    }));
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          {mode === 'new' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
        </Typography>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Compose Form */}
      <Box p={2} flex={1} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="To"
          value={draft.to.join(', ')}
          onChange={(e) => setDraft(prev => ({ ...prev, to: e.target.value.split(',').map(s => s.trim()) }))}
          fullWidth
          error={!!error && !draft.to.length}
          helperText={error && !draft.to.length ? 'Recipients are required' : ''}
        />

        <TextField
          label="CC"
          value={draft.cc?.join(', ') || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, cc: e.target.value.split(',').map(s => s.trim()) }))}
          fullWidth
        />

        <TextField
          label="Subject"
          value={draft.subject}
          onChange={(e) => setDraft(prev => ({ ...prev, subject: e.target.value }))}
          fullWidth
        />

        <TextField
          label="Message"
          value={draft.body}
          onChange={(e) => setDraft(prev => ({ ...prev, body: e.target.value }))}
          fullWidth
          multiline
          rows={10}
          sx={{ flex: 1 }}
        />

        {/* Attachments */}
        {draft.attachments?.length > 0 && (
          <Box display="flex" gap={1} flexWrap="wrap">
            {draft.attachments.map((attachment) => (
              <Chip
                key={attachment.id}
                label={`${attachment.filename} (${formatFileSize(attachment.size)})`}
                onDelete={() => removeAttachment(attachment.id)}
                disabled={isLoading}
              />
            ))}
          </Box>
        )}

        {/* Dropzone */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <AttachFileIcon sx={{ mr: 1 }} />
          {isDragActive ? (
            <Typography>Drop the files here...</Typography>
          ) : (
            <Typography>Drag and drop files here, or click to select files</Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleClose}
          disabled={isLoading}
        >
          Discard
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSend}
          disabled={isLoading}
        >
          Send
        </Button>
      </Box>

      {/* Loading Overlay */}
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

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Discard Draft?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard this draft?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={onClose} color="error">
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default EmailCompose; 
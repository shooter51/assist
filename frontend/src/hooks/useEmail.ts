import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import emailApi, { Email, EmailDraft, Attachment } from '../services/emailApi';

interface EmailFilters {
  folder?: string;
  search?: string;
  labels?: string[];
}

interface EmailStats {
  total: number;
  unread: number;
  starred: number;
  byFolder: {
    inbox: number;
    sent: number;
    drafts: number;
    trash: number;
    archive: number;
  };
}

interface EmailHook {
  emails: Email[];
  selectedEmail: Email | null;
  stats: EmailStats | null;
  isLoading: boolean;
  error: Error | null;
  filters: EmailFilters;
  setFilters: (filters: EmailFilters) => void;
  selectEmail: (id: string) => void;
  sendEmail: (draft: EmailDraft) => Promise<void>;
  replyToEmail: (id: string, body: string) => Promise<void>;
  forwardEmail: (id: string, to: string[]) => Promise<void>;
  moveEmail: (id: string, folder: string) => Promise<void>;
  markAsRead: (id: string, read: boolean) => Promise<void>;
  starEmail: (id: string, starred: boolean) => Promise<void>;
  updateLabels: (id: string, labels: string[]) => Promise<void>;
  deleteEmail: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  uploadAttachment: (file: File) => Promise<Attachment>;
}

const useEmail = (): EmailHook => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filters, setFilters] = useState<EmailFilters>({
    folder: 'inbox',
  });
  const queryClient = useQueryClient();

  // Fetch emails with filters
  const {
    data: emails = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['emails', filters],
    queryFn: () => emailApi.list(filters),
  });

  // Fetch email stats
  const { data: stats } = useQuery({
    queryKey: ['emailStats'],
    queryFn: emailApi.getStats,
  });

  // Fetch selected email
  const { data: selectedEmailData } = useQuery({
    queryKey: ['email', selectedEmail?.id],
    queryFn: () => (selectedEmail ? emailApi.get(selectedEmail.id) : null),
    enabled: !!selectedEmail,
  });

  // Mutations
  const sendMutation = useMutation({
    mutationFn: emailApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => emailApi.reply(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const forwardMutation = useMutation({
    mutationFn: ({ id, to }: { id: string; to: string[] }) => emailApi.forward(id, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, folder }: { id: string; folder: string }) => emailApi.move(id, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => emailApi.markAsRead(id, read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const starMutation = useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) => emailApi.star(id, starred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const labelsMutation = useMutation({
    mutationFn: ({ id, labels }: { id: string; labels: string[] }) => emailApi.updateLabels(id, labels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: emailApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: emailApi.permanentDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['emailStats'] });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: emailApi.uploadAttachment,
  });

  // Action handlers
  const selectEmail = useCallback((id: string) => {
    const email = emails.find((e) => e.id === id);
    if (email) {
      setSelectedEmail(email);
      if (!email.read) {
        markAsReadMutation.mutate({ id, read: true });
      }
    }
  }, [emails, markAsReadMutation]);

  const sendEmail = useCallback(async (draft: EmailDraft) => {
    await sendMutation.mutateAsync(draft);
  }, [sendMutation]);

  const replyToEmail = useCallback(async (id: string, body: string) => {
    await replyMutation.mutateAsync({ id, body });
  }, [replyMutation]);

  const forwardEmail = useCallback(async (id: string, to: string[]) => {
    await forwardMutation.mutateAsync({ id, to });
  }, [forwardMutation]);

  const moveEmail = useCallback(async (id: string, folder: string) => {
    await moveMutation.mutateAsync({ id, folder });
  }, [moveMutation]);

  const markAsRead = useCallback(async (id: string, read: boolean) => {
    await markAsReadMutation.mutateAsync({ id, read });
  }, [markAsReadMutation]);

  const starEmail = useCallback(async (id: string, starred: boolean) => {
    await starMutation.mutateAsync({ id, starred });
  }, [starMutation]);

  const updateLabels = useCallback(async (id: string, labels: string[]) => {
    await labelsMutation.mutateAsync({ id, labels });
  }, [labelsMutation]);

  const deleteEmail = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const permanentDelete = useCallback(async (id: string) => {
    await permanentDeleteMutation.mutateAsync(id);
  }, [permanentDeleteMutation]);

  const uploadAttachment = useCallback(async (file: File) => {
    return await uploadAttachmentMutation.mutateAsync(file);
  }, [uploadAttachmentMutation]);

  return {
    emails,
    selectedEmail: selectedEmailData || selectedEmail,
    stats,
    isLoading,
    error: error as Error | null,
    filters,
    setFilters,
    selectEmail,
    sendEmail,
    replyToEmail,
    forwardEmail,
    moveEmail,
    markAsRead,
    starEmail,
    updateLabels,
    deleteEmail,
    permanentDelete,
    uploadAttachment,
  };
};

export default useEmail; 
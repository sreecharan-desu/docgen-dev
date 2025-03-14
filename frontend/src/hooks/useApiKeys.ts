import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/utils/config';
import { useToast } from "@/components/ui/use-toast";

export function useApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API keys with React Query
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/auth/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create API key mutation
  const createApiKey = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/auth/create-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'free' }),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['api-keys']);
      toast({
        title: "Success",
        description: "New API key created successfully",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKey = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/auth/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete API key');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['api-keys']);
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
  });

  return {
    apiKeys,
    isLoading,
    createApiKey: createApiKey.mutate,
    deleteApiKey: deleteApiKey.mutate,
    isCreating: createApiKey.isLoading,
    isDeleting: deleteApiKey.isLoading,
  };
} 
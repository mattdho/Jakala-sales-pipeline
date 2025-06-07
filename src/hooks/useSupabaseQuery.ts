import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';
import { jobService } from '../services/jobService';
import { accountService } from '../services/accountService';
import { userService } from '../services/userService';

// Opportunities
export const useOpportunities = (filters?: any) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => opportunityService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunityService.getById(id),
    enabled: !!id,
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: opportunityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-metrics'] });
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      opportunityService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-metrics'] });
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: opportunityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-metrics'] });
    },
  });
};

export const useOpportunityMetrics = () => {
  return useQuery({
    queryKey: ['opportunity-metrics'],
    queryFn: opportunityService.getMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Jobs
export const useJobs = (filters?: any) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-metrics'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      jobService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['job-metrics'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-metrics'] });
    },
  });
};

export const useJobMetrics = () => {
  return useQuery({
    queryKey: ['job-metrics'],
    queryFn: jobService.getMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useJobDocuments = (jobId: string) => {
  return useQuery({
    queryKey: ['job-documents', jobId],
    queryFn: () => jobService.getDocuments(jobId),
    enabled: !!jobId,
  });
};

// Accounts
export const useAccounts = (filters?: any) => {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: () => accountService.getAll(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      accountService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', variables.id] });
    },
  });
};

// Users
export const useUsers = (filters?: any) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getAll(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      userService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};
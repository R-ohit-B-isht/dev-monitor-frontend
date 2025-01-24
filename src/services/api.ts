import axios from 'axios';
import { Task } from '../types/Task';

const API_BASE_URL = 'http://localhost:5000';

export interface MonitoringMetrics {
  focusTimeSeconds: number;
  focusTimePercentage: number;
  totalActivities: number;
  focusActivities: number;
  focusActivityRatio: number;
  productivityScore: number;
  newBadges: string[];
  aiMetrics: {
    linesOfCodeModified: number;
    filesChanged: number;
    testCoverage: number;
    responseTime: number;
  };
}

export interface ContributionData {
  months: {
    year: number;
    month: number;
    name: string;
    days: number;
    contributions: {
      date: string;
      count: number;
      intensity: number;
    }[];
  }[];
  totalContributions: number;
}

export interface Achievement {
  badge: string;
  earnedAt: string;
  metadata: {
    sessionId: string;
    productivityScore: number;
    focusTime: number;
    totalActivities: number;
  };
}



export interface ScheduleLimits {
  engineerId: string;
  dailyHourLimit: number;
  weeklyHourLimit: number;
  alertThreshold: number;
}

export interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  slack: boolean;
  scheduleAlerts: boolean;
  achievementAlerts: boolean;
}

export interface IntegrationSettings {
  github: string | null;
  jira: string | null;
  linear: string | null;
}

export interface DisplaySettings {
  theme: 'light' | 'dark';
  compactView: boolean;
  showAchievements: boolean;
  defaultView: 'board' | 'list' | 'table';
  createdAt?: string;
  updatedAt?: string;
}

export interface ValueStreamMetrics {
  avgIdeaToCode: number;
  avgCodeToReview: number;
  avgReviewToMerge: number;
  avgMergeToDeploy: number;
  totalTasks: number;
  inProgressTasks: number;
  doneTasks: number;
}

export interface ValueStreamTask {
  _id: string;
  title: string;
  status: string;
  ideaToCode: number;
  codeToReview: number;
  reviewToMerge: number;
  mergeToDeploy: number;
}

export interface Settings {
  engineerId: string;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  display: DisplaySettings;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAlert {
  _id: string;
  repository: string;
  alert_number: number;
  state: 'open' | 'fixed' | 'dismissed';
  severity: 'high' | 'medium' | 'low';
  description: string;
  location?: {
    path: string;
    start_line: number;
    end_line: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SecurityStats {
  total: number;
  open: number;
  fixed: number;
  dismissed: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
}



// Collaboration endpoints
const getActivityFeed = async (params?: {
  engineerId?: string;
  repository?: string;
  eventType?: string;
  days?: number;
}): Promise<{ activities: Activity[]; total: number }> => {
  const response = await axios.get(`${API_BASE_URL}/collab/activity`, { params });
  return response.data;
};

const getCollaborationStats = async (params?: {
  repository?: string;
  days?: number;
}): Promise<CollaborationStats> => {
  const response = await axios.get(`${API_BASE_URL}/collab/stats`, { params });
  return response.data;
};

export const api = {
  // Organization endpoints
  getOrganizationMetrics: async (days: number = 30): Promise<OrganizationMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/org/aggregations`, {
      params: { days }
    });
    return response.data;
  },

  // Security endpoints
  getSecurityAlerts: async (params?: { repository?: string; state?: string; severity?: string }): Promise<{ alerts: SecurityAlert[] }> => {
    const response = await axios.get(`${API_BASE_URL}/security/alerts`, { params });
    return response.data;
  },

  getSecurityStats: async (params?: { repository?: string }): Promise<SecurityStats> => {
    const response = await axios.get(`${API_BASE_URL}/security/alerts/stats`, { params });
    return response.data;
  },

  syncSecurityAlerts: async (repository: string): Promise<{ message: string; count: number }> => {
    const response = await axios.post(`${API_BASE_URL}/security/alerts/sync`, { repository });
    return response.data;
  },

  // Collaboration endpoints
  getActivityFeed,
  getCollaborationStats,
  // Value Stream Analytics endpoints
  getValueStreamMetrics: async (engineerId: string, params?: { days?: number }): Promise<{ metrics: ValueStreamMetrics; tasks: ValueStreamTask[] }> => {
    const response = await axios.get(`${API_BASE_URL}/value-stream/metrics/${engineerId}`, { params });
    return response.data;
  },

  recordValueStreamEvent: async (engineerId: string, data: {
    taskId: string;
    eventType: 'code_started' | 'code_completed' | 'review_started' | 'review_completed' | 'merged' | 'deployed';
    metadata?: Record<string, any>;
    sessionId?: string;
  }): Promise<{ eventId: string }> => {
    const response = await axios.post(`${API_BASE_URL}/value-stream/events/${engineerId}`, data);
    return response.data;
  },
  // Schedule endpoints
  getScheduleLimits: async (engineerId: string): Promise<ScheduleLimits> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/${engineerId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule limits:', error);
      throw error;
    }
  },

  setScheduleLimits: async (data: {
    engineerId: string;
    dailyHourLimit: number;
    weeklyHourLimit: number;
    alertThreshold?: number;
  }): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/settings/${data.engineerId}/schedule`, {
        dailyHourLimit: data.dailyHourLimit,
        weeklyHourLimit: data.weeklyHourLimit,
        alertThreshold: data.alertThreshold || 80
      });

      // Re-fetch to ensure data is persisted
      const response = await axios.get(`${API_BASE_URL}/settings/${data.engineerId}/schedule`);
      console.log('Schedule limits verification response:', response.data);

      if (response.data.dailyHourLimit !== data.dailyHourLimit ||
          response.data.weeklyHourLimit !== data.weeklyHourLimit) {
        throw new Error('Schedule limits not persisted correctly');
      }
    } catch (error) {
      console.error('Failed to set schedule limits:', error);
      throw error;
    }
  },

  // Settings endpoints
  getSettings: async (engineerId: string): Promise<Settings> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/${engineerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },

  updateNotifications: async (engineerId: string, notifications: NotificationSettings): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/settings/${engineerId}/notifications`, notifications);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  },

  updateIntegrations: async (engineerId: string, integrations: IntegrationSettings): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/settings/${engineerId}/integrations`, integrations);
    } catch (error) {
      console.error('Failed to update integration settings:', error);
      throw error;
    }
  },

  updateDisplay: async (engineerId: string, display: DisplaySettings): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/settings/${engineerId}/display`, display);
    } catch (error) {
      console.error('Failed to update display settings:', error);
      throw error;
    }
  },

  // Monitoring endpoints
  getMonitoringMetrics: async (startDate?: Date, endDate?: Date): Promise<MonitoringMetrics> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();
    const response = await axios.get(`${API_BASE_URL}/monitoring/focus-metrics/current`, { params });
    return response.data;
  },

  getAchievements: async (): Promise<{ achievements: Achievement[] }> => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/achievements/current`);
    return response.data;
  },





  generateReport: async (params: {
    startDate?: string;
    endDate?: string;
    type: 'daily' | 'weekly' | 'monthly';
    format: 'json' | 'csv';
    engineerId: string;
    includeAchievements: boolean;
  }): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/report`, { params });
    return response.data;
  },

  getReportSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/report/summary`);
    return response.data;
  },

  getContributions: async (engineerId: string, startDate?: Date, endDate?: Date): Promise<ContributionData> => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();
      
      // Ensure we're using the correct port
      const response = await axios.get(`${API_BASE_URL}/monitoring/contributions/${engineerId}`, { 
        params,
        // Add error handling for development
        validateStatus: (status) => status === 200
      });
      
      // Validate response format
      if (!response.data.months || !Array.isArray(response.data.months)) {
        throw new Error('Invalid contribution data format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contribution data:', error);
      throw error;
    }
  },

  // Task endpoints
  getTasks: async (filters?: Record<string, string>): Promise<Task[]> => {
    try {
      // Ensure we don't show deleted tasks by default
      const params = {
        ...filters,
        showDeleted: 'false'
      };
      const response = await axios.get(`${API_BASE_URL}/tasks`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  getTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch task:', error);
      throw error;
    }
  },

  getRelationships: async (filters?: { sourceTaskId?: string; targetTaskId?: string; type?: string }): Promise<Relationship[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relationships`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
      throw error;
    }
  },

  createRelationship: async (relationship: Omit<Relationship, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ _id: string }> => {
    const response = await axios.post(`${API_BASE_URL}/relationships`, relationship);
    return response.data;
  },

  updateRelationship: async (relationshipId: string, type: Relationship['type']): Promise<void> => {
    await axios.put(`${API_BASE_URL}/relationships/${relationshipId}`, { type });
  },

  deleteRelationship: async (relationshipId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/relationships/${relationshipId}`);
  },

  createTask: async (taskData: Partial<Task>): Promise<{ _id: string }> => {
    const response = await axios.post(`${API_BASE_URL}/tasks/create`, taskData);
    return response.data;
  },
  updateTaskStatus: async (taskId: string, status: Task['status']): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { status });
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { delete: true });
  },

// Mind Map endpoints
getMindMapNodes: async (): Promise<MindMapNode[]> => {
  const response = await axios.get(`${API_BASE_URL}/mindmap/nodes`);
  return response.data;
},

createMindMapNode: async (node: { label: string; position: { x: number; y: number } }): Promise<{ _id: string }> => {
  const response = await axios.post(`${API_BASE_URL}/mindmap/nodes`, node);
  return response.data;
},

deleteMindMapNode: async (nodeId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/mindmap/nodes/${nodeId}`);
},

getMindMapEdges: async (): Promise<MindMapEdge[]> => {
  const response = await axios.get(`${API_BASE_URL}/mindmap/edges`);
  return response.data;
},

createMindMapEdge: async (edge: { sourceId: string; targetId: string }): Promise<{ _id: string }> => {
  const response = await axios.post(`${API_BASE_URL}/mindmap/edges`, edge);
  return response.data;
},

deleteMindMapEdge: async (edgeId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/mindmap/edges/${edgeId}`);
},
};


export interface Relationship {
  _id?: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'blocks' | 'blocked-by' | 'relates-to' | 'duplicates' | 'parent-of' | 'child-of';
  createdAt?: string;
  updatedAt?: string;
}

export interface MindMapNode {
  _id: string;
  label: string;
  position: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

export interface MindMapEdge {
  _id: string;
  sourceId: string;
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

// Security endpoints
export const getSecurityAlerts = async (params?: { repository?: string; state?: string; severity?: string }): Promise<{ alerts: SecurityAlert[] }> => {
  const response = await axios.get(`${API_BASE_URL}/security/alerts`, { params });
  return response.data;
};

export const getSecurityStats = async (params?: { repository?: string }): Promise<SecurityStats> => {
  const response = await axios.get(`${API_BASE_URL}/security/alerts/stats`, { params });
  return response.data;
};

export const syncSecurityAlerts = async (repository: string): Promise<{ message: string; count: number }> => {
  const response = await axios.post(`${API_BASE_URL}/security/alerts/sync`, { repository });
  return response.data;
};



export interface Activity {
  _id: string;
  engineerId: string;
  eventType: string;
  repository: string;
  timestamp: string;
  title?: string;
  description?: string;
  url?: string;
  reviewers?: string[];
  commentCount?: number;
  additions?: number;
  deletions?: number;
}

export interface CollaborationStats {
  total_reviews: number;
  total_comments: number;
  total_additions: number;
  total_deletions: number;
  reviewer_count: number;
  unique_reviewers: string[];
  event_types: string[];
}

export interface OrganizationMetrics {
  metrics: Array<{
    repository: string;
    activity: {
      commits: number;
      pull_requests: number;
      reviews: number;
      comments: number;
    };
    performance: {
      avg_review_time: number;
      merge_success_rate: number;
      deployment_frequency: number;
    };
    security: {
      open_alerts: number;
      fixed_alerts: number;
      high_severity: number;
    };
    collaboration: {
      unique_contributors: number;
      review_coverage: number;
      comment_ratio: number;
    };
  }>;
  totals: {
    total_repositories: number;
    total_activity: number;
    total_contributors: number;
    total_security_alerts: number;
    avg_deployment_frequency: number;
    timeframe: {
      start: string;
      end: string;
      days: number;
    };
  };
}

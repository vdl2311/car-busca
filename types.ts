
export enum AppRoute {
    WELCOME = '/',
    LOGIN = '/login',
    HOME = '/home',
    REPORT_RESULT = '/report-result',
    DEFECT_DETAIL = '/defect-detail',
    PROFILE = '/profile',
    REPORT_ISSUE = '/report-issue',
    SUBSCRIPTION = '/subscription'
}

export type SubscriptionTier = 'FREE' | 'PRO' | 'EXPERT';

export interface UserSubscription {
    id: string;
    tier: SubscriptionTier;
    reports_remaining: number;
    expires_at: string | null;
}

export interface Defect {
    id: string;
    title: string;
    description: string;
    severity: 'Alta' | 'Média' | 'Baixa';
    repairProcedure?: string;
}

export interface MaintenanceStep {
    km: string;
    items: string[];
    estimatedLaborTime?: string;
}

export interface TechnicalSpecs {
    oilType: string;
    oilCapacity: string;
    coolantType: string;
    tirePressure: string;
    wheelTorque?: string;
}

export interface ReportData { 
    score: number; 
    technicalSpecs: TechnicalSpecs;
    marketValue: {
        fipe: string;
        marketAverage: string;
        trend: 'up' | 'down' | 'stable';
    };
    verdict: {
        status: string;
        summary: string;
        technicalWarning: string;
    }; 
    defects: Defect[]; 
    maintenanceRoadmap: MaintenanceStep[];
    stats: {
        repairEase: number;
        partsAvailability: number;
        reliability: number;
        costOfMaintenance: number;
    };
}

// Fix: Added missing Post interface for Community page feed
export interface Post {
    id: string;
    user: {
        name: string;
        avatar: string;
        car: string;
    };
    timeAgo: string;
    title: string;
    content: string;
    likes: number;
    comments: number;
    hasAudio?: boolean;
    resolved?: boolean;
    aiInsight?: {
        diagnosis: string;
        confidence: number;
        description: string;
    };
}

// Fix: Added missing OSStatus type for Service Orders management
export type OSStatus = 'ENTRADA' | 'DIAGNOSTICO' | 'AGUARDANDO_PECA' | 'EXECUCAO' | 'FINALIZADO';

import { useState, useCallback, useEffect } from 'react';
import type { Company, ApplicationData, ResumeBlock, ViewState } from '../types';
import { generateMockData, DEFAULT_RESUME_BLOCKS } from '../utils/mockData';
import {
  prepareCreationOptions,
  prepareRequestOptions,
  credentialToRegistrationJSON,
  credentialToAssertionJSON,
} from '../utils/webauthn';
import type { CreationOptionsJSON, RequestOptionsJSON } from '../utils/webauthn';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type AuthUser = { id: number; username: string; displayName: string };
type StartOptionsResponse<T> = { requestId: string; publicKey: T | string };
type RecoveryCodesResponse = { codes: string[] };

class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    let message = response.statusText;
    if (body && typeof body === 'object' && 'message' in body) {
      message = String((body as { message: unknown }).message);
    } else if (typeof body === 'string' && body) {
      message = body;
    }
    throw new HttpError(response.status, message, body);
  }

  return body as T;
};

const parsePublicKeyOptions = <T,>(options: StartOptionsResponse<T>): T => {
  const raw =
    typeof options.publicKey === 'string'
      ? (JSON.parse(options.publicKey) as unknown)
      : (options.publicKey as unknown);

  if (!raw) {
    throw new Error('패스키 옵션을 읽지 못했습니다.');
  }

  if (typeof raw === 'object' && 'publicKey' in raw) {
    const nested = (raw as { publicKey?: T }).publicKey;
    if (nested) {
      return nested;
    }
  }

  return raw as T;
};

export const useAuth = () => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchJson<AuthUser>('/api/auth/me');
      setUser(me);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    if (!error) return;
    const timeoutId = window.setTimeout(() => setError(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [error]);

  const registerPasskey = useCallback(async (username: string, displayName: string) => {
    setError(null);
    setNotice(null);
    if (!username) {
      setError('이메일 또는 사용자명을 입력해 주세요.');
      return false;
    }
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setError('이 브라우저는 WebAuthn(패스키)을 지원하지 않습니다.');
      return false;
    }

    try {
      const options = await fetchJson<StartOptionsResponse<CreationOptionsJSON>>(
        '/api/auth/webauthn/register/options',
        {
          method: 'POST',
          body: JSON.stringify({ username, displayName }),
        }
      );
      const publicKeyJson = parsePublicKeyOptions<CreationOptionsJSON>(options);
      const publicKey = prepareCreationOptions(publicKeyJson);
      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) {
        throw new Error('패스키 정보를 받지 못했습니다.');
      }

      const payload = {
        requestId: options.requestId,
        credential: credentialToRegistrationJSON(credential),
      };
      const signedIn = await fetchJson<AuthUser>('/api/auth/webauthn/register/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(signedIn);
      setStatus('authenticated');
      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setNotice('요청이 취소되었습니다.');
        return false;
      }
      const statusCode = err instanceof HttpError ? err.status : undefined;
      const message = String(err?.message || '');
      if (statusCode === 403 || message === 'User already exists') {
        setNotice('이미 등록된 사용자입니다. 패스키로 로그인해 주세요.');
        setError(null);
        setStatus('unauthenticated');
        return false;
      }
      if (statusCode === 500 || message === 'Internal Server Error') {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        setError(message || '패스키 등록에 실패했습니다.');
      }
      setStatus('unauthenticated');
      return false;
    }
  }, []);

  const loginPasskey = useCallback(async (username?: string) => {
    setError(null);
    setNotice(null);
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setError('이 브라우저는 WebAuthn(패스키)을 지원하지 않습니다.');
      return;
    }

    try {
      const options = await fetchJson<StartOptionsResponse<RequestOptionsJSON>>(
        '/api/auth/webauthn/login/options',
        {
          method: 'POST',
          body: JSON.stringify({ username }),
        }
      );
      const publicKeyJson = parsePublicKeyOptions<RequestOptionsJSON>(options);
      const publicKey = prepareRequestOptions(publicKeyJson);
      const credential = await navigator.credentials.get({ publicKey });
      if (!credential) {
        throw new Error('패스키 정보를 받지 못했습니다.');
      }

      const payload = {
        requestId: options.requestId,
        credential: credentialToAssertionJSON(credential),
      };
      const signedIn = await fetchJson<AuthUser>('/api/auth/webauthn/login/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(signedIn);
      setStatus('authenticated');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setNotice('요청이 취소되었습니다.');
        return;
      }
      const statusCode = err instanceof HttpError ? err.status : undefined;
      const message = String(err?.message || '');
      if (statusCode === 400 && message === 'Unknown user') {
        setNotice('등록된 사용자명이 없습니다. 패스키 생성을 먼저 진행해 주세요.');
        setError(null);
        setStatus('unauthenticated');
        return;
      }
      if (statusCode === 500 || message === 'Internal Server Error') {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        setError(message || '로그인에 실패했습니다.');
      }
      setStatus('unauthenticated');
    }
  }, []);

  const loginRecoveryCode = useCallback(async (username: string, code: string) => {
    setError(null);
    setNotice(null);
    if (!username || !code) {
      setError('사용자명과 복구 코드를 입력해 주세요.');
      return;
    }
    try {
      const signedIn = await fetchJson<AuthUser>('/api/auth/recovery/login', {
        method: 'POST',
        body: JSON.stringify({ username, code }),
      });
      setUser(signedIn);
      setStatus('authenticated');
    } catch (err: any) {
      const statusCode = err instanceof HttpError ? err.status : undefined;
      const message = String(err?.message || '');
      if (statusCode === 500 || message === 'Internal Server Error') {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        setError(message || '복구 코드가 올바르지 않습니다.');
      }
      setStatus('unauthenticated');
    }
  }, []);

  const generateRecoveryCodes = useCallback(async () => {
    setError(null);
    setNotice(null);
    try {
      const response = await fetchJson<RecoveryCodesResponse>('/api/auth/recovery/create', {
        method: 'POST',
      });
      setRecoveryCodes(response.codes || []);
    } catch (err: any) {
      const statusCode = err instanceof HttpError ? err.status : undefined;
      const message = String(err?.message || '');
      if (statusCode === 500 || message === 'Internal Server Error') {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        setError(message || '복구 코드 생성에 실패했습니다.');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await fetchJson('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStatus('unauthenticated');
    setRecoveryCodes(null);
  }, []);

  return {
    status,
    user,
    error,
    notice,
    recoveryCodes,
    refresh,
    registerPasskey,
    loginPasskey,
    loginRecoveryCode,
    generateRecoveryCodes,
    logout,
  };
};

export const useCareerOS = () => {
  const [viewState, setViewState] = useState<ViewState>('command');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'search' | 'analysis' | 'activity' | 'starred' | 'prep' | 'resumes' | 'settings'>('search');
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [analysisCompanyId, setAnalysisCompanyId] = useState<number | null>(null);
  const [editorCompanyId, setEditorCompanyId] = useState<number | null>(null);
  const [resumes, setResumes] = useState<Record<number, ResumeBlock[]>>({});
  const [applications, setApplications] = useState<Record<number, ApplicationData>>({});
  const [modalCompany, setModalCompany] = useState<Company | null>(null);
  const [editingApp, setEditingApp] = useState<Company | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleBatchAnalyze = useCallback((urls: string[]) => {
    setViewState('processing');
    setTimeout(() => {
      const parsedData = generateMockData(urls);
      setCompanies(parsedData);
      if (urls.some((u) => u.startsWith('demo'))) {
        setApplications({
          1: { starred: true, status: 'to-apply' },
          2: { starred: true, status: 'applied' },
          3: { starred: true, status: 'interview' },
          4: { starred: true, status: 'starred' },
          5: { starred: false, status: 'to-apply' },
          6: { starred: true, status: 'interview' },
        });
      }
      setViewState('dashboard');
    }, 1500);
  }, []);

  const handleClearData = useCallback(() => {
    setCompanies([]);
    setResumes({});
    setApplications({});
    setActiveNodeId(null);
    setAnalysisCompanyId(null);
    setEditorCompanyId(null);
    setSidebarTab('search');
  }, []);

  return {
    viewState,
    setViewState,
    companies,
    setCompanies,
    sidebarTab,
    setSidebarTab,
    activeNodeId,
    setActiveNodeId,
    analysisCompanyId,
    setAnalysisCompanyId,
    editorCompanyId,
    setEditorCompanyId,
    resumes,
    setResumes,
    applications,
    setApplications,
    modalCompany,
    setModalCompany,
    editingApp,
    setEditingApp,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleBatchAnalyze,
    handleClearData,
  };
};

export const useApplications = (applications: Record<number, ApplicationData>, setApplications: (apps: Record<number, ApplicationData>) => void) => {
  const toggleStar = useCallback(
    (companyId: number) => {
      setApplications({
        ...applications,
        [companyId]: {
          ...applications[companyId],
          starred: !applications[companyId]?.starred,
          status: applications[companyId]?.status || (applications[companyId]?.starred ? undefined : 'starred'),
        },
      });
    },
    [applications, setApplications]
  );

  const updateStatus = useCallback(
    (companyId: number, newStatus: string) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], status: newStatus as any },
      });
    },
    [applications, setApplications]
  );

  const addApplication = useCallback(
    (companyId: number, status: string) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], status: status as any },
      });
    },
    [applications, setApplications]
  );

  const removeFromBoard = useCallback(
    (companyId: number) => {
      const currentApp = applications[companyId];
      if (!currentApp?.status) return;

      const { status, ...rest } = currentApp;
      const newApp = Object.keys(rest).length === 0 ? undefined : rest;

      const newApplications = { ...applications };
      if (newApp) {
        newApplications[companyId] = newApp;
      } else {
        delete newApplications[companyId];
      }
      setApplications(newApplications);
    },
    [applications, setApplications]
  );

  const saveApplicationDetails = useCallback(
    (companyId: number, details: Partial<ApplicationData>) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], ...details },
      });
    },
    [applications, setApplications]
  );

  return {
    toggleStar,
    updateStatus,
    addApplication,
    removeFromBoard,
    saveApplicationDetails,
  };
};

export const useResumes = (companies: Company[]) => {
  const [resumes, setResumes] = useState<Record<number, ResumeBlock[]>>({});

  const updateResumeBlocks = useCallback((companyId: number, blocks: ResumeBlock[]) => {
    setResumes((prev) => ({
      ...prev,
      [companyId]: blocks,
    }));
  }, []);

  const addKeyword = useCallback(
    (companyId: number, keyword: string) => {
      const company = companies.find((c) => c.id === companyId);
      if (!company) return;

      const newBlock: ResumeBlock = {
        id: Date.now(),
        type: 'p',
        text: `✨ [${company.company}] "${keyword}" 관련 경험을 여기에 작성하세요.`,
      };

      setResumes((prev) => {
        const existingResume = prev[companyId];
        const newResumeBlocks = existingResume
          ? [...existingResume, newBlock]
          : [...DEFAULT_RESUME_BLOCKS, { id: Date.now() + 1, type: 'p' as const, text: `\n[${company.company} 맞춤형 내용 작성 시작...]` }, newBlock];
        return { ...prev, [companyId]: newResumeBlocks };
      });
    },
    [companies]
  );

  const deleteResume = useCallback((companyId: number) => {
    if (window.confirm('정말로 이 이력서를 삭제하시겠습니까?')) {
      setResumes((prev) => {
        const newResumes = { ...prev };
        delete newResumes[companyId];
        return newResumes;
      });
    }
  }, []);

  return {
    resumes,
    setResumes,
    updateResumeBlocks,
    addKeyword,
    deleteResume,
  };
};

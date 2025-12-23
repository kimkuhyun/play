import React, { useEffect, useMemo, useState } from 'react';

interface AuthViewProps {
  onRegister: (username: string, displayName: string) => Promise<boolean> | boolean;
  onLogin: (username?: string) => Promise<void> | void;
  onRecovery: (username: string, code: string) => Promise<void> | void;
  notice?: string | null;
  error?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onRegister,
  onLogin,
  onRecovery,
  notice,
  error,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerUsername, setRegisterUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (mode === 'login') {
      setRegisterUsername('');
      setDisplayName('');
    } else {
      setLoginUsername('');
      setRecoveryUsername('');
      setRecoveryCode('');
      setShowRecovery(false);
    }
  }, [mode]);

  const usernameIssue = useMemo(() => {
    const value = registerUsername.trim();
    if (!value) {
      return null;
    }
    if (value.length < 3 || value.length > 64) {
      return '3~64자만 사용할 수 있습니다.';
    }
    if (/\s/.test(value)) {
      return '공백은 사용할 수 없습니다.';
    }
    if (!/^[A-Za-z0-9@._-]+$/.test(value)) {
      return '영문, 숫자, @ . _ -만 사용할 수 있습니다.';
    }
    if (/^[._-]|[._-]$/.test(value)) {
      return '특수문자로 시작하거나 끝날 수 없습니다.';
    }
    if (/[@._-]{2,}/.test(value)) {
      return '특수문자를 연속으로 사용할 수 없습니다.';
    }
    if (value.includes('@') && !/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
      return '이메일 형식이 올바르지 않습니다.';
    }
    return null;
  }, [registerUsername]);

  const displayNameIssue = useMemo(() => {
    const value = displayName.trim();
    if (!value) {
      return null;
    }
    if (value.length < 2 || value.length > 30) {
      return '표시 이름은 2~30자만 사용할 수 있습니다.';
    }
    if (/\s{2,}/.test(value)) {
      return '연속 공백은 사용할 수 없습니다.';
    }
    if (!/^[A-Za-z0-9가-힣 ._-]+$/.test(value)) {
      return '표시 이름에는 특수문자를 사용할 수 없습니다.';
    }
    if (/^[._-]|[._-]$/.test(value)) {
      return '특수문자로 시작하거나 끝날 수 없습니다.';
    }
    return null;
  }, [displayName]);

  const canRegister =
    registerUsername.trim().length > 0 && !usernameIssue && !displayNameIssue;

  const handleRegister = async () => {
    if (isRegistering) return;
    setIsRegistering(true);
    try {
      const succeeded = await Promise.resolve(
        onRegister(registerUsername.trim(), displayName.trim())
      );
      if (succeeded) {
        setMode('login');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 space-y-8 shadow-[0_0_60px_rgba(15,23,42,0.6)]">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
              <h1 className="text-3xl font-bold">
                {mode === 'login' ? '패스키 로그인' : '패스키 등록'}
              </h1>
            </div>
            {mode === 'register' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                로그인으로 돌아가기
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {mode === 'login'
              ? '비밀번호 없이 패스키로 로그인합니다. 기기 인증(지문/Face ID/Windows Hello)으로 빠르게 접속하세요.'
              : '처음 한 번만 등록하면 됩니다. 등록 후에는 패스키로 바로 로그인할 수 있어요.'}
          </p>
        </header>

        {mode === 'login' ? (
          <>
            <section className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">패스키로 로그인</h2>
                <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  추천
                </span>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-slate-300">사용자명 (선택)</label>
                <input
                  value={loginUsername}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm"
                  placeholder="비워두면 저장된 패스키에서 선택"
                />
              </div>
              <button
                onClick={() => onLogin(loginUsername.trim() || undefined)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                패스키로 로그인
              </button>
              <p className="text-xs text-slate-400">
                이 기기에 저장된 패스키가 있다면 사용자명을 입력하지 않아도 됩니다.
              </p>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-full bg-slate-800 hover:bg-slate-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                패스키 생성하기
              </button>
            </section>

            <div className="border-t border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => setShowRecovery((prev) => !prev)}
                aria-expanded={showRecovery}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-300"
              >
                <span>복구 코드로 로그인</span>
                <span className="text-xs text-slate-500">{showRecovery ? '숨기기' : '비상 로그인'}</span>
              </button>
              {showRecovery && (
                <div className="mt-4 space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
                  <div className="space-y-3">
                    <label className="text-sm text-slate-300">사용자명</label>
                    <input
                      value={recoveryUsername}
                      onChange={(event) => setRecoveryUsername(event.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm"
                      placeholder="you@example.com"
                    />
                    <label className="text-sm text-slate-300">복구 코드</label>
                    <input
                      value={recoveryCode}
                      onChange={(event) => setRecoveryCode(event.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm tracking-widest"
                      placeholder="ABCDE-FGHIJ"
                    />
                  </div>
                  <button
                    onClick={() => onRecovery(recoveryUsername.trim(), recoveryCode.trim())}
                    className="w-full bg-slate-800 hover:bg-slate-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    복구 코드로 로그인
                  </button>
                  <p className="text-xs text-slate-400">
                    복구 코드는 1회용입니다. 사용 즉시 폐기되며, 새로 생성하면 기존 코드는 모두 무효화됩니다.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <section className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">패스키 생성</h2>
              <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-2 py-0.5">
                첫 등록
              </span>
            </div>
            <div className="space-y-3">
              <label className="text-sm text-slate-300">이메일 또는 사용자명</label>
              <input
                value={registerUsername}
                onChange={(event) => setRegisterUsername(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm"
                placeholder="you@example.com"
              />
              {usernameIssue && (
                <p className="text-xs text-amber-300">{usernameIssue}</p>
              )}
              <label className="text-sm text-slate-300">표시 이름 (선택)</label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm"
                placeholder="표시 이름"
              />
              {displayNameIssue && (
                <p className="text-xs text-amber-300">{displayNameIssue}</p>
              )}
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 space-y-2">
              <div className="font-semibold text-slate-200">등록 절차</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>입력한 사용자 정보를 확인합니다.</li>
                <li>기기 인증창이 뜨면 지문/Face ID/Windows Hello로 승인합니다.</li>
                <li>등록 완료 후 자동으로 로그인됩니다.</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRegister}
                disabled={isRegistering || !canRegister}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-slate-400 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {isRegistering ? '등록 중...' : '등록 시작'}
              </button>
              <button
                onClick={() => setMode('login')}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700"
              >
                취소
              </button>
            </div>
            <p className="text-xs text-slate-400">
              최초 1회만 등록하면 됩니다. 같은 계정으로 여러 기기에 패스키를 추가할 수 있어요.
            </p>
          </section>
        )}

        {notice && (
          <div className="text-sm text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
            {notice}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

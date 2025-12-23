import React, { useState } from 'react';

interface SettingsViewProps {
  onClearData: () => void;
  onGenerateRecoveryCodes: () => void;
  recoveryCodes: string[] | null;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onClearData,
  onGenerateRecoveryCodes,
  recoveryCodes,
  onLogout,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const handleClear = () => {
    if (window.confirm('저장된 모든 데이터가 삭제됩니다. 되돌릴 수 없습니다. 계속할까요?')) {
      onClearData();
    }
  };

  const handleCopy = async () => {
    if (!recoveryCodes?.length) return;
    const text = recoveryCodes.join('\n');
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showNotice('복구 코드가 클립보드에 복사되었습니다.');
    } else {
      showNotice('클립보드에 접근할 수 없습니다. 직접 저장해 주세요.');
    }
  };

  const handleDownload = () => {
    if (!recoveryCodes?.length) return;
    const content = ['복구 코드', ...recoveryCodes, ''].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showNotice('TXT 파일로 저장했습니다.');
  };

  const hasCodes = Boolean(recoveryCodes && recoveryCodes.length > 0);

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 space-y-6">
        <h2 className="text-2xl font-bold">설정</h2>

        <section className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">데이터</h3>
            <button
              onClick={handleClear}
              className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              모든 데이터 삭제
            </button>
          </div>
          <p className="text-xs text-slate-500">
            분석 기록, 지원 상태, 메모 등 저장된 데이터가 모두 삭제됩니다.
          </p>
        </section>

        <section className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">보안</h3>
            <button
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              로그아웃
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGenerateRecoveryCodes}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              복구 코드 생성
            </button>
            {hasCodes && (
              <>
                <button
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  복사
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  TXT 다운로드
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">
            복구 코드는 비상 로그인용 1회용 코드입니다. 새로 생성하면 기존 코드는 모두 무효화됩니다.
          </p>
          {notice && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              {notice}
            </div>
          )}
          {hasCodes && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {recoveryCodes?.map((code) => (
                  <div key={code} className="bg-slate-950 border border-slate-800 rounded px-3 py-2">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                이 화면을 닫으면 다시 확인하기 어렵습니다. 안전한 곳에 저장해 두세요.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

import React, { useCallback, useMemo, useState } from 'react';
import { MapPin, Sparkles, Star, FileText, X, Plus, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Company, ApplicationData } from '../../types';

interface MapWidgetProps {
  companies: Company[];
  applications: Record<number, ApplicationData>;
  activeNodeId: number | null;
  onNodeClick: (companyId: number | null) => void;
  onAction: (action: string, companyId: number) => void;
}

interface HomeLocation {
  lat: number;
  lng: number;
}

// DivIcon을 사용한 HTML 마커 (한글 지원)
const createCustomDivIcon = (isActive: boolean, company: Company) => {
  const html = `
    <div class="marker-wrapper ${isActive ? 'active' : ''}">
      <div class="marker-circle">
        <div class="marker-inner"></div>
      </div>
      <div class="marker-label">
        <div class="marker-company">${company.company}</div>
        <div class="marker-deadline">${company.deadline}</div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: `custom-marker ${isActive ? 'active-marker' : ''}`,
    iconSize: [120, 100],
    iconAnchor: [60, 80],
    popupAnchor: [0, -80],
  });
};

// 우리집 마커
const createHomeMarker = () => {
  const html = `
    <div class="home-marker-wrapper">
      <div class="home-marker-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10L12 3L21 10V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 22V12H15V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="home-marker-label">우리집</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'home-marker',
    iconSize: [60, 70],
    iconAnchor: [30, 70],
    popupAnchor: [0, -70],
  });
};

export const MapWidget: React.FC<MapWidgetProps> = ({
  companies,
  applications,
  activeNodeId,
  onNodeClick,
  onAction,
}) => {
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null);
  const center = useMemo(() => [37.5665, 126.978] as [number, number], []);

  const handleMarkerClick = useCallback(
    (companyId: number) => {
      onNodeClick(companyId);
    },
    [onNodeClick]
  );

  const handleAddHome = () => {
    setHomeLocation({ lat: 37.5665, lng: 126.978 });
  };

  const handleRemoveHome = () => {
    setHomeLocation(null);
  };

  const handleHomeMarkerDragEnd = (e: any) => {
    const latlng = e.target.getLatLng();
    setHomeLocation({ lat: latlng.lat, lng: latlng.lng });
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl overflow-hidden border border-slate-800/50 flex flex-col shadow-2xl relative">
      {/* 배경 그래디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-3xl" />

      {/* 헤더 */}
      <div className="absolute top-4 left-4 z-20 backdrop-blur-xl bg-slate-950/70 px-4 py-2.5 rounded-2xl border border-slate-800/80 flex items-center gap-3 shadow-lg hover:border-indigo-500/50 transition-all">
        <div className="relative">
          <MapPin size={18} className="text-indigo-400 animate-pulse" />
          <div className="absolute inset-0 bg-indigo-400 rounded-full opacity-20 blur" />
        </div>
        <div className="text-sm font-bold text-white">
          채용 지도{' '}
          <span className="text-indigo-400 ml-1">({companies.length})</span>
          <span className="text-slate-400 font-normal text-xs ml-2 block mt-0.5">클릭하여 공고 보기</span>
        </div>
      </div>

      {/* 우리집 추가 버튼 */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {homeLocation ? (
          <button
            onClick={handleRemoveHome}
            className="backdrop-blur-xl bg-red-950/70 hover:bg-red-900/80 px-3 py-2.5 rounded-2xl border border-red-800/80 flex items-center gap-2 shadow-lg transition-all text-red-300 hover:text-red-200 text-xs font-semibold"
          >
            <Trash2 size={14} />
            우리집 제거
          </button>
        ) : (
          <button
            onClick={handleAddHome}
            className="backdrop-blur-xl bg-amber-950/70 hover:bg-amber-900/80 px-3 py-2.5 rounded-2xl border border-amber-800/80 flex items-center gap-2 shadow-lg transition-all text-amber-300 hover:text-amber-200 text-xs font-semibold"
          >
            <Plus size={14} />
            우리집 추가
          </button>
        )}
      </div>

      {/* 지도 */}
      <MapContainer center={center} zoom={10} className="!h-full !w-full" style={{ zIndex: 1 }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
          className="leaflet-tile-layer-modern"
        />
        {/* 우리집 마커 */}
        {homeLocation && (
          <Marker
            position={[homeLocation.lat, homeLocation.lng]}
            icon={createHomeMarker()}
            draggable
            eventHandlers={{
              dragend: handleHomeMarkerDragEnd,
            }}
            title="우리집"
          >
            <Popup className="home-popup-modern" closeButton={false}>
              <div className="p-0">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 rounded-t-lg">
                  <div className="text-xs text-amber-200 font-semibold">내 위치</div>
                  <div className="text-white font-bold text-sm mt-1">우리집</div>
                </div>
                <div className="bg-slate-900/95 backdrop-blur px-4 py-3 rounded-b-lg">
                  <div className="text-xs text-slate-400">
                    {homeLocation.lat.toFixed(4)}, {homeLocation.lng.toFixed(4)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">드래그하여 위치 변경 가능</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.lat, company.lng]}
            icon={createCustomDivIcon(activeNodeId === company.id, company)}
            eventHandlers={{
              click: () => handleMarkerClick(company.id),
            }}
            title={company.company}
          >
            <Popup className="custom-popup-modern" closeButton={false}>
              <div className="p-0 w-64">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between rounded-t-lg">
                  <div>
                    <div className="text-xs text-indigo-200 font-semibold">채용 공고</div>
                    <div className="text-white font-bold text-sm mt-1">{company.company}</div>
                  </div>
                  <button
                    onClick={() => onNodeClick(null)}
                    className="text-white hover:bg-white/20 p-1 rounded-full transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* 내용 */}
                <div className="bg-slate-900/95 backdrop-blur px-4 py-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{company.location}</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-400">연봉</span>
                    <span className="text-sm font-semibold text-indigo-300">{company.salary}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {/* 공고 보기 */}
                    <button
                      onClick={() => onAction('analyze', company.id)}
                      className="w-full px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-indigo-500/50"
                    >
                      <FileText size={14} className="group-hover:scale-110 transition" />
                      공고 상세보기
                    </button>

                    {/* 관심 등록 */}
                    <button
                      onClick={() => onAction('star', company.id)}
                      className={`w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        applications[company.id]?.starred
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      <Star
                        size={14}
                        className={`${applications[company.id]?.starred ? 'fill-amber-300' : ''}`}
                      />
                      {applications[company.id]?.starred ? '관심 등록됨' : '관심 등록'}
                    </button>

                    {/* 이력서 */}
                    <button
                      onClick={() => onAction('resume', company.id)}
                      className="w-full px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-slate-700/50"
                    >
                      <Sparkles size={14} />
                      이력서 작성
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        /* 마커 스타일 */
        .custom-marker {
          background: transparent !important;
          border: none !important;
          width: auto !important;
          height: auto !important;
        }

        .marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .marker-wrapper:hover {
          transform: scale(1.15);
          filter: brightness(1.2);
        }

        .marker-wrapper.active {
          transform: scale(1.25);
        }

        .marker-circle {
          position: relative;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4), 0 0 0 2px rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.2);
          animation: pulse-marker 2s infinite;
        }

        .marker-wrapper.active .marker-circle {
          background: linear-gradient(135deg, #818cf8, #6366f1);
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.6), 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        .marker-inner {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .marker-label {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 6px 10px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 110px;
        }

        .marker-company {
          font-size: 12px;
          font-weight: 700;
          color: #e0e7ff;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }

        .marker-deadline {
          font-size: 10px;
          color: #a5b4fc;
          font-weight: 500;
          margin-top: 2px;
        }

        @keyframes pulse-marker {
          0%, 100% {
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4), 0 0 0 2px rgba(15, 23, 42, 0.8);
          }
          50% {
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6), 0 0 0 4px rgba(99, 102, 241, 0.2);
          }
        }

        /* 우리집 마커 스타일 */
        .home-marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          animation: float-marker 3s ease-in-out infinite;
        }

        .home-marker-circle {
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.5), 0 0 0 2px rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .home-marker-label {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 6px;
          padding: 4px 8px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          font-size: 11px;
          font-weight: 600;
          color: #fcd34d;
        }

        @keyframes float-marker {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .home-popup-modern .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(100, 116, 139, 0.3) !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .home-popup-modern .leaflet-popup-tip {
          display: none !important;
        }

        /* 팝업 스타일 */
        .custom-popup-modern .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(100, 116, 139, 0.3) !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .custom-popup-modern .leaflet-popup-tip {
          display: none !important;
        }

        .custom-popup-modern .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
        }

        .leaflet-tile-layer-modern {
          filter: brightness(0.98) contrast(1.1) saturate(1.05);
        }

        /* 반응형 조정 */
        @media (max-width: 768px) {
          .marker-label {
            min-width: 90px;
            padding: 4px 8px;
          }

          .marker-company {
            font-size: 11px;
          }

          .marker-deadline {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};

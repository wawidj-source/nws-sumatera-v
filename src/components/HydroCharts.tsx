import React from 'react';
import { CrossSectionPoint, ForecastHour, Station, TimeSeriesPoint } from '../types/sda';

export const HydrographChart: React.FC<{
  station: Station;
  series: TimeSeriesPoint[];
  height?: number;
}> = ({ station, series, height = 250 }) => {
  const w = 680;
  const h = height;
  const padL = 46;
  const padR = 44;
  const padT = 18;
  const padB = 26;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const maxY = Math.max(
    station.thresholds.siaga1 + 0.5,
    ...series.map((p) => Math.max(p.waterLevelM, p.forecastWaterLevelM ?? 0))
  );
  const maxRain = Math.max(35, ...series.map((p) => p.rainfallMm));

  const xFor = (i: number) => padL + (i / Math.max(1, series.length - 1)) * plotW;
  const yFor = (val: number) => padT + plotH - (val / maxY) * (plotH * 0.78);

  const actualPoints = series.filter((p) => p.forecastWaterLevelM === undefined);
  const forecastPoints = series.filter((p) => p.forecastWaterLevelM !== undefined);

  const actualPath = actualPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.waterLevelM).toFixed(1)}`)
    .join(' ');

  const lastActualIdx = Math.max(0, actualPoints.length - 1);
  const forecastPath =
    forecastPoints.length > 0
      ? [
          `M ${xFor(lastActualIdx).toFixed(1)} ${yFor(actualPoints[lastActualIdx].waterLevelM).toFixed(1)}`,
          ...forecastPoints.map(
            (p, idx) =>
              `L ${xFor(lastActualIdx + 1 + idx).toFixed(1)} ${yFor(p.forecastWaterLevelM ?? p.waterLevelM).toFixed(1)}`
          ),
        ].join(' ')
      : '';

  const thresholds = [
    { label: 'S1', val: station.thresholds.siaga1, color: '#f43f5e' },
    { label: 'S2', val: station.thresholds.siaga2, color: '#fb923c' },
    { label: 'S3', val: station.thresholds.siaga3, color: '#facc15' },
    { label: 'S4', val: station.thresholds.siaga4, color: '#38bdf8' },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" role="img" aria-label={`Hidrograf ${station.name}`}>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = padT + plotH * (1 - f * 0.78);
        return (
          <line key={f} x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" strokeOpacity="0.6" />
        );
      })}

      {/* Inverted Hyetograph (Rainfall Bars at Top) */}
      {series.map((p, i) => {
        const barH = Math.max(1, (p.rainfallMm / maxRain) * (plotH * 0.28));
        return (
          <rect
            key={p.timestamp + i}
            x={xFor(i) - 3}
            y={padT}
            width="6"
            height={barH}
            rx="1"
            fill="#38bdf8"
            fillOpacity={p.forecastWaterLevelM !== undefined ? 0.35 : 0.75}
          />
        );
      })}

      {/* Threshold Lines */}
      {thresholds.map((t) => {
        const y = yFor(t.val);
        return (
          <g key={t.label}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke={t.color} strokeWidth="1" strokeDasharray="5 3" strokeOpacity="0.85" />
            <text x={w - padR + 4} y={y + 3} fill={t.color} fontSize="9.5" fontWeight="700">
              {t.label} ({t.val.toFixed(1)}m)
            </text>
          </g>
        );
      })}

      {/* Actual Water Level Path */}
      <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Forecast Projection Path */}
      {forecastPath && (
        <path d={forecastPath} fill="none" stroke="#f59e0b" strokeWidth="2.4" strokeDasharray="5 3" />
      )}

      {/* X Axis Labels */}
      {series
        .filter((_, idx) => idx % 6 === 0 || idx === series.length - 1)
        .map((p) => {
          const idx = series.indexOf(p);
          return (
            <text key={p.timestamp} x={xFor(idx)} y={h - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="9.5">
              {p.timestamp}
            </text>
          );
        })}

      {/* Y Axis Labels */}
      {[0, 1, 2, 3, 4].map((val) => {
        if (val > maxY) return null;
        return (
          <text key={val} x={padL - 6} y={yFor(val) + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="9.5">
            {val.toFixed(1)}m
          </text>
        );
      })}
      <text x={padL} y={11} fill="#38bdf8" fontSize="9.5" fontWeight="600">
        Hujan (mm/jam)
      </text>
    </svg>
  );
};

export const CrossSectionChart: React.FC<{ data: CrossSectionPoint[] }> = ({ data }) => {
  const w = 620;
  const h = 220;
  const padL = 42;
  const padR = 20;
  const padT = 18;
  const padB = 28;
  const maxX = Math.max(...data.map((d) => d.distanceM));
  const maxY = 5.8;

  const x = (d: number) => padL + (d / maxX) * (w - padL - padR);
  const y = (e: number) => padT + (1 - e / maxY) * (h - padT - padB);

  const line = (key: 'elev2024' | 'elev2025' | 'elev2026') =>
    data.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(pt.distanceM).toFixed(1)} ${y(pt[key]).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Perbandingan Penampang Sungai 2024-2026">
      {/* Water fill */}
      <rect x={padL} y={y(2.85)} width={w - padL - padR} height={y(0) - y(2.85)} fill="#0ea5e9" fillOpacity="0.14" />
      <line x1={padL} y1={y(2.85)} x2={w - padR} y2={y(2.85)} stroke="#38bdf8" strokeDasharray="4 3" />
      <text x={padL + 6} y={y(2.85) - 4} fill="#38bdf8" fontSize="9.5" fontWeight="600">
        Muka Air Terkini (2.85 m)
      </text>

      <path d={line('elev2024')} fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="4 3" />
      <path d={line('elev2025')} fill="none" stroke="#38bdf8" strokeWidth="2" />
      <path d={line('elev2026')} fill="none" stroke="#f59e0b" strokeWidth="2.6" />

      {data.map((pt) => (
        <text key={pt.distanceM} x={x(pt.distanceM)} y={h - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="9.5">
          {pt.distanceM}m
        </text>
      ))}
      {[0, 1, 2, 3, 4, 5].map((e) => (
        <text key={e} x={padL - 6} y={y(e) + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="9.5">
          {e}m
        </text>
      ))}
    </svg>
  );
};

export const RatingCurveChart: React.FC<{ a: number; h0: number; b: number }> = ({ a, h0, b }) => {
  const w = 440;
  const h = 210;
  const padL = 44;
  const padB = 26;
  const padT = 16;
  const padR = 16;

  const levels = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];
  const calcQ = (H: number) => (H <= h0 ? 0 : a * Math.pow(H - h0, b));
  const maxQ = Math.max(120, calcQ(4.5));

  const x = (q: number) => padL + (q / maxQ) * (w - padL - padR);
  const y = (H: number) => padT + (1 - H / 4.8) * (h - padT - padB);

  const path = levels.map((H, i) => `${i === 0 ? 'M' : 'L'} ${x(calcQ(H)).toFixed(1)} ${y(H).toFixed(1)}`).join(' ');
  const sampleObs = [
    { H: 1.2, Q: calcQ(1.2) * 0.94 },
    { H: 2.1, Q: calcQ(2.1) * 1.05 },
    { H: 2.9, Q: calcQ(2.9) * 0.98 },
    { H: 3.6, Q: calcQ(3.6) * 1.02 },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Kurva Lengkung Debit Rating Curve">
      <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="var(--border-subtle)" />
      <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="var(--border-subtle)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" />
      {sampleObs.map((pt, i) => (
        <circle key={i} cx={x(pt.Q)} cy={y(pt.H)} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.2" />
      ))}
      <text x={w / 2} y={h - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="9.5">
        Debit Q (m³/detik)
      </text>
      <text x={14} y={h / 2} transform={`rotate(-90 14 ${h / 2})`} textAnchor="middle" fill="var(--text-secondary)" fontSize="9.5">
        TMA H (m)
      </text>
    </svg>
  );
};

export const ForecastMultiChart: React.FC<{
  hours: ForecastHour[];
  mode: 'rain-compare' | 'coincidence';
}> = ({ hours, mode }) => {
  const slice = hours.slice(0, 36);
  const w = 680;
  const h = 210;
  const padL = 42;
  const padR = 36;
  const padT = 18;
  const padB = 26;
  const maxRain = Math.max(35, ...slice.map((d) => Math.max(d.rainSatelliteMmH, d.nowcastCorrectedMmH)));

  const x = (i: number) => padL + (i / (slice.length - 1)) * (w - padL - padR);
  const yRain = (v: number) => padT + (1 - v / maxRain) * (h - padT - padB);
  const yTide = (v: number) => padT + (1 - v / 2.8) * (h - padT - padB);

  const bmkgPath = slice.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${yRain(d.rainBmkgMmH).toFixed(1)}`).join(' ');
  const nowcastPath = slice
    .slice(0, 8)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${yRain(d.nowcastCorrectedMmH).toFixed(1)}`)
    .join(' ');
  const tidePath = slice.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${yTide(d.tideHeightM).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Grafik Prakiraan Satelit & Koinsidensi Pasang">
      {slice.map((d, i) => (
        <rect
          key={d.hourOffset}
          x={x(i) - 4}
          y={yRain(d.rainSatelliteMmH)}
          width="8"
          height={h - padB - yRain(d.rainSatelliteMmH)}
          rx="1.5"
          fill="#38bdf8"
          fillOpacity={mode === 'rain-compare' ? 0.65 : 0.4}
        />
      ))}

      {mode === 'rain-compare' ? (
        <>
          <path d={bmkgPath} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4 3" />
          <path d={nowcastPath} fill="none" stroke="#10b981" strokeWidth="2.8" />
        </>
      ) : (
        <>
          <rect x={x(1)} y={padT} width={x(5) - x(1)} height={h - padT - padB} fill="#f43f5e" fillOpacity="0.14" />
          <path d={tidePath} fill="none" stroke="#fb7185" strokeWidth="2.6" />
          <text x={x(3)} y={padT + 12} textAnchor="middle" fill="#fda4af" fontSize="9.5" fontWeight="700">
            Zona Koinsidensi Muara
          </text>
        </>
      )}

      {slice
        .filter((_, idx) => idx % 6 === 0)
        .map((d, idx) => (
          <text key={d.hourOffset} x={x(idx * 6)} y={h - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            {d.labelWib}
          </text>
        ))}
      {[0, 10, 20, 30].map((v) => (
        <text key={v} x={padL - 6} y={yRain(v) + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="9">
          {v}mm
        </text>
      ))}
    </svg>
  );
};

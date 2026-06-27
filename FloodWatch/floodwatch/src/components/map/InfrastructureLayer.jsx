import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';

let activeRoadLayer = null;

// Road hierarchy config — controls color, weight, and display priority
const ROAD_CONFIG = {
  motorway: { color: '#f97316', weight: 5, opacity: 1, priority: 1 },
  trunk: { color: '#f59e0b', weight: 4, opacity: 1, priority: 2 },
  primary: { color: '#eab308', weight: 3.5, opacity: 0.95, priority: 3 },
  secondary: { color: '#60a5fa', weight: 2.5, opacity: 0.9, priority: 4 },
  tertiary: { color: '#94a3b8', weight: 2, opacity: 0.8, priority: 5 },
  unclassified: { color: '#64748b', weight: 1.5, opacity: 0.65, priority: 6 },
  residential: { color: '#475569', weight: 1.5, opacity: 0.6, priority: 7 },
  service: { color: '#334155', weight: 1, opacity: 0.5, priority: 8 },
  track: { color: '#1e293b', weight: 1, opacity: 0.4, priority: 9 },
  default: { color: '#475569', weight: 1.5, opacity: 0.55, priority: 10 },
};

// Human-readable labels for highway types
const HIGHWAY_LABELS = {
  motorway: 'Autostradă',
  trunk: 'Drum național principal',
  primary: 'Drum național',
  secondary: 'Drum județean',
  tertiary: 'Drum comunal',
  unclassified: 'Drum neclasificat',
  residential: 'Stradă rezidențială',
  service: 'Drum de serviciu',
  track: 'Drum de câmp',
};

function resolveRoadName(props) {
  if (props.name) return props.name;

  const ref = props.ref || props.nat_ref || props.int_ref;
  const typeLabel = HIGHWAY_LABELS[props.highway] || 'Drum';

  if (ref) {
    return `${typeLabel} ${ref}`;
  }

  return typeLabel;
}

function getStyle(highway) {
  return ROAD_CONFIG[highway] || ROAD_CONFIG.default;
}

export default function InfrastructureLayer() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/infrastructure.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Infrastructure GeoJSON not found');
        return res.json();
      })
      .then((data) => {
        if (!data?.features) return;

        const roads = data.features.filter((f) => {
          const props = f.properties || {};

          if (!props.highway) return false;
          if (props.bridge === 'yes') return false;
          if (props.highway === 'track') return false;

          return f.geometry?.type === 'LineString';
        });

        roads.sort((a, b) => {
          const pa = getStyle(a.properties?.highway).priority;
          const pb = getStyle(b.properties?.highway).priority;
          return pb - pa;
        });

        setGeoData({ ...data, features: roads });
      })
      .catch((err) => console.error('Error loading infrastructure:', err));
  }, []);

  if (!geoData) return null;

  const styleFeature = (feature) => {
    const hw = feature.properties?.highway;
    const { color, weight, opacity } = getStyle(hw);

    return {
      color,
      weight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const hw = props.highway || 'default';
    const { color } = getStyle(hw);

    const name = resolveRoadName(props);
    const typeLabel = HIGHWAY_LABELS[hw] || 'Drum';
    const ref = props.ref || props.nat_ref || props.int_ref || null;

    const surface = props.surface
      ? props.surface.charAt(0).toUpperCase() + props.surface.slice(1)
      : 'Necunoscut';

    const maxSpeed = props.maxspeed ? `${props.maxspeed} km/h` : 'N/A';
    const lanes = props.lanes ? props.lanes : 'N/A';

    const refBadge = ref
      ? `<span style="
            background:rgba(219,234,254,0.15);
            color:#93c5fd;
            font-size:10px;
            padding:2px 7px;
            border-radius:3px;
            margin-left:8px;
            font-weight:700;
            letter-spacing:0.05em;
            border:1px solid rgba(147,197,253,0.3);
          ">${ref}</span>`
      : '';

    const tooltipContent = `
      <div style="
        font-family: ui-sans-serif, system-ui, sans-serif;
        background: #1e293b;
        border: 1px solid ${color}55;
        border-left: 3px solid ${color};
        border-radius: 6px;
        padding: 10px 12px;
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        <div style="display:flex;align-items:center;margin-bottom:8px;padding-bottom:7px;border-bottom:1px solid #334155;">
          <strong style="color:#f1f5f9;font-size:13px;flex-grow:1;line-height:1.3;">${name}</strong>
          ${refBadge}
        </div>

        <div style="font-size:11px;color:#94a3b8;line-height:2;">
          <div style="display:flex;justify-content:space-between;gap:20px;">
            <span style="color:#64748b;">Tip</span>
            <span style="color:#cbd5e1;text-transform:capitalize;">${typeLabel}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:20px;">
            <span style="color:#64748b;">Suprafață</span>
            <span style="color:#cbd5e1;">${surface}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:20px;">
            <span style="color:#64748b;">Viteză max.</span>
            <span style="color:#cbd5e1;">${maxSpeed}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:20px;">
            <span style="color:#64748b;">Benzi</span>
            <span style="color:#cbd5e1;">${lanes}</span>
          </div>
        </div>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: false,
      permanent: false,
      direction: 'top',
      opacity: 1,
      className: 'road-hover-tooltip',
    });

    const defaultStyle = styleFeature(feature);

    layer.on({
      mouseover: (e) => {
        if (activeRoadLayer && activeRoadLayer !== e.target) {
          activeRoadLayer.closeTooltip();
          activeRoadLayer.setStyle?.(activeRoadLayer.options.originalStyle || {});
        }

        activeRoadLayer = e.target;

        e.target.options.originalStyle = defaultStyle;

        e.target.setStyle({
          ...defaultStyle,
          weight: defaultStyle.weight + 3,
          color: '#e2e8f0',
          opacity: 1,
        });

        e.target.bringToFront();
        e.target.openTooltip(e.latlng);
      },

      mousemove: (e) => {
        if (activeRoadLayer === e.target) {
          e.target.openTooltip(e.latlng);
        }
      },

      mouseout: (e) => {
        e.target.closeTooltip();
        e.target.setStyle(defaultStyle);

        if (activeRoadLayer === e.target) {
          activeRoadLayer = null;
        }
      },

      click: (e) => {
        e.target.closeTooltip();

        if (activeRoadLayer === e.target) {
          activeRoadLayer = null;
        }
      },
    });
  };

  return (
    <GeoJSON
      data={geoData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';

let activePolygonLayer = null;

const defaultStyle = {
  color: '#94a3b8',
  weight: 2,
  opacity: 0.6,
  fillColor: '#334155',
  fillOpacity: 0.03,
  dashArray: '5, 5',
};

const hoverStyle = {
  color: '#f8fafc',
  weight: 3,
  opacity: 1,
  fillColor: '#334155',
  fillOpacity: 0.03,
  dashArray: '',
};

export default function CityLimitsLayer() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/village_limits.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Village Limits GeoJSON not found');
        return res.json();
      })
      .then((data) => {
        if (!data?.features) return;

        const bordersOnly = data.features.filter(
          (f) =>
            f.geometry &&
            (f.geometry.type === 'Polygon' ||
              f.geometry.type === 'MultiPolygon')
        );

        setGeoData({
          type: 'FeatureCollection',
          features: bordersOnly,
        });
      })
      .catch((err) => console.error('Error loading city limits:', err));
  }, []);

  useEffect(() => {
    return () => {
      if (activePolygonLayer) {
        activePolygonLayer.closeTooltip?.();
        activePolygonLayer.setStyle?.(defaultStyle);
        activePolygonLayer = null;
      }
    };
  }, []);

  if (!geoData) return null;

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const name = props.name || 'Unnamed Region';

    const tooltipContent = `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 2px 6px;">
        <strong style="color: #111827; font-size: 14px;">${name}</strong>
        <span style="display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px;">
          Administrative Boundary
        </span>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: false,
      permanent: false,
      direction: 'top',
      className: 'admin-bounds-tooltip',
      opacity: 0.95,
    });

    layer.on({
      mouseover: (e) => {
        const l = e.target;

        if (activePolygonLayer && activePolygonLayer !== l) {
          activePolygonLayer.closeTooltip?.();
          activePolygonLayer.setStyle?.(defaultStyle);
        }

        activePolygonLayer = l;

        l.setStyle?.(hoverStyle);
        l.bringToFront?.();
        l.openTooltip?.(e.latlng);
      },

      mousemove: (e) => {
        if (activePolygonLayer === e.target) {
          e.target.openTooltip?.(e.latlng);
        }
      },

      mouseout: (e) => {
        const l = e.target;

        l.closeTooltip?.();
        l.setStyle?.(defaultStyle);

        if (activePolygonLayer === l) {
          activePolygonLayer = null;
        }
      },

      click: (e) => {
        const l = e.target;

        l.closeTooltip?.();

        if (activePolygonLayer === l) {
          activePolygonLayer = null;
        }
      },
    });
  };

  return (
    <GeoJSON
      data={geoData}
      style={defaultStyle}
      onEachFeature={onEachFeature}
    />
  );
}
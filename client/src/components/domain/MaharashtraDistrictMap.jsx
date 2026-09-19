import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { districtService, requirementService } from '../../services/api';

const MAHARASHTRA_BOUNDS = [
  [15.5, 72.5],
  [22.1, 80.9],
];

const DISTRICT_NAME_ALIASES = {
  Mumbai: 'Mumbai City',
  Aurangabad: 'Chhatrapati Sambhajinagar',
  Osmanabad: 'Dharashiv',
  Ahmadnagar: 'Ahilyanagar',
  Bid: 'Beed',
};

const SEVERITY_STYLES = Object.freeze({
  CRITICAL: { fillColor: '#DC2626', fillOpacity: 0.78 },
  HIGH: { fillColor: '#F97316', fillOpacity: 0.75 },
  MEDIUM: { fillColor: '#FACC15', fillOpacity: 0.72 },
  LOW: { fillColor: '#22C55E', fillOpacity: 0.68 },
  NONE: { fillColor: '#D1D5DB', fillOpacity: 0.62 },
});

const NUTRITION_STYLES = Object.freeze({
  VERY_HIGH: { fillColor: '#DC2626', fillOpacity: 0.78 },
  HIGH: { fillColor: '#F97316', fillOpacity: 0.75 },
  MODERATE: { fillColor: '#FACC15', fillOpacity: 0.72 },
  LOWER: { fillColor: '#22C55E', fillOpacity: 0.68 },
  UNAVAILABLE: { fillColor: '#D1D5DB', fillOpacity: 0.62 },
});

const URGENCY_PRIORITY = Object.freeze({
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
});

function getDistrictName(feature) {
  const sourceName = feature?.properties?.dtname || feature?.properties?.district || feature?.properties?.NAME_2;
  return DISTRICT_NAME_ALIASES[sourceName] || sourceName || 'Unknown district';
}

function normalizeDistrictName(name) {
  const normalized = String(name || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  const aliases = {
    ahmednagar: 'ahilyanagar',
    ahmadnagar: 'ahilyanagar',
    aurangabad: 'chhatrapati sambhajinagar',
    osmanabad: 'dharashiv',
    bid: 'beed',
    buldana: 'buldhana',
    gondiya: 'gondia',
    raigarh: 'raigad',
    mumbai: 'mumbai city',
  };
  return aliases[normalized] || normalized;
}

function hasRemainingQuantity(requirement) {
  const items = Array.isArray(requirement.items) ? requirement.items : [];
  return items.some((item) => Number(item.quantityRemaining ?? item.quantity_remaining ?? 0) > 0);
}

function daysUntil(expiresAt) {
  if (!expiresAt) return 14;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function buildUrgencyByDistrict(requirements) {
  return requirements.reduce((districtUrgencies, requirement) => {
    const status = String(requirement.status || '').toLowerCase();
    const urgency = String(requirement.urgency || '').toUpperCase();
    const isRelevant = (
      (status === 'active' || status === 'partially_supported') &&
      daysUntil(requirement.expiresAt) > 0 &&
      hasRemainingQuantity(requirement) &&
      URGENCY_PRIORITY[urgency]
    );

    if (!isRelevant) return districtUrgencies;

    const district = normalizeDistrictName(requirement.district);
    const currentPriority = URGENCY_PRIORITY[districtUrgencies[district]] || 0;
    if (district && URGENCY_PRIORITY[urgency] > currentPriority) {
      districtUrgencies[district] = urgency;
    }
    return districtUrgencies;
  }, {});
}

function FitMaharashtraBounds({ preview }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MAHARASHTRA_BOUNDS, {
      paddingTopLeft: [18, 18],
      paddingBottomRight: preview ? [18, 78] : [18, 18],
    });
  }, [map, preview]);

  return null;
}

function CtrlWheelZoom({ enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return undefined;

    const container = map.getContainer();
    const handleWheel = (event) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      map.setZoom(map.getZoom() + (event.deltaY < 0 ? 1 : -1));
    };

    map.scrollWheelZoom.disable();
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, map]);

  return null;
}

export default function MaharashtraDistrictMap({
  selectedDistrict,
  onDistrictSelect,
  urgencyByDistrict,
  nutritionByDistrict = {},
  mapMode = 'institution',
  preview = false,
}) {
  const [districtData, setDistrictData] = useState(null);
  const [districtApiData, setDistrictApiData] = useState([]);
  const [liveUrgencyByDistrict, setLiveUrgencyByDistrict] = useState({});
  const [loadError, setLoadError] = useState('');
  const [hoveredDistrict, setHoveredDistrict] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch('/data/maharashtra-districts.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error('District boundaries could not be loaded.');
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setDistrictData(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (urgencyByDistrict !== undefined) return undefined;

    let isMounted = true;
    requirementService.getAll({ limit: 100 })
      .then((result) => {
        if (isMounted && Array.isArray(result.data)) {
          setLiveUrgencyByDistrict(buildUrgencyByDistrict(result.data));
        }
      })
      .catch(() => {
        // The map remains available with neutral fills when requirements are unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [urgencyByDistrict]);

  useEffect(() => {
    let isMounted = true;

    districtService.getAll()
      .then((result) => {
        if (isMounted && Array.isArray(result.data)) {
          setDistrictApiData(result.data);
        }
      })
      .catch(() => {
        // Boundary rendering remains available when the API is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveNutritionByDistrict = useMemo(() => {
    if (nutritionByDistrict && Object.keys(nutritionByDistrict).length > 0) {
      return nutritionByDistrict;
    }
    return districtApiData.reduce((acc, dist) => {
      acc[normalizeDistrictName(dist.name)] = dist.nutritionAttention?.level || 'UNAVAILABLE';
      return acc;
    }, {});
  }, [nutritionByDistrict, districtApiData]);

  if (loadError) {
    return <div className="flex h-full min-h-[inherit] items-center justify-center p-6 text-center text-sm text-red-700">{loadError}</div>;
  }

  if (!districtData) {
    return <div className="flex h-full min-h-[inherit] items-center justify-center p-6 text-sm text-[#64707A]">Loading Maharashtra district boundaries...</div>;
  }

  const districtStyle = (feature) => {
    const districtName = getDistrictName(feature);
    const normalizedDistrictName = normalizeDistrictName(districtName);
    const isSelected = normalizedDistrictName === normalizeDistrictName(selectedDistrict || '');
    const isHovered = normalizedDistrictName === normalizeDistrictName(hoveredDistrict || '');
    const districtUrgencies = urgencyByDistrict ?? liveUrgencyByDistrict;
    const severity = districtUrgencies[normalizedDistrictName] || 'NONE';
    const nutritionLevel = effectiveNutritionByDistrict[normalizedDistrictName] || 'UNAVAILABLE';
    const severityStyle = mapMode === 'nutrition'
      ? (NUTRITION_STYLES[nutritionLevel] || NUTRITION_STYLES.UNAVAILABLE)
      : (SEVERITY_STYLES[severity] || SEVERITY_STYLES.NONE);

    return {
      color: isSelected || isHovered ? '#1F2937' : '#304355',
      weight: isSelected || isHovered ? 3 : 1.2,
      fillColor: severityStyle.fillColor,
      fillOpacity: severityStyle.fillOpacity,
    };
  };

  const districtEvents = (feature, layer) => {
    const districtName = getDistrictName(feature);
    const districtRecord = districtApiData.find((district) =>
      normalizeDistrictName(district.name) === normalizeDistrictName(districtName)
    );

    layer.bindTooltip(
      districtRecord ? `${districtName} (${districtRecord.nutritionIndicators.length} indicators)` : districtName,
      { sticky: true, direction: 'top' }
    );
    layer.on({
      click: () => onDistrictSelect(districtName),
      mouseover: () => setHoveredDistrict(districtName),
      mouseout: () => setHoveredDistrict(''),
    });
  };

  return (
    <MapContainer
      center={[19.2, 75.5]}
      zoom={6}
      minZoom={5}
      maxZoom={10}
      scrollWheelZoom={false}
      dragging={!preview}
      zoomControl={!preview}
      className="relative z-0 isolate h-full w-full"
      aria-label="Interactive Maharashtra district map"
    >
      <FitMaharashtraBounds preview={preview} />
      <CtrlWheelZoom enabled={!preview} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={districtData}
        style={districtStyle}
        onEachFeature={districtEvents}
      />
    </MapContainer>
  );
}

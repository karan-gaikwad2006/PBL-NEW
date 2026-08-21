import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { districtService } from '../../services/api';

const MAHARASHTRA_BOUNDS = [
  [15.5, 72.5],
  [22.1, 80.9],
];

const DISTRICT_NAME_ALIASES = {
  Mumbai: 'Mumbai City',
  Aurangabad: 'Chhatrapati Sambhajinagar',
  Osmanabad: 'Dharashiv',
  Ahmadnagar: 'Ahilyanagar',
};

function getDistrictName(feature) {
  const sourceName = feature?.properties?.dtname || feature?.properties?.district || feature?.properties?.NAME_2;
  return DISTRICT_NAME_ALIASES[sourceName] || sourceName || 'Unknown district';
}

function normalizeDistrictName(name) {
  return name.trim().toLocaleLowerCase();
}

function FitMaharashtraBounds({ preview }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MAHARASHTRA_BOUNDS, {
      paddingTopLeft: [18, 18],
      paddingBottomRight: preview ? [18, 78] : [18, 18],
    });
  }, [map]);

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

export default function MaharashtraDistrictMap({ selectedDistrict, onDistrictSelect, preview = false }) {
  const [districtData, setDistrictData] = useState(null);
  const [districtApiData, setDistrictApiData] = useState([]);
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

  if (loadError) {
    return <div className="flex h-full min-h-[inherit] items-center justify-center p-6 text-center text-sm text-red-700">{loadError}</div>;
  }

  if (!districtData) {
    return <div className="flex h-full min-h-[inherit] items-center justify-center p-6 text-sm text-[#64707A]">Loading Maharashtra district boundaries...</div>;
  }

  const districtStyle = (feature) => {
    const districtName = getDistrictName(feature);
    const normalizedDistrictName = normalizeDistrictName(districtName);
    const isActive = normalizedDistrictName === normalizeDistrictName(selectedDistrict || '')
      || normalizedDistrictName === normalizeDistrictName(hoveredDistrict || '');

    return {
      color: isActive ? '#B45309' : '#304355',
      weight: isActive ? 3 : 1.2,
      fillColor: isActive ? '#FBBF24' : '#DDE7E3',
      fillOpacity: isActive ? 0.85 : 0.62,
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

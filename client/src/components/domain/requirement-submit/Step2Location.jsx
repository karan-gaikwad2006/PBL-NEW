import React, { useState } from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import TextArea from '../../common/TextArea';
import Button from '../../common/Button';
import { ArrowRight, Search, Navigation, Loader2 } from 'lucide-react';
import { getDistrictFromCoords, getLocalityFromCoords } from '../../../utils/geoUtils';

export default function Step2Location({ formData, updateData, onNext, onBack }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // 1. Determine District from GeoJSON
          const geoResponse = await fetch('/data/maharashtra-districts.geojson');
          if (!geoResponse.ok) throw new Error('Failed to load district data.');
          const geoJson = await geoResponse.json();
          const district = getDistrictFromCoords(latitude, longitude, geoJson);

          // 2. Determine City/Village via Reverse Geocoding
          const locality = await getLocalityFromCoords(latitude, longitude);

          if (district || locality) {
            updateData({
              state: 'maharashtra',
              district: district || formData.district,
              city: locality || formData.city,
            });

            if (!district) {
              setError('Locality detected, but could not confirm Maharashtra district. Please verify.');
            }
          } else {
            setError('Could not determine location details. Please enter manually.');
          }
        } catch (err) {
          setError('Failed to identify location details.');
          console.error(err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access was denied. Please allow location access or select a district manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('The request to get user location timed out.');
            break;
          default:
            setError('An unknown error occurred while detecting location.');
        }
      },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    if (!formData.state) return false;
    if (!formData.district.trim()) return false;
    if (!formData.city.trim()) return false;
    if (!formData.address.trim()) return false;
    return true;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">Where is this requirement?</h1>
        <p className="text-[#64707A]">Please provide the exact location so we can connect you with local resources efficiently.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        <div className="space-y-6">
          <Select
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="maharashtra">Maharashtra</option>
            <option value="gujarat">Gujarat</option>
            <option value="karnataka">Karnataka</option>
            <option value="other">Other</option>
          </Select>

          <Input
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Search district..."
            icon={Search}
            helperText="Start typing to search for your district."
            required
          />

          <Input
            label="City / Village"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Pune, Shirur"
            required
          />

          <div className="space-y-2">
            <TextArea
              label="Address / Location Details"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Provide specific landmark, street, or building details..."
              rows={3}
              required
            />
            
            <div className="mt-2 rounded-lg overflow-hidden border border-[#304355]/10 relative h-32 w-full bg-slate-100 flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDbTphLFvZDEdPuF70buJl0ducLrX-KDOPtUkdUNs5vEFv04fXf6hDmCnOlfYooklopfDz9QwnSsQSyKPhC8Uf1PNkLN2AhOl4ZHSR4NDggiz96JPrU-CkISzwGtgYJ18CIvmr21fNG0hAHX1JUNHLjWszZrhgDQI-B1mT_le0dC5U4mlcfps2CNXhvIPyzB-NXLQKsGgLGYlSRdluGpS-LOlFWbWBMqNxUdT52vQyYo9HVpayIAIu')" }}
              ></div>
              <button 
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="relative z-10 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-medium text-[#304355] flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {locating ? 'Detecting...' : 'Use current location'}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <Navigation className="w-3 h-3" /> {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}

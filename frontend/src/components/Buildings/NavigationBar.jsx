// NavigationBar.jsx - Fixed dropdown positioning
import React, { useState, useRef, useEffect } from 'react';
import { Building, Layers, Grid, Ruler, Search, Download, ChevronDown } from 'lucide-react';
import { buildings } from '../../utils/constants.js';

const NavigationBar = ({
  currentBuilding,
  currentFloor,
  setCurrentBuilding,
  setCurrentFloor,
  showGrid,
  setShowGrid,
  showDimensions,
  setShowDimensions,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportPDF
}) => {
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  

  
  const buildingRef = useRef(null);
  const floorRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buildingRef.current && !buildingRef.current.contains(event.target)) {
        setShowBuildingDropdown(false);
      }
      if (floorRef.current && !floorRef.current.contains(event.target)) {
        setShowFloorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuildingSelect = (building) => {
    setCurrentBuilding(building.name);
    setCurrentFloor(''); // Don't auto-select floor
    setShowBuildingDropdown(false);
  };

  const currentBuildingObj = buildings.find(b => b.name === currentBuilding);
  const displayBuilding = currentBuilding || 'Select a building...';
  const displayFloor = currentFloor || 'Select a floor...';
  const availableFloors = currentBuildingObj?.floors || [];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-200 shadow-lg relative z-50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Section - Building and Floor Selection */}
        <div className="flex items-center space-x-3">
          {/* Building Dropdown */}
          <div className="relative" ref={buildingRef}>
            <button
              onClick={() => setShowBuildingDropdown(!showBuildingDropdown)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm min-w-[200px] justify-between ${
                currentBuilding 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                  : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <span className="font-medium">{displayBuilding}</span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showBuildingDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showBuildingDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setCurrentBuilding('');
                    setCurrentFloor('');
                    setShowBuildingDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-50 italic border-b border-gray-100"
                >
                  Select a building...
                </button>
                {buildings.map(building => (
                  <button
                    key={building.id}
                    onClick={() => handleBuildingSelect(building)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      currentBuilding === building.name
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {building.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floor Dropdown */}
          <div className="relative" ref={floorRef}>
            <button
              onClick={() => currentBuilding && setShowFloorDropdown(!showFloorDropdown)}
              disabled={!currentBuilding}
              className={`flex items-center px-4 py-2 rounded-xl transition-all shadow-sm min-w-[160px] justify-between ${
                currentFloor && currentBuilding
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-white border-2 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                <span className="font-medium">{displayFloor}</span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFloorDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFloorDropdown && currentBuilding && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setCurrentFloor('');
                    setShowFloorDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-50 italic border-b border-gray-100"
                >
                  Select a floor...
                </button>
                {availableFloors.map(floor => (
                  <button
                    key={floor}
                    onClick={() => {
                      setCurrentFloor(floor);
                      setShowFloorDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      currentFloor === floor
                        ? 'bg-green-50 text-green-600 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Search and Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="no_request">No Request</option>
          </select>
        </div>

        {/* Right Section - View Controls and Export */}
        <div className="flex items-center space-x-3">
          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center px-4 py-2 rounded-xl transition-all ${
              showGrid 
                ? 'bg-purple-100 border border-purple-300 text-purple-700' 
                : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4 mr-2" />
            <span className="font-medium">Grid</span>
          </button>

          {/* Dimensions Toggle */}
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`flex items-center px-4 py-2 rounded-xl transition-all ${
              showDimensions 
                ? 'bg-cyan-100 border border-cyan-300 text-cyan-700' 
                : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title="Toggle Dimensions"
          >
            <Ruler className="w-4 h-4 mr-2" />
            <span className="font-medium">Dimensions</span>
          </button>

          {/* Export PDF */}
          <button 
            onClick={onExportPDF}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
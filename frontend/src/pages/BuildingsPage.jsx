// BuildingPage.jsx - Complete rewrite with proper backend integration
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, X, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { buildingsAPI, requestsAPI } from '../services/api.js';

// Import components
import NavigationBar from '../components/Buildings/NavigationBar.jsx';
import StatisticsLegend from '../components/Buildings/StatisticsLegend.jsx';
import Room from '../components/Buildings/Room.jsx';
import RequestModal from '../components/Buildings/RequestModal.jsx';
import RoomTooltip from '../components/Buildings/RoomTooltip.jsx';
import RoomDetails from '../components/Buildings/RoomDetails.jsx';

// Import utilities and constants
import { createBlueprintGrid, createBlueprintPaper } from '../utils/blueprintUtils.jsx';
import { BLUEPRINT_BG } from '../utils/constants.js';
import { getDefaultRoomsForFloor } from '../utils/roomLayouts.js';

const BuildingsPage = () => {
  // State management
  const [currentBuilding, setCurrentBuilding] = useState('');
  const [currentFloor, setCurrentFloor] = useState('');
  const [currentBuildingObj, setCurrentBuildingObj] = useState(null);
  const [currentFloorObj, setCurrentFloorObj] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ description: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  });
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // Calculate statistics from rooms
  const calculateStatistics = (rooms) => {
    return {
      total: rooms.length,
      pending: rooms.filter(r => r.status === 'pending').length,
      in_progress: rooms.filter(r => r.status === 'in_progress').length,
      completed: rooms.filter(r => r.status === 'completed').length
    };
  };

  // Fetch rooms and merge with layout
  const fetchRooms = useCallback(async () => {
    if (!currentBuilding || !currentFloor) {
      setBlueprintData(null);
      setStatistics({ total: 0, pending: 0, in_progress: 0, completed: 0 });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get all buildings to find the current one
      const buildingsResponse = await buildingsAPI.getAll();
      const buildingsData = Array.isArray(buildingsResponse.data) 
        ? buildingsResponse.data 
        : buildingsResponse.data.results || [];

      console.log('Available buildings from API:', buildingsData);
      console.log('Looking for building:', currentBuilding);

      const building = buildingsData.find(b => b.name === currentBuilding);

      if (!building) {
        console.error('Building not found. Available buildings:', buildingsData.map(b => b.name));
        throw new Error(`Building "${currentBuilding}" not found in database. Available: ${buildingsData.map(b => b.name).join(', ')}`);
      }
            
      setCurrentBuildingObj(building);
      
      // Step 2: Get floors for this building
      const floorsResponse = await buildingsAPI.getFloors(building.id);
      const floorsData = Array.isArray(floorsResponse.data) 
        ? floorsResponse.data 
        : floorsResponse.data.results || [];

      console.log('Available floors from API:', floorsData);
      console.log('Looking for floor:', currentFloor);

      const floor = floorsData.find(f => f.label === currentFloor);

      if (!floor) {
        console.error('Floor not found. Available floors:', floorsData.map(f => f.label));
        throw new Error(`Floor "${currentFloor}" not found in database. Available: ${floorsData.map(f => f.label).join(', ')}`);
      }
      
      setCurrentFloorObj(floor);
      
      // Step 3: Get rooms for this floor
      const roomsResponse = await buildingsAPI.getRooms(floor.id);
      const apiRoomsData = Array.isArray(roomsResponse.data) 
        ? roomsResponse.data 
        : roomsResponse.data.results || [];

      // Step 4: Get ALL maintenance requests for this building/floor
      const maintenanceResponse = await requestsAPI.getAll();
      const allRequests = Array.isArray(maintenanceResponse.data) 
        ? maintenanceResponse.data 
        : maintenanceResponse.data.results || [];

      // Filter requests for current building and floor
      const floorRequests = allRequests.filter(req => 
        req.building?.id === building.id && 
        req.floor?.id === floor.id &&
        req.status !== 'approved'
      );

      // Step 5: Get the default layout
      const blueprint = getDefaultRoomsForFloor(currentBuilding, currentFloor);

      // Step 6: Merge API data with layout AND add real maintenance status
      const mergedRooms = blueprint.rooms.map(layoutRoom => {
        // Skip special rooms (hallways, stairs)
        if (layoutRoom.special === 'hallway' || layoutRoom.special === 'stairs') {
          return layoutRoom;
        }
        
        // Try to find matching room from API by name
        const apiRoom = apiRoomsData.find(r => {
          if (!r.name) return false;
          
          const apiName = r.name.toLowerCase();
          const roomNumber = layoutRoom.room_number?.toLowerCase() || '';
          const roomName = layoutRoom.room_name?.toLowerCase() || '';
          
          return apiName === roomNumber || 
                apiName === roomName || 
                (roomNumber && apiName.includes(roomNumber));
        });
        
        if (apiRoom) {
          // Room exists in backend - get its maintenance requests
          const roomRequests = floorRequests.filter(req => 
            req.room?.id === apiRoom.id && 
            req.status !== 'approved'
          );
          
          // Calculate status based on requests
          let status = 'no_request';
          if (roomRequests.length > 0) {
            const hasPending = roomRequests.some(r => r.status === 'pending');
            const hasInProgress = roomRequests.some(r => r.status === 'in_progress');
            const allCompleted = roomRequests.every(r => r.status === 'completed');
            
            if (hasPending) status = 'pending';
            else if (hasInProgress) status = 'in_progress';
            else if (allCompleted) status = 'completed';
          }
          
          return {
            ...layoutRoom,
            id: apiRoom.id,
            room_name: apiRoom.name,
            status: status,
            request_count: roomRequests.length
          };
        }
        
        // Room doesn't exist in backend yet - use layout defaults
        return layoutRoom;
      });

      setBlueprintData({ ...blueprint, rooms: mergedRooms });
      setStatistics(calculateStatistics(mergedRooms));
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(error.message || 'Failed to load room data. Using default layout.');
      
      // Fallback to default layout
      const blueprint = getDefaultRoomsForFloor(currentBuilding, currentFloor);
      setBlueprintData(blueprint);
      setStatistics(calculateStatistics(blueprint.rooms));
    } finally {
      setIsLoading(false);
    }
  }, [currentBuilding, currentFloor]);

  // Fetch maintenance requests for a specific room
  const fetchRoomRequests = async (roomId) => {
    if (!roomId) return;
    
    setIsLoadingRequests(true);
    try {
      const response = await requestsAPI.getByRoom(roomId);
      const allRequestsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];

      // Filter out approved requests
      const requestsData = allRequestsData.filter(req => req.status !== 'approved');

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load maintenance requests.');
      setRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Handle room click
  const handleRoomClick = (room) => {
    // Don't allow clicking on special rooms
    if (room.special === 'title' || room.special === 'scale' || room.special === 'hallway' || room.special === 'stairs') {
      return;
    }
    
    setSelectedRoom(room);
    
    // Only fetch requests if room has a backend ID
    if (room.id && typeof room.id === 'number') {
      fetchRoomRequests(room.id);
    } else {
      setRequests([]);
    }
  };

  // Submit new maintenance request
  const handleSubmitRequest = async () => {
    if (!selectedRoom || !newRequest.description.trim()) {
      setError('Please provide a description for the maintenance request.');
      return;
    }
    
    if (!selectedRoom.id || typeof selectedRoom.id !== 'number') {
      setError('This room is not yet registered in the system. Please contact an administrator.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const username = localStorage.getItem('username') || 'Anonymous';
      
      const requestData = {
        room_id: selectedRoom.id,
        building_id: currentBuildingObj?.id,
        floor_id: currentFloorObj?.id,
        description: newRequest.description.trim(),
        requester_name: username,
        role: 'staff'
      };
      
      await requestsAPI.create(requestData);
      
      // Reset form and close modal
      setNewRequest({ description: '' });
      setShowRequestModal(false);
      
      // Refresh data
      await fetchRooms();
      if (selectedRoom.id) {
        await fetchRoomRequests(selectedRoom.id);
      }
      
      setError(null);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMsg = error.response?.data?.description 
        ? `Description: ${error.response.data.description}`
        : 'Failed to submit maintenance request. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    alert('PDF export would be implemented here. For now, you can use browser print (Ctrl+P) and save as PDF.');
  };

  // Filter rooms based on search and status
  const getFilteredRooms = () => {
    if (!blueprintData) return [];
    
    let filtered = blueprintData.rooms;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.room_number?.toLowerCase().includes(term) ||
        room.room_name?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // Fetch rooms when building or floor changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Render the blueprint
  const renderBlueprint = () => {
    if (!blueprintData) return null;
    
    const { canvasWidth, canvasHeight } = blueprintData;
    const filteredRooms = getFilteredRooms();
    const viewWidth = Math.min(1200, canvasWidth);
    const viewHeight = Math.min(700, canvasHeight);
    
    return (
      <div className="flex flex-row">
        <StatisticsLegend statistics={statistics} />
        <svg 
          width={viewWidth} 
          height={viewHeight} 
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            background: BLUEPRINT_BG,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {createBlueprintPaper()}
          
          <rect 
            x="20" 
            y="20" 
            width={canvasWidth - 40} 
            height={canvasHeight - 40} 
            fill="url(#blueprint-pattern)"
            stroke="#93C5FD" 
            strokeWidth="1" 
            strokeOpacity="0.5"
          />
          
          {showGrid && createBlueprintGrid(canvasWidth, canvasHeight)}
          
          {filteredRooms.map((room, index) => (
            <Room
              key={`${room.id}-${index}`}
              room={room}
              isHovered={hoveredRoom?.id === room.id}
              isSelected={selectedRoom?.id === room.id}
              showDimensions={showDimensions}
              onMouseEnter={() => setHoveredRoom(room)}
              onMouseLeave={() => setHoveredRoom(null)}
              onClick={() => handleRoomClick(room)}
            />
          ))}
        </svg>
        
        {(statusFilter !== 'all' || searchTerm.trim()) && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm shadow-lg">
            Showing {filteredRooms.length} of {blueprintData.rooms.length} rooms
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 p-4 md:p-6">
      {/* Error Display */}
      <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
        <Link to="/management/">← Back to Management Overview</Link>
      </button>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex-1">
          {/* Navigation Bar */}
          <NavigationBar
            currentBuilding={currentBuilding}
            currentFloor={currentFloor}
            setCurrentBuilding={setCurrentBuilding}
            setCurrentFloor={setCurrentFloor}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showDimensions={showDimensions}
            setShowDimensions={setShowDimensions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onExportPDF={handleExportPDF}
          />

          {/* Blueprint Display Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg overflow-visible">
            {!currentBuilding || !currentFloor ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Building className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Select a building and floor to view the blueprint</p>
                <p className="text-gray-400 text-sm mt-2">Use the dropdowns above to get started</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading blueprint...</p>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="overflow-auto rounded-xl bg-gradient-to-br from-blue-50 to-gray-100 p-4"
              >
                <div className="inline-block">
                  {renderBlueprint()}
                </div>
              </div>
            )}
          </div>

          {/* Room Details Panel */}
          <RoomDetails
            selectedRoom={selectedRoom}
            requests={requests}
            isLoadingRequests={isLoadingRequests}
            onNewRequest={() => setShowRequestModal(true)}
          />
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        show={showRequestModal}
        selectedRoom={selectedRoom}
        newRequest={newRequest}
        setNewRequest={setNewRequest}
        isSubmitting={isSubmitting}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSubmitRequest}
      />

      {/* Room Tooltip */}
      <RoomTooltip room={hoveredRoom} containerRef={containerRef} />
    </div>
    <Footer/>
    </>
  );
};

export default BuildingsPage;
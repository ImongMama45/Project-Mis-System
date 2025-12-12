// roomLayouts.js - Floor layout definitions
// This file contains all the room layout logic for different buildings and floors
// Import this into BuildingPage.jsx

const createRoom = (id, room_number, room_name, x, y, width, height, status = 'no_request', request_count = 0, special = null) => ({
  id, room_number, room_name, x, y, width, height, status, request_count, special
});

export const getDefaultRoomsForFloor = (building, floor) => {
  const layouts = {
  'New Building': {
    'Ground Floor': () => {
      const rooms = [];
      const startX = 40;
      const startY = 40;
      const roomWidth = 140;
      const roomHeight = 100;
      const hallwayHeight = 60;
      const stairsWidth = roomWidth;
      const stairsHeight = 80;
      const crWidth = 70;
      const crHeight = 60;
      const gap = 20;

      rooms.push(createRoom('STAIRS_LEFT', 'STAIRS', 'Stairs', startX, startY, 80, 120, 'no_request', 0, 'stairs'));

      const crMaleX = startX + 80 + gap;
      rooms.push(createRoom('CR_MALE_GF', 'CR M', 'Male CR', crMaleX, startY, crWidth, crHeight, 'no_request', 0));

      const nb1X = crMaleX + crWidth + gap;
      rooms.push(createRoom('NB1', 'NB1', 'Room NB1', nb1X, startY, roomWidth, roomHeight, 'no_request', 0));

      const hallwayStartX = startX;
      const hallwayEndX = nb1X + roomWidth;
      const hallwayWidth = hallwayEndX - hallwayStartX;
      const firstHallwayY = startY + 120 + gap/2;
      rooms.push(createRoom('HALLWAY_TOP', 'HALL', 'Hallway', hallwayStartX, firstHallwayY, hallwayWidth, hallwayHeight, 'no_request', 0, 'hallway'));

      const nb2X = nb1X + roomWidth + gap;
      rooms.push(createRoom('NB2', 'NB2', 'Room NB2', nb2X, startY, roomWidth, roomHeight, 'no_request', 0));

      const nb3Y = startY + roomHeight + gap;
      rooms.push(createRoom('NB3', 'NB3', 'Room NB3', nb2X, nb3Y, roomWidth, roomHeight, 'no_request', 0));

      const extraGap = 60;
      const crFemaleX = nb2X + extraGap;
      const nb3Bottom = nb3Y + roomHeight;
      rooms.push(createRoom('CR_FEMALE_GF', 'CR F', 'Female CR', crFemaleX, nb3Bottom + gap, crWidth, crHeight, 'no_request', 0));

      const crBottom = nb3Bottom + gap + crHeight;
      const stairsRightX = nb2X;
      rooms.push(createRoom('STAIRS_RIGHT', 'STAIRS', 'Stairs', stairsRightX, crBottom + gap, stairsWidth, stairsHeight, 'no_request', 0, 'stairs'));

      const secondHallwayWidth = crWidth;
      const topHallwayRightX = hallwayStartX + hallwayWidth;
      const secondHallwayX = topHallwayRightX - 80;
      
      const crFemaleTop = nb3Bottom + gap;
      const stairsRightBottom = crBottom + gap + stairsHeight;
      const secondHallwayHeight = stairsRightBottom - crFemaleTop;
      
      rooms.push(createRoom('HALLWAY_LEFT_SIDE', 'HALL', 'Hallway', secondHallwayX, crFemaleTop, secondHallwayWidth, secondHallwayHeight, 'no_request', 0, 'hallway'));

      const canvasWidth = Math.max(
        nb2X + roomWidth + gap*2,
        crFemaleX + crWidth + gap
      );
      const canvasHeight = Math.max(
        firstHallwayY + hallwayHeight + gap,
        crBottom + gap + stairsHeight + gap*2
      );

      return { rooms, canvasWidth, canvasHeight };
    },
    '2nd Floor': () => {
      const rooms = [];
      const startX = 40;
      const startY = 40;
      const roomWidth = 140;
      const roomHeight = 100;
      const hallwayHeight = 60;
      const stairsWidth = roomWidth;
      const stairsHeight = 80;
      const crWidth = 70;
      const crHeight = 60;
      const gap = 20;

      rooms.push(createRoom('STAIRS_LEFT_2F', 'STAIRS', 'Stairs', startX, startY, 80, 120, 'no_request', 0, 'stairs'));

      const crMaleX = startX + 80 + gap;
      rooms.push(createRoom('CR_MALE_2F', 'CR M', 'Male CR', crMaleX, startY, crWidth, crHeight, 'no_request', 0));

      const nb4X = crMaleX + crWidth + gap;
      rooms.push(createRoom('NB4', 'NB4', 'Room NB4', nb4X, startY, roomWidth, roomHeight, 'no_request', 0));

      const hallwayStartX = startX;
      const hallwayEndX = nb4X + roomWidth;
      const hallwayWidth = hallwayEndX - hallwayStartX;
      const firstHallwayY = startY + 120 + gap/2;
      rooms.push(createRoom('HALLWAY_TOP_2F', 'HALL', 'Hallway', hallwayStartX, firstHallwayY, hallwayWidth, hallwayHeight, 'no_request', 0, 'hallway'));

      const nb5X = nb4X + roomWidth + gap;
      rooms.push(createRoom('NB5', 'NB5', 'Room NB5', nb5X, startY, roomWidth, roomHeight, 'no_request', 0));

      const nb6Y = startY + roomHeight + gap;
      rooms.push(createRoom('NB6', 'NB6', 'Room NB6', nb5X, nb6Y, roomWidth, roomHeight, 'no_request', 0));

      const extraGap = 60;
      const crFemaleX = nb5X + extraGap;
      const nb6Bottom = nb6Y + roomHeight;
      rooms.push(createRoom('CR_FEMALE_2F', 'CR F', 'Female CR', crFemaleX, nb6Bottom + gap, crWidth, crHeight, 'no_request', 0));

      const crBottom = nb6Bottom + gap + crHeight;
      const stairsRightX = nb5X;
      rooms.push(createRoom('STAIRS_RIGHT_2F', 'STAIRS', 'Stairs', stairsRightX, crBottom + gap, stairsWidth, stairsHeight, 'no_request', 0, 'stairs'));

      const secondHallwayWidth = crWidth;
      const topHallwayRightX = hallwayStartX + hallwayWidth;
      const secondHallwayX = topHallwayRightX - 80;
      
      const crFemaleTop = nb6Bottom + gap;
      const stairsRightBottom = crBottom + gap + stairsHeight;
      const secondHallwayHeight = stairsRightBottom - crFemaleTop;
      
      rooms.push(createRoom('HALLWAY_LEFT_SIDE_2F', 'HALL', 'Hallway', secondHallwayX, crFemaleTop, secondHallwayWidth, secondHallwayHeight, 'no_request', 0, 'hallway'));

      const canvasWidth = Math.max(
        nb5X + roomWidth + gap*2,
        crFemaleX + crWidth + gap
      );
      const canvasHeight = Math.max(
        firstHallwayY + hallwayHeight + gap,
        crBottom + gap + stairsHeight + gap*2
      );

      return { rooms, canvasWidth, canvasHeight };
    },
    '3rd Floor': () => {
      const rooms = [];
      const startX = 40;
      const startY = 40;
      const roomWidth = 140;
      const roomHeight = 100;
      const hallwayHeight = 60;
      const stairsWidth = roomWidth;
      const stairsHeight = 80;
      const crWidth = 70;
      const crHeight = 60;
      const gap = 20;

      rooms.push(createRoom('STAIRS_LEFT_3F', 'STAIRS', 'Stairs', startX, startY, 80, 120, 'no_request', 0, 'stairs'));

      const crMaleX = startX + 80 + gap;
      rooms.push(createRoom('CR_MALE_3F', 'CR M', 'Male CR', crMaleX, startY, crWidth, crHeight, 'no_request', 0));

      const nb7X = crMaleX + crWidth + gap;
      rooms.push(createRoom('NB7', 'NB7', 'Room NB7', nb7X, startY, roomWidth, roomHeight, 'no_request', 0));

      const hallwayStartX = startX;
      const hallwayEndX = nb7X + roomWidth;
      const hallwayWidth = hallwayEndX - hallwayStartX;
      const firstHallwayY = startY + 120 + gap/2;
      rooms.push(createRoom('HALLWAY_TOP_3F', 'HALL', 'Hallway', hallwayStartX, firstHallwayY, hallwayWidth, hallwayHeight, 'no_request', 0, 'hallway'));

      const nb8X = nb7X + roomWidth + gap;
      rooms.push(createRoom('NB8', 'NB8', 'Room NB8', nb8X, startY, roomWidth, roomHeight, 'no_request', 0));

      const nb9Y = startY + roomHeight + gap;
      rooms.push(createRoom('NB9', 'NB9', 'Room NB9', nb8X, nb9Y, roomWidth, roomHeight, 'no_request', 0));

      const extraGap = 60;
      const crFemaleX = nb8X + extraGap;
      const nb9Bottom = nb9Y + roomHeight;
      rooms.push(createRoom('CR_FEMALE_3F', 'CR F', 'Female CR', crFemaleX, nb9Bottom + gap, crWidth, crHeight, 'no_request', 0));

      const crBottom = nb9Bottom + gap + crHeight;
      const stairsRightX = nb8X;
      rooms.push(createRoom('STAIRS_RIGHT_3F', 'STAIRS', 'Stairs', stairsRightX, crBottom + gap, stairsWidth, stairsHeight, 'no_request', 0, 'stairs'));

      const secondHallwayWidth = crWidth;
      const topHallwayRightX = hallwayStartX + hallwayWidth;
      const secondHallwayX = topHallwayRightX - 80;
      
      const crFemaleTop = nb9Bottom + gap;
      const stairsRightBottom = crBottom + gap + stairsHeight;
      const secondHallwayHeight = stairsRightBottom - crFemaleTop;
      
      rooms.push(createRoom('HALLWAY_LEFT_SIDE_3F', 'HALL', 'Hallway', secondHallwayX, crFemaleTop, secondHallwayWidth, secondHallwayHeight, 'no_request', 0, 'hallway'));

      const canvasWidth = Math.max(
        nb8X + roomWidth + gap*2,
        crFemaleX + crWidth + gap
      );
      const canvasHeight = Math.max(
        firstHallwayY + hallwayHeight + gap,
        crBottom + gap + stairsHeight + gap*2
      );

      return { rooms, canvasWidth, canvasHeight };
    }
  },
    'DFA Building': {
      '2nd Floor': () => {
        const rooms = [];
        const startX = 50;
        const startY = 50;
        
        const aWidth = 80;
        const aHeight = 80;
        const stairsWidth = 220;
        const hallwayHeight = 100;
        const officeWidth = 100;
        const officeHeight = 80;
        const dllWidth = 90;
        const dllHeight = 80;
        
        const gap = 15;

        const topRooms = [
          { id: 'STAIRS_TOP', number: 'STAIRS', name: 'Stairs', status: 'no_request', requests: 0, special: 'stairs', width: stairsWidth },
          { id: 'A12', number: 'A12', name: 'Room A12', status: 'no_request', requests: 1, width: aWidth },
          { id: 'A10', number: 'A10', name: 'Room A10', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A8', number: 'A8', name: 'Room A8', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A6', number: 'A6', name: 'Room A6', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A4', number: 'A4', name: 'Room A4', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A2', number: 'A2', name: 'Room A2', status: 'no_request', requests: 0, width: aWidth },
          { id: 'DLL_MUSIC_ARTS', number: 'DLL', name: 'DLL Music & Arts', status: 'no_request', requests: 0, width: dllWidth, offsetX: 50}
        ];

        let currentX = startX;
        topRooms.forEach(room => {
          rooms.push(createRoom(
            room.id,
            room.number,
            room.name,
            currentX,
            startY,
            room.width,
            room.id === 'DLL_MUSIC_ARTS' ? dllHeight : aHeight,
            room.status,
            room.requests,
            room.special
          ));
          currentX += room.width + gap;
        });

        const hallwayY = startY + aHeight + gap;
        const hallwayWidth = currentX - startX - gap;
        rooms.push(createRoom(
          'HALLWAY',
          'HALL',
          'Main Hallway',
          startX,
          hallwayY,
          hallwayWidth,
          hallwayHeight,
          'no_request',
          0,
          'hallway'
        ));

        const bottomRooms = [
          { id: 'SSC_OFFICE', number: 'SSC', name: 'SSC Office', status: 'no_request', requests: 0, width: officeWidth },
          { id: 'CR_FEMALE', number: 'CR F', name: 'Female CR', status: 'no_request', requests: 0, width: officeWidth, special: 'cr' },
          { id: 'CR_MALE', number: 'CR M', name: 'Male CR', status: 'no_request', requests: 0, width: officeWidth, special: 'cr' },
          { id: 'A11', number: 'A11', name: 'Room A11', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A9', number: 'A9', name: 'Room A9', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A7', number: 'A7', name: 'Room A7', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A5', number: 'A5', name: 'Room A5', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A3', number: 'A3', name: 'Room A3', status: 'no_request', requests: 0, width: aWidth },
          { id: 'A1', number: 'A1', name: 'Room A1', status: 'no_request', requests: 0, width: aWidth }
        ];

        currentX = startX;
        const bottomY = hallwayY + hallwayHeight + gap;
        bottomRooms.forEach(room => {
          rooms.push(createRoom(
            room.id,
            room.number,
            room.name,
            currentX,
            bottomY,
            room.width,
            room.id.startsWith('A') ? aHeight : officeHeight,
            room.status,
            room.requests,
            room.special
          ));
          currentX += room.width + gap;
        });

        const canvasWidth = currentX + startX;
        const canvasHeight = bottomY + aHeight + startY;

        return { rooms, canvasWidth, canvasHeight };
      }
    },
    'Annex Building': {
 'Ground Floor': () => {
    const rooms = [];
    const startX = 50;
    const startY = 50;
    const officeWidth = 120;
    const officeHeight = 80;
    const stairsWidth = 60;
    const stairsHeight = 60;
    const roomWidth = 80;
    const roomHeight = 100;
    const crWidth = 70;
    const crHeight = 50;
    const gap = 15;
    const hallwayHeight = 50;

    let currentY = startY;
    
    rooms.push(createRoom(
      'GUIDANCE',
      'GUIDANCE',
      'Guidance Office',
      startX,
      currentY,
      officeWidth,
      officeHeight,
      'no_request',
      0
    ));
    
    rooms.push(createRoom(
      'STAIRS',
      'STAIRS',
      'Stairs',
      startX + officeWidth + gap,
      currentY,
      stairsWidth,
      stairsHeight,
      'no_request',
      0,
      'stairs'
    ));
    
    currentY += officeHeight + gap;
    
    rooms.push(createRoom(
      'CLINIC',
      'CLINIC',
      'Clinic',
      startX,
      currentY,
      officeWidth,
      officeHeight,
      'no_request',
      0
    ));

    const roomsStartX = startX + officeWidth + stairsWidth + gap * 2;
    const roomsStartY = startY;
    
    const roomNumbers = ['101', '102', '103', '104', '105'];
    let currentX = roomsStartX;
    
    roomNumbers.forEach((num, index) => {
      rooms.push(createRoom(
        num,
        num,
        `Room ${num}`,
        currentX,
        roomsStartY,
        roomWidth,
        roomHeight,
        num === '101' || num === '102' ? 'pending' : 
        (num === '103' ? 'completed' : 'no_request'),
        num === '101' || num === '102' ? 1 : 
        (num === '103' ? 1 : 0)
      ));
      currentX += roomWidth + gap;
    });
    
    const crStartX = currentX;
    const totalCRHeight = crHeight * 2 + gap;
    const crVerticalCenter = roomsStartY + (roomHeight - totalCRHeight) / 2;
    
    rooms.push(createRoom(
      'CR_FEMALE_GF',
      'CR F',
      'Female CR',
      crStartX,
      crVerticalCenter,
      crWidth,
      crHeight,
      'no_request',
      0
    ));
    
    rooms.push(createRoom(
      'CR_MALE_GF',
      'CR M',
      'Male CR',
      crStartX,
      crVerticalCenter + crHeight + gap,
      crWidth,
      crHeight,
      'no_request',
      0
    ));
    
    const hallwayY = roomsStartY + roomHeight + gap;
    const hallwayStartX = roomsStartX;
    const hallwayEndX = crStartX + crWidth;
    
    rooms.push({
      id: 'HALLWAY_GF',
      label: 'HALL',
      name: 'Hallway',
      x: hallwayStartX,
      y: hallwayY,
      width: hallwayEndX - hallwayStartX,
      height: hallwayHeight,
      status: 'no_request',
      requests: 0,
      special: 'hallway',
      color: '#DBEAFE',
      borderColor: '#93C5FD'
    });
    
    const propertyY = hallwayY + hallwayHeight + gap;
    const propertyX = roomsStartX;
    
    rooms.push(createRoom(
      'PROPERTY',
      'PROPERTY',
      'Property Office',
      propertyX,
      propertyY,
      officeWidth,
      officeHeight,
      'no_request',
      0
    ));
    
    const bottomSectionY = propertyY + officeHeight + gap * 2;
    
    const financeEndX = startX + officeWidth * 3 + gap * 2;
    
    rooms.push(createRoom(
      'LOBBY',
      'LOBBY',
      'Lobby',
      startX,
      bottomSectionY,
      financeEndX - startX,
      officeHeight,
      'no_request',
      0
    ));
    
    const bottomOffices = [
      { id: 'REGISTRATION', name: 'Registration Office', status: 'no_request', requests: 0 },
      { id: 'PRESIDENTS_OFFICE', name: 'President\'s Office', status: 'no_request', requests: 0 },
      { id: 'FINANCE', name: 'Finance Office', status: 'no_request', requests: 0 }
    ];
    
    const bottomRowY = bottomSectionY + officeHeight + gap;
    currentX = startX;
    
    bottomOffices.forEach(office => {
      rooms.push(createRoom(
        office.id,
        office.name.split(' ')[0].toUpperCase(),
        office.name,
        currentX,
        bottomRowY,
        officeWidth,
        officeHeight,
        office.status,
        office.requests
      ));
      currentX += officeWidth + gap;
    });

    const leftBottomWidth = officeWidth * 3 + gap * 2;
    const rightWidth = Math.max(crStartX + crWidth, propertyX + officeWidth);
    const canvasWidth = Math.max(leftBottomWidth, rightWidth) + startX * 2;
    
    const canvasHeight = bottomRowY + officeHeight + startY;

    return { rooms, canvasWidth, canvasHeight };
  },
 '2nd Floor': () => {
  const rooms = [];
  const startX = 50;
  const startY = 50;
  const officeWidth = 120;
  const officeHeight = 80;
  const stairsWidth = 60;
  const stairsHeight = 60;
  const roomWidth = 80;
  const roomHeight = 100;
  const crWidth = 70;
  const crHeight = 50;
  const gap = 15;
  const hallwayHeight = 50;

  let currentY = startY;
  
  rooms.push(createRoom(
    '219',
    '219',
    'Room 219',
    startX,
    currentY,
    officeWidth,
    officeHeight,
    'no_request',
    0
  ));
  
  rooms.push(createRoom(
    'STAIRS_2F',
    'STAIRS',
    'Stairs',
    startX + officeWidth + gap,
    currentY,
    stairsWidth,
    stairsHeight,
    'no_request',
    0,
    'stairs'
  ));
  
  const roomsStartX = startX + officeWidth + stairsWidth + gap * 2;
  const roomsStartY = startY;
  
  const topRowRooms = ['201', '202', '203', '204', '205', '206'];
  let currentX = roomsStartX;
  
  topRowRooms.forEach((num, index) => {
    rooms.push(createRoom(
      num,
      num,
      `Room ${num}`,
      currentX,
      roomsStartY,
      roomWidth,
      roomHeight,
      num === '201' || num === '202' || num === '204' ? 'pending' : 
      (num === '203' ? 'completed' : 
      (num === '206' ? 'in_progress' : 'no_request')),
      num === '201' || num === '202' || num === '204' ? 1 : 
      (num === '203' ? 1 : 
      (num === '206' ? 2 : 0))
    ));
    currentX += roomWidth + gap;
  });
  
  const crStartX = currentX;
  const totalCRHeight = crHeight * 2 + gap;
  const crVerticalCenter = roomsStartY + (roomHeight - totalCRHeight) / 2;
  
  rooms.push(createRoom(
    'CR_FEMALE_2F',
    'CR F',
    'Female CR',
    crStartX,
    crVerticalCenter,
    crWidth,
    crHeight,
    'no_request',
    0
  ));
  
  rooms.push(createRoom(
    'CR_MALE_2F',
    'CR M',
    'Male CR',
    crStartX,
    crVerticalCenter + crHeight + gap,
    crWidth,
    crHeight,
    'no_request',
    0
  ));
  
  const hallwayY = roomsStartY + roomHeight + gap;
  const hallwayStartX = roomsStartX;
  const hallwayEndX = crStartX + crWidth;
  
  rooms.push({
    id: 'HALLWAY_2F',
    label: 'HALL',
    name: 'Hallway',
    x: hallwayStartX,
    y: hallwayY,
    width: hallwayEndX - hallwayStartX,
    height: hallwayHeight,
    status: 'no_request',
    requests: 0,
    special: 'hallway',
    color: '#DBEAFE',
    borderColor: '#93C5FD'
  });
  
  const bottomRowY = hallwayY + hallwayHeight + gap;
  const bottomRowStartX = hallwayStartX;
  
  const bottomRooms = [
    { id: '213', status: 'no_request', requests: 0 },
    { id: '212', status: 'no_request', requests: 0 },
    { id: '211', status: 'no_request', requests: 0 },
    { id: '210', status: 'no_request', requests: 0 },
    { id: '209', status: 'no_request', requests: 0 },
    { id: '208', status: 'no_request', requests: 0 },
    { id: '207', status: 'no_request', requests: 0 }
  ];
  
  let bottomCurrentX = bottomRowStartX;
  
  bottomRooms.forEach(room => {
    rooms.push(createRoom(
      room.id,
      room.id,
      `Room ${room.id}`,
      bottomCurrentX,
      bottomRowY,
      roomWidth,
      roomHeight,
      room.status,
      room.requests
    ));
    bottomCurrentX += (roomWidth + gap);
  });
  
  const avrWidth = officeWidth + stairsWidth + gap;
  const avrHeight = roomHeight;
  const avrX = startX;
  const avrY = bottomRowY;
  
  rooms.push(createRoom(
    'AVR_ROOM',
    'AVR',
    'AVR Room',
    avrX,
    avrY,
    avrWidth,
    avrHeight,
    'no_request',
    0
  ));

  const leftSideWidth = avrWidth;
  const rightWidth = Math.max(crStartX + crWidth, bottomCurrentX);
  const canvasWidth = Math.max(leftSideWidth + gap, rightWidth) + startX * 2;
  
  const canvasHeight = bottomRowY + roomHeight + startY;

  return { rooms, canvasWidth, canvasHeight };
},
  '3rd Floor': () => {
  const rooms = [];
  const startX = 50;
  const startY = 50;
  const stairsWidth = 60;
  const stairsHeight = 80;
  const gap = 20;
  
  const speechLabWidth = 120;
  const speechLabHeight = 100;
  
  const comLabWidth = speechLabWidth + stairsWidth + gap;
  const comLabHeight = 120;
  
  const hallwayHeight = 40;

  rooms.push(createRoom(
    'SPEECH_LAB',
    'SPEECH LAB',
    'Speech Laboratory',
    startX,
    startY,
    speechLabWidth,
    speechLabHeight,
    'no_request',
    0
  ));

  rooms.push(createRoom(
    'STAIRS_3F',
    'STAIRS',
    'Stairs',
    startX + speechLabWidth + gap,
    startY,
    stairsWidth,
    stairsHeight,
    'no_request',
    0,
    'stairs'
  ));

  const comLab3X = startX + speechLabWidth + stairsWidth + gap * 2;
  rooms.push(createRoom(
    'COMLAB_3',
    'COMLAB 3',
    'Computer Lab 3',
    comLab3X,
    startY,
    comLabWidth,
    comLabHeight,
    'no_request',
    0
  ));

  const comLab4X = comLab3X + comLabWidth + gap;
  rooms.push(createRoom(
    'COMLAB_5',
    'COMLAB 5',
    'Computer Lab 5',
    comLab4X,
    startY,
    comLabWidth,
    comLabHeight,
    'no_request',
    0
  ));

  const hallwayY = startY + comLabHeight + gap;
  const hallwayWidth = comLabWidth * 2 + gap;
  rooms.push({
    id: 'HALLWAY_3F',
    label: 'HALL',
    name: 'Hallway',
    x: comLab3X,
    y: hallwayY,
    width: hallwayWidth,
    height: hallwayHeight,
    status: 'no_request',
    requests: 0,
    special: 'hallway',
    color: '#DBEAFE',
    borderColor: '#93C5FD'
  });

  const bottomRowY = hallwayY + hallwayHeight + gap;
  
  rooms.push(createRoom(
    'COMLAB_1',
    'COMLAB 1',
    'Computer Lab 1',
    startX,
    bottomRowY,
    comLabWidth,
    comLabHeight,
    'no_request',
    0
  ));

  const comLab2X = startX + comLabWidth + gap;
  rooms.push(createRoom(
    'COMLAB_2',
    'COMLAB 2',
    'Computer Lab 2',
    comLab2X,
    bottomRowY,
    comLabWidth,
    comLabHeight,
    'no_request',
    0
  ));

  rooms.push(createRoom(
    'COMLAB_4',
    'COMLAB 4',
    'Computer Lab 4',
    comLab4X,
    bottomRowY,
    comLabWidth,
    comLabHeight,
    'no_request',
    0
  ));

  const totalWidth = Math.max(
    startX + comLabWidth * 2 + gap,
    comLab4X + comLabWidth
  );
  
  const maxBottom = bottomRowY + comLabHeight;
  
  const canvasWidth = totalWidth + startX;
  const canvasHeight = maxBottom + startY;

  return { rooms, canvasWidth, canvasHeight };
},
'4th Floor': () => {
    const rooms = [];
    const startX = 50;
    const startY = 50;
    const officeWidth = 120;
    const officeHeight = 100;
    const stairsWidth = 60;
    const stairsHeight = 80;
    const gap = 20;
    
    rooms.push(createRoom('OFFICE_4F', 'OFFICE', 'Office', startX, startY, officeWidth, officeHeight, 'no_request', 0));
    
    const stairsY = startY + (officeHeight - stairsHeight) / 2;
    rooms.push(createRoom('STAIRS_4F', 'STAIRS', 'Stairs', startX + officeWidth + gap, stairsY, stairsWidth, stairsHeight, 'no_request', 0, 'stairs'));
    
    const room401Height = officeHeight * 2;
    const room401Width = officeWidth;
    rooms.push(createRoom('401', '401', 'Room 401', startX, startY + officeHeight + gap, room401Width, room401Height, 'no_request', 0));
    
    const room402Height = room401Height / 2;
    const room402Width = room401Width * 2;
    
    const room402Y = startY + officeHeight + gap + (room401Height - room402Height);
    rooms.push(createRoom('402', '402', 'Room 402', startX + room401Width + gap, room402Y, room402Width, room402Height, 'no_request', 0));

    const topRowWidth = officeWidth + stairsWidth + gap;
    const bottomRowWidth = room401Width + room402Width + gap;
    const totalWidth = Math.max(topRowWidth, bottomRowWidth) + startX * 2;
    
    const totalHeight = startY + officeHeight + gap + room401Height + 40;

    return { 
        rooms, 
        canvasWidth: totalWidth, 
        canvasHeight: totalHeight 
    };
    } // Close the layouts object
  }
  };
  const layout = layouts[building]?.[floor];
  return layout ? layout() : { rooms: [], canvasWidth: 800, canvasHeight: 600 };
};

// NOTE: Due to the large size of this file, you should copy the entire
// getDefaultRoomsForFloor function from your original component.
// The structure is already set up correctly above.
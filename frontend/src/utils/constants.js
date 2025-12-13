// constants.js - Color palette and status configurations

export const BLUEPRINT_BG = '#0B1220';
export const BLUEPRINT_PAPER = '#F8FBFD';
export const BLUEPRINT_LINE = '#0A0A0A';
export const BLUEPRINT_LABEL = '#1E3A8A';
export const BLUEPRINT_TEXT = '#374151';
export const BLUEPRINT_GRID = '#3B82F6';
export const BLUEPRINT_HALLWAY = '#DBEAFE';
export const BLUEPRINT_STAIRS = '#BFDBFE';
export const BLUEPRINT_CR = '#E0F2FE';

export const statusColors = {
  pending: '#FFD700',
  in_progress: '#FF8C00',
  completed: '#4CAF50',
  no_request: '#E5E7EB'
};

export const buildings = [
  { id: 'NEW_BUILDING', name: 'New Building', floors: ['Ground Floor', '2nd Floor', '3rd Floor'] },
  { id: 'DFA_BUILDING', name: 'DFA Building', floors: ['Ground Floor','2nd Floor'] },
  { id: 'ANNEX', name: 'Annex Building', floors: ['Ground Floor', '2nd Floor', '3rd Floor', '4th Floor'] },
];
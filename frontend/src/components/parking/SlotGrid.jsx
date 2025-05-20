import React from 'react';
import PropTypes from 'prop-types';

const SlotGrid = ({ slots, selectedSlotId, onSelectSlot }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          onClick={() => onSelectSlot(slot)}
          className={`p-4 border rounded cursor-pointer ${
            selectedSlotId === slot.id ? 'bg-primary-50 border-primary-600' : 'border-gray-300'
          }`}
        >
          <p className="font-semibold">Slot {slot.slotNumber}</p>
          <p className="text-sm text-gray-600">Parking: {slot.parkingName || 'N/A'}</p>
          <p className="text-sm text-gray-600">Spaces: {slot.availableSpaces}</p>
          <p className="text-sm text-gray-600">
            Rate: {slot.chargePerHour.toLocaleString('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 })}/hr
          </p>
          <p className="text-sm text-gray-600">Location: {slot.location || 'N/A'}</p>
          <p className="text-sm text-gray-600">Type: {slot.type}</p>
          <p className="text-sm text-gray-600">Size: {slot.size}</p>
          <p className="text-sm text-gray-600">Vehicle: {slot.vehicleType || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
};

SlotGrid.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      slotNumber: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      vehicleType: PropTypes.string,
      parkingName: PropTypes.string,
      availableSpaces: PropTypes.number.isRequired,
      chargePerHour: PropTypes.number.isRequired,
      location: PropTypes.string,
    })
  ).isRequired,
  selectedSlotId: PropTypes.string,
  onSelectSlot: PropTypes.func.isRequired,
};

export default SlotGrid;
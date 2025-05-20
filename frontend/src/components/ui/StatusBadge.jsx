import React from 'react';
import Badge from './Badge';

const StatusBadge = ({ status, className = '' }) => {
  let variant;
  
  switch (status) {
    case 'APPROVED':
      variant = 'success';
      break;
    case 'PENDING':
      variant = 'warning';
      break;
    case 'PAID':
      variant = 'success';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
      variant = 'danger';
      break;
    case 'COMPLETED':
      variant = 'primary';
      break;
    case 'EXPIRED':
    case 'REFUNDED':
      variant = 'secondary';
      break;
    default:
      variant = 'secondary';
      break;
  }
  
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
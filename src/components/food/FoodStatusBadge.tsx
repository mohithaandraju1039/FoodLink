import React from 'react';
import { ListingStatus } from '../../types';
import { Badge } from '../common/Badge';
import { CheckCircle2, Clock, AlertCircle, XCircle, PackageCheck } from 'lucide-react';

interface FoodStatusBadgeProps {
  status: ListingStatus;
}

export const FoodStatusBadge: React.FC<FoodStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="success">
          <Clock className="w-3 h-3" /> Active
        </Badge>
      );
    case 'CLAIMED':
      return (
        <Badge variant="warning">
          <AlertCircle className="w-3 h-3" /> Claimed
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="info">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="danger">
          <XCircle className="w-3 h-3" /> Expired
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="neutral">
          <XCircle className="w-3 h-3" /> Cancelled
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

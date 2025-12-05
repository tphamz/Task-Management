import React from 'react';
import { UnitStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, PlayCircle } from 'lucide-react';

interface Props {
  status: UnitStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    [UnitStatus.OPEN]: "bg-blue-100 text-blue-800 border-blue-200",
    [UnitStatus.SUBMITTED]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [UnitStatus.SUCCESS]: "bg-green-100 text-green-800 border-green-200",
    [UnitStatus.REWORK]: "bg-red-100 text-red-800 border-red-200",
  };

  const icons = {
    [UnitStatus.OPEN]: <PlayCircle className="w-3 h-3 mr-1" />,
    [UnitStatus.SUBMITTED]: <Clock className="w-3 h-3 mr-1" />,
    [UnitStatus.SUCCESS]: <CheckCircle2 className="w-3 h-3 mr-1" />,
    [UnitStatus.REWORK]: <AlertCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

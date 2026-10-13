import React from 'react';
import {
  Stethoscope,
  Baby,
  HeartHandshake,
  Sparkles,
  FlaskConical,
  Activity,
  Syringe,
  HeartPulse,
} from 'lucide-react';

export function ServiceIcon({
  name,
  className = 'w-6 h-6',
}: {
  name?: string;
  className?: string;
}) {
  switch (name) {
    case 'Baby':
      return <Baby className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Syringe':
      return <Syringe className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Stethoscope':
    default:
      return <Stethoscope className={className} />;
  }
}

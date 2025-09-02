import React from 'react';
import { PersonalAccountContent } from '@/components/ui/PersonalAccountContent';

interface PersonalAccountProps {
  user?: {
    username?: string;
    email?: string;
    created_at?: string | Date;
    is_admin?: boolean;
    invoice?: number;
  };
  onLogout?: () => void;
}

const PersonalAccount: React.FC<PersonalAccountProps> = ({ user, onLogout }) => {
  return <PersonalAccountContent user={user} onLogout={onLogout} />;
};

export default PersonalAccount;
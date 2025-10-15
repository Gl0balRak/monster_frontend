import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDocumentationEditor } from '@/components/admin/AdminPanel';

const AdminDocumentationPage: React.FC = () => {
  return (
    <AdminLayout title="">
      <AdminDocumentationEditor />
    </AdminLayout>
  );
};

export default AdminDocumentationPage;
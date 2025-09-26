import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { AccountSettings } from '@/components/AccountSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackupRestore } from '@/components/BackupRestore';
import { DisplaySettings } from '@/components/Settings/DisplaySettings';
import { StorageSettings } from '@/components/Settings/StorageSettings';
import { UploadSettings } from '@/components/Settings/UploadSettings';
import { PrivacySettings } from '@/components/Settings/PrivacySettings';
import { SearchSettings } from '@/components/Settings/SearchSettings';
import { useSettingsStore } from '@/store/settingsStore';

export const Settings = () => {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 h-full overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and application preferences
          </p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Display & Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📱 Display & Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DisplaySettings />
            </CardContent>
          </Card>

          {/* Storage & Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                💾 Storage & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StorageSettings />
            </CardContent>
          </Card>

          {/* Upload Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📤 Upload Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadSettings />
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🔐 Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrivacySettings />
            </CardContent>
          </Card>

          {/* Search & Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🔍 Search & Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchSettings />
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountSettings />
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BackupRestore />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
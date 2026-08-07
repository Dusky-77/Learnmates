import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { DeviceList } from '../components/lock-in/DeviceList';
import { useLockInSession } from '../components/lock-in/LockInContext';
import { Button, Card, Input } from '../components/ui';
import { Flame, Clock } from 'lucide-react';

export default function LockIn() {
  const { user } = useAuth();
  const [sessionMinutes, setSessionMinutes] = useState<number>(60);
  const [deviceRoles, setDeviceRoles] = useState<Record<string, 'locked' | 'open'>>({});
  
  const { devices, currentDevice, deviceId, startSession } = useLockInSession();

  const handleLockDevice = (targetDeviceId: string) => {
    setDeviceRoles(prev => {
      const newRoles = { ...prev, [targetDeviceId]: 'locked' } as Record<string, 'locked' | 'open'>;
      if (user) {
        supabase.channel(`user_devices_${user.id}`).send({
          type: 'broadcast',
          event: 'roles_sync',
          payload: { deviceRoles: newRoles }
        });
      }
      return newRoles;
    });
  };

  const handleOpenDevice = (targetDeviceId: string) => {
    setDeviceRoles(prev => {
      const newRoles = { ...prev, [targetDeviceId]: 'open' } as Record<string, 'locked' | 'open'>;
      if (user) {
        supabase.channel(`user_devices_${user.id}`).send({
          type: 'broadcast',
          event: 'roles_sync',
          payload: { deviceRoles: newRoles }
        });
      }
      return newRoles;
    });
  };

  const handleMakeHost = async (targetDeviceId: string) => {
    if (!user) return;
    await supabase.from('user_devices').update({ is_host: false }).eq('user_id', user.id).eq('is_host', true);
    await supabase.from('user_devices').update({ is_host: true }).eq('user_id', user.id).eq('device_id', targetDeviceId);
  };

  const handleStartSession = async () => {
    if (!user) return;
    const lockUntil = new Date(Date.now() + sessionMinutes * 60 * 1000).toISOString();
    
    const updates = devices.map(d => {
      let role = deviceRoles[d.device_id];
      if (!role) {
        role = d.device_id === deviceId ? 'open' : 'locked';
      }
      
      return supabase
        .from('user_devices')
        .update({ 
          status: role, 
          lock_until: role === 'locked' ? lockUntil : null 
        })
        .eq('user_id', user.id)
        .eq('device_id', d.device_id);
    });

    await startSession(sessionMinutes, updates);
  };

  if (!currentDevice) {
    return <div className="p-8 text-center text-gray-500">Connecting to lobby...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
          <Flame className="text-blue-500" />
          Lock In Lobby
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect all your devices here. Choose which devices to lock and which to keep open during your study session.
        </p>
      </div>

      {currentDevice.is_host ? (
        <Card variant="default" padding="lg" className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Session Duration (minutes)
              </label>
              <Input 
                type="number" 
                min={1} 
                max={240} 
                value={sessionMinutes} 
                onChange={(e) => setSessionMinutes(Number(e.target.value))} 
                className="max-w-[200px]"
              />
            </div>
            <Button onClick={handleStartSession} variant="primary" size="lg">
              Start Session
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" padding="lg" className="mb-8 bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
          <div className="flex items-center justify-center p-4">
            <p className="text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Waiting for host device to configure and start the session...
            </p>
          </div>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Devices</h2>
        <span className="text-sm text-gray-500">{devices.length} connected</span>
      </div>

      <DeviceList 
        devices={devices} 
        currentDeviceId={deviceId} 
        onLockDevice={handleLockDevice} 
        onOpenDevice={handleOpenDevice} 
        onMakeHost={handleMakeHost}
        deviceRoles={deviceRoles}
        isHost={currentDevice.is_host}
      />
    </div>
  );
}

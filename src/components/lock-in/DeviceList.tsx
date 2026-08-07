import React from 'react';
import { Laptop, Smartphone, Monitor, Crown } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { motion } from 'framer-motion';

export interface UserDevice {
  id: string;
  device_id: string;
  device_name: string;
  status: 'lobby' | 'locked' | 'open';
  lock_until: string | null;
  last_active_at: string;
  is_host: boolean;
}

interface DeviceListProps {
  devices: UserDevice[];
  currentDeviceId: string;
  onLockDevice: (deviceId: string) => void;
  onOpenDevice: (deviceId: string) => void;
  onMakeHost: (deviceId: string) => void;
  deviceRoles: Record<string, 'locked' | 'open'>;
  isHost: boolean;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, currentDeviceId, onLockDevice, onOpenDevice, onMakeHost, deviceRoles, isHost }) => {
  const getDeviceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) return <Smartphone className="h-8 w-8" />;
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) return <Laptop className="h-8 w-8" />;
    return <Monitor className="h-8 w-8" />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => {
        const isCurrent = device.device_id === currentDeviceId;
        const role = deviceRoles[device.device_id] || (isCurrent ? 'open' : 'locked');

        return (
          <motion.div key={device.device_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card variant="elevated" padding="md" className={`relative overflow-hidden ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                {isCurrent && <Badge variant="primary">This Device</Badge>}
                {device.is_host && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Host
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                  {getDeviceIcon(device.device_name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-20" title={device.device_name}>
                    {device.device_name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    {role === 'locked' && <Badge variant="danger">Locked</Badge>}
                    {role === 'open' && <Badge variant="success">Open</Badge>}
                  </div>
                </div>
              </div>
              
              {isHost && (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`flex-1 ${role === 'locked' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-900/30'}`}
                      onClick={() => onLockDevice(device.device_id)}
                    >
                      Lock
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`flex-1 ${role === 'open' ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-900 dark:hover:bg-green-900/30'}`}
                      onClick={() => onOpenDevice(device.device_id)}
                    >
                      Keep Open
                    </Button>
                  </div>
                  {!device.is_host && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-900/50 dark:hover:bg-yellow-900/30 dark:text-yellow-500"
                      onClick={() => onMakeHost(device.device_id)}
                    >
                      <Crown className="w-4 h-4 mr-2" /> Make Host
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

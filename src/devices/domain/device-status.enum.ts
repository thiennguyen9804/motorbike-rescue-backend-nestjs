export enum DeviceStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

export const DeviceStatusMap = {
  [DeviceStatus.OFFLINE]: 'offline',
  [DeviceStatus.ONLINE]: 'online',
};

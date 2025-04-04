export enum DeviceStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

export enum DeviceStatusStr {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

export const DeviceStatusMap = {
  [DeviceStatus.OFFLINE]: DeviceStatusStr.OFFLINE,
  [DeviceStatus.ONLINE]: DeviceStatusStr.ONLINE,
};
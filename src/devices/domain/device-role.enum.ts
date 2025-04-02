export enum DeviceRole {
  DEVICE = 0,
  ADMIN = 1,
}

export const DeviceRoleMap = {
  [DeviceRole.DEVICE]: 'device',
  [DeviceRole.ADMIN]: 'admin',
};

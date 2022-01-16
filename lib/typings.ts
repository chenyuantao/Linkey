export enum ROW_STATUS {
  DELETED = 0,
  EXIST = 1,
}

export enum MEMBER_ROLE {
  NONE = 0, // 没有身份，代表不是空间成员
  OWNER = 1, // 创建者/所有者
  MANAGER = 2, // 管理员
  NORMAL = 3, // 普通成员
}

export enum SPACE_PERMISSION {
  PUBLIC = 1, // 完全公开
  HALF_PUBLIC = 2, // 半公开
  PRIVATE = 3, // 私密
}

export enum CHANNEL_PRIVACY {
  PUBLIC_AUTO = 1, // 公开，且加入到space的人将自动加入该群聊
  PUBLIC_MANUAL = 2, // 公开，但需要手动加入
  PRIVATE = 3, // 私密，需要通过创建者邀请才能加入
}

export const MANAGER_ROLES = [MEMBER_ROLE.OWNER, MEMBER_ROLE.MANAGER];

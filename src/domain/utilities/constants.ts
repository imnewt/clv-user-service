// Ports and hosts
export const GATEWAY_PORT = 9001;
export const USER_SERVICE_PORT = 9002;
export const FRONTEND_SERVICE_PORT = 3000;
export const GATEWAY_HOST_URL = `http://localhost:${GATEWAY_PORT}`;
export const DASHBOARD_URL = `http://localhost:${FRONTEND_SERVICE_PORT}`;

// Errors
export const INVALID_REFRESH_TOKEN = 'Invalid Refresh Token';

// Kafka
export const KAFKA_BROKER_ADDRESS = 'localhost:9092';
export const KAFKA_GROUP_ID = 'user-service';

export const SEND_WELCOME_MAIL = 'send-welcome-mail';
export const SEND_RESET_PASSWORD_MAIL = 'send-reset-password-mail';

// Database
export const ADMIN_ROLE_ID = '1';
export const USER_ROLE_ID = '2';

export enum PERMISSION {
  CREATE_USER = '1',
  READ_USER = '2',
  UPDATE_USER = '3',
  DELETE_USER = '4',
  CREATE_ROLE = '5',
  READ_ROLE = '6',
  UPDATE_ROLE = '7',
  DELETE_ROLE = '8',
  READ_PERMISSION = '9',
  CREATE_VESSEL = '10',
  READ_VESSEL = '11',
  UPDATE_VESSEL = '12',
  DELETE_VESSEL = '13',
}

export enum MODULE {
  GENERIC = 'generic',
  AUTH = 'auth',
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
}

export enum ERROR {
  FAIL_VALIDATION_FROM_GOOGLE = 'Failed validation from Google!',
  TOKEN_HAS_EXPIRED = 'Token has expired!',
  INVALID_REFRESH_TOKEN = 'Invalid refresh token!',
  UNAUTHORIZED = 'Unauthorized!',

  EMAIL_HAS_BEEN_USED = 'Email has been used!',
  USER_NOT_FOUND = 'User not found!',
  WRONG_PASSWORD = 'Wrong password!',

  ROLE_NOT_FOUND = 'Role not found!',
  ROLE_NAME_HAS_BEEN_USED = 'Role name has been used!',
  CAN_NOT_UPDATE_ROLE = 'You can not update this role!',
  CAN_NOT_DELETE_ROLE = 'You can not delete this role!',
  ROLE_IS_BEING_USED = 'This role is being used. Please delete users who have this role first!',

  PERMISSION_NOT_FOUND = 'Permission not found!',
  NOT_HAVE_PERMISSION = "You don't have permission to perform this action!",
  SOMETHING_WENT_WRONG = 'Something went wrong. Please try again later!',
}

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export default class EnvironmentAuditMetadata {
  metadata:
    | EnvironmentMetadataType
    | ApiKeyMetadataType
    | PermissionMetadataType
    | ValuesMetadataType;
}

export class EnvironmentMetadataType {
  name: string;
  color?: EnvironmentColor;
}

export class ApiKeyMetadataType {
  hiddenKey: string;
}

export class PermissionMetadataType {
  userName: string;
  previousRole: EnvironmentPermissionRole;
  newRole: EnvironmentPermissionRole;
}

export class ValuesMetadataType {
  environmentName: string;
  updatedProperties?: string[];
  readProperties?: string[];
}

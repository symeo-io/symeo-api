import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export default class EnvironmentAuditMetadata {
  metadata:
    | EnvironmentMetadataType
    | ApiKeyMetadataType
    | PermissionMetadataType
    | ValuesMetadataType;
}

class EnvironmentMetadataType {
  name: string;
  color?: EnvironmentColor;
}

class ApiKeyMetadataType {
  hiddenKey: string;
}

class PermissionMetadataType {
  userName: string;
  previousRole: EnvironmentPermissionRole;
  newRole: EnvironmentPermissionRole;
}

class ValuesMetadataType {
  environmentName: string;
  updatedProperties?: string[];
  readProperties?: string[];
}

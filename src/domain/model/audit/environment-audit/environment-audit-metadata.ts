import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export default class EnvironmentAuditMetadata {
  metadata:
    | EnvironmentMetadataType
    | ApiKeyMetadataType
    | PermissionMetadataType
    | ValuesMetadataType
    | RollbackMetadataType;
}

export type EnvironmentMetadataType = {
  name: string;
  color?: EnvironmentColor;
};

export type ApiKeyMetadataType = {
  hiddenKey: string;
};

export type PermissionMetadataType = {
  userName: string;
  previousRole: EnvironmentPermissionRole;
  newRole: EnvironmentPermissionRole;
};

export type ValuesMetadataType = UpdatedPropertiesType | ReadPropertiesType;

type UpdatedPropertiesType = {
  environmentName: string;
  updatedProperties: string[];
};

type ReadPropertiesType = {
  environmentName: string;
  readProperties: string[];
};

export type RollbackMetadataType = {
  versionId: string;
  versionCreationDate: Date;
};

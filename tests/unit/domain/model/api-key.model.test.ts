import { v4 as uuid } from 'uuid';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import { base64decode } from 'nodejs-base64';

describe('ApiKey', () => {
  describe('buildForEnvironmentId', () => {
    it('should build the api key', () => {
      // Given
      const environmentId = uuid();

      // When
      const apiKey = ApiKey.buildForEnvironmentId(environmentId);

      // Then
      expect(apiKey.id).toBeDefined();
      expect(apiKey.environmentId).toEqual(environmentId);
      expect(apiKey.key).toBeDefined();

      const splitApiKey = apiKey.key.split('.');
      expect(splitApiKey.length).toEqual(2);

      const keyHeader = JSON.parse(base64decode(splitApiKey[0]));

      expect(keyHeader.id).toEqual(apiKey.id);
      expect(apiKey.environmentId).toEqual(apiKey.environmentId);
    });
  });
});

import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryBranchMock } from 'tests/utils/mocks/fetch-vcs-repository-branch.mock';
import { CreateVcsBlobMock } from 'tests/utils/mocks/create-vcs-blob.mock';
import { CreateVcsTreeMock } from 'tests/utils/mocks/create-vcs-tree.mock';
import { CreateVcsCommitMock } from 'tests/utils/mocks/create-vcs-commit.mock';
import { UpdateVcsRepositoryRefMock } from 'tests/utils/mocks/update-vcs-repository-ref.mock';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryBranchMock: FetchVcsRepositoryBranchMock;
  let createVcsBlobMock: CreateVcsBlobMock;
  let createVcsTreeMock: CreateVcsTreeMock;
  let createVcsCommitMock: CreateVcsCommitMock;
  let updateVcsRepositoryRefMock: UpdateVcsRepositoryRefMock;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchVcsRepositoryBranchMock = new FetchVcsRepositoryBranchMock(appClient);
    createVcsBlobMock = new CreateVcsBlobMock(appClient);
    createVcsTreeMock = new CreateVcsTreeMock(appClient);
    createVcsCommitMock = new CreateVcsCommitMock(appClient);
    updateVcsRepositoryRefMock = new UpdateVcsRepositoryRefMock(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(async () => {
    await appClient.mockReset();
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.axiosMockGithub.restore();
  });

  describe('(POST) /repositories/:repositoryVcsId/commit/:branch', () => {
    it('should call github to create commit', async () => {
      // Given
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repositoryVcsId = faker.datatype.number();
      const branch = faker.lorem.slug();
      const fileContent = faker.lorem.text();
      const filePath = faker.lorem.slug();
      const commitMessage = faker.lorem.lines(1);

      const branchStub =
        fetchVcsRepositoryBranchMock.mockGithubRepositoriesBranchPresent(
          repositoryVcsId,
          branch,
        );
      const blobStub =
        createVcsBlobMock.mockCreateRepositoryBlob(repositoryVcsId);
      const treeStub =
        createVcsTreeMock.mockCreateRepositoryTree(repositoryVcsId);
      const commitStub =
        createVcsCommitMock.mockGithubCreateRepositoryCommit(repositoryVcsId);
      updateVcsRepositoryRefMock.mockUpdateRef(repositoryVcsId, branch);

      await appClient
        .request(currentUser)
        .post(`/api/v1/repositories/${repositoryVcsId}/commit/${branch}`)
        .send({ fileContent, filePath, commitMessage })
        .expect(201);

      expect(appClient.axiosMockGithub.history.post[0].data).toEqual(
        JSON.stringify({
          content: fileContent,
          encoding: 'utf-8',
        }),
      );

      expect(appClient.axiosMockGithub.history.post[1].data).toEqual(
        JSON.stringify({
          base_tree: branchStub.commit.sha,
          tree: [
            {
              path: filePath,
              mode: '100644',
              type: 'blob',
              sha: blobStub.sha,
            },
          ],
        }),
      );

      expect(appClient.axiosMockGithub.history.post[2].data).toEqual(
        JSON.stringify({
          message: commitMessage,
          author: {
            name: currentUser.username,
            email: currentUser.email,
          },
          parents: [branchStub.commit.sha],
          tree: treeStub.sha,
        }),
      );

      expect(appClient.axiosMockGithub.history.post[3].data).toEqual(
        JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: commitStub.sha,
        }),
      );
    });

    it('should call gitlab to create commit', async () => {
      // Given
      const currentUser = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      const repositoryVcsId = faker.datatype.number();
      const branch = faker.lorem.slug();
      const fileContent = faker.lorem.text();
      const filePath = faker.lorem.slug();
      const commitMessage = faker.lorem.lines(1);

      fetchVcsRepositoryBranchMock.mockGitlabRepositoriesBranchPresent(
        repositoryVcsId,
        branch,
      );

      createVcsCommitMock.mockGitlabCreateRepositoryCommit(
        repositoryVcsId,
        branch,
        fileContent,
        filePath,
      );

      await appClient
        .request(currentUser)
        .post(`/api/v1/repositories/${repositoryVcsId}/commit/${branch}`)
        .send({ fileContent, filePath, commitMessage })
        .expect(201);

      expect(appClient.axiosMockGitlab.history.post[0].data).toEqual(
        JSON.stringify({
          content: fileContent,
          encoding: 'text',
          commit_message: commitMessage,
          branch: branch,
        }),
      );
    });
  });
});

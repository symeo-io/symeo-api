export default interface AnalyticsPort {
  valuesReadBySdk(environmentId: string): Promise<void>;
}

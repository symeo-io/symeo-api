import { config } from 'symeo-js/config';
import tracer from 'dd-trace';

if (config.datadog.apm.active) {
  tracer.init({
    service: config.datadog.service,
    env: config.datadog.env,
  });
}

export default tracer;

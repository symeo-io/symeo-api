import { config } from 'symeo-js/config';
import tracer from 'dd-trace';

if (config.datadog.apm.active) {
  tracer.init();
}

export default tracer;

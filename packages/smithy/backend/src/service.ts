import { ServiceContext } from './context.js';
import { SmithyService } from './generated/ssdk/index.js';
import { Echo } from './operations/echo.js';

// Register operations to the service here
export const Service: SmithyService<ServiceContext> = {
  Echo,
};

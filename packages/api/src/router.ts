import { listUsers } from './procedures/listUsers.js';
import { addUser } from './procedures/addUser.js';
import { listCompanies } from './procedures/listCompanies.js';
import { addCompany } from './procedures/addCompany.js';
import { t } from './init.js';

export const router = t.router;

export const appRouter = router({
  listUsers,
  addUser,
  listCompanies,
  addCompany,
});

export type AppRouter = typeof appRouter;

import { addUser, listUsers } from './procedures/user.js';
import { addCompany, listCompanies } from './procedures/company.js';
import { addProvider, listProviders } from './procedures/provider.js';
import { t } from './init.js';

export const router = t.router;

export const appRouter = router({
  users: router({ list: listUsers, add: addUser }),
  companies: router({ list: listCompanies, add: addCompany }),
  providers: router({ list: listProviders, add: addProvider }),
});

export type AppRouter = typeof appRouter;

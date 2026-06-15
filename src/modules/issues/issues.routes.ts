import { Router } from 'express';
import { create, getAll, getOne, update, remove } from './issues.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
// Public
router.get('/',    getAll);
router.get('/:id', getOne);
// Authenticated any logged-in user 
router.post('/', authenticate, create);
// Authenticated permission logic 
router.patch('/:id', authenticate, update);
//Maintainer only role check done
router.delete('/:id', authenticate, authorize('maintainer'), remove);

export default router;
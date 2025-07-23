import express from 'express';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../controllers/menuController.js';
const router = express.Router();

router.get('/', getMenus);
router.post('/', createMenu);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

export default router;

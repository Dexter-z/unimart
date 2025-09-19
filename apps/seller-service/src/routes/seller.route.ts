import { Router } from 'express';
import { isSellerAuthenticated } from '@packages/middleware/isAuthenticated';
import { getSellerNotifications, markAsRead } from '../controllers/seller.controllers';

const router = Router();

router.get('/seller-notifications', isSellerAuthenticated, getSellerNotifications);
router.put('/mark-as-read/:notificationId', isSellerAuthenticated, markAsRead);

export default router;
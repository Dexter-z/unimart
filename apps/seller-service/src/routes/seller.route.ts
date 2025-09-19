import express, { Router } from 'express';
import { deleteShop, editSellerProfile, followShop, getSellerEvents, getSellerInfo, getSellerProducts, isFollowing, markNotificationAsRead, restoreShop, sellerNotifications, unfollowShop, updateShopAvatar, updateShopCover,} from '../controllers/seller.controllers';
import isAuthenticated, { isSellerAuthenticated } from '@packages/middleware/isAuthenticated';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer();

router.get('/get-seller/:id', getSellerInfo);
router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents); 

router.get("/seller-notifications", isSellerAuthenticated, sellerNotifications);
router.post("/mark-notification-as-read", isAuthenticated, markNotificationAsRead);

router.get("/is-following/:id", isAuthenticated, isFollowing);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop); 

router.delete("/delete", isAuthenticated, deleteShop);
router.patch("/restore", isAuthenticated, restoreShop);
router.put("/edit-profile", isAuthenticated, editSellerProfile);

router.post("/update-shop-avatar", isSellerAuthenticated, upload.single('avatar'), updateShopAvatar);
router.post("/update-shop-cover", isSellerAuthenticated, upload.single('cover'), updateShopCover);



export default router;
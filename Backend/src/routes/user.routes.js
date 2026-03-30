import { Router} from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, changeCurrentPassword } from "../controllers/user.controller.js";


const userRouter = Router();
/**  
    * @name registerUser
    * @description Api to handle new user registeration
    * @route POST /api/v1/users/register
    * @access Public
 */
userRouter.post("/register", registerUser);


/**  
    * @name loginUser
    * @description Api to handle user login
    * @route POST /api/v1/users/login
    * @access Public
 */
userRouter.post("/login", loginUser);


/**  
    * @name logoutUser
    * @description Api to handle user logout
    * @route POST /api/v1/users/logout
    * @access Private
 */
userRouter.post("/logout", logoutUser);


/**  
    * @name changeCurrentPassword
    * @description Api to handle change current password
    * @route POST /api/v1/users/change-password
    * @access Private
 */
userRouter.post("/change-password", changeCurrentPassword);


/**  
    * @name getCurrentUser
    * @description Api to get current user details
    * @route GET /api/v1/users/me
    * @access Private
 */
userRouter.get("/me", getCurrentUser);



export default userRouter;
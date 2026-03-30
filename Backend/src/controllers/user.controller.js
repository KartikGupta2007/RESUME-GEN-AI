import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

/**
 * @name generateAccessAndRefreshToken
 * @description Helper function to generate access and refresh tokens
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - A promise resolving to an object containing the access and refresh tokens
 */
const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({
        validateBeforeSave: false,
    })
    return { accessToken, refreshToken }
}



/**
 * @name loginUser
 * @description Controller to handle user login
 * @route POST /api/v1/users/login
 * @access Public
 */
export const loginUser = asyncHandler(async(req, res) => {
    // get user details((username or email ) and password) from frontend
    // validation - not empty
    // check if user already exists: username, email and if exists then compare password
    // if password is correct then generate access token and refresh token, save refresh token in db
    // send access token in response and refresh token in http only cookie

    let { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")
        ||
        !email || !password
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ email }]
    });
    
    if (!existingUser) {
        throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordCorrect = await existingUser.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id);
    existingUser.password = undefined;
    existingUser.refreshToken = undefined;
    
    const options = {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse( 
            200, 
            {
                user : existingUser,
                accessToken, refreshToken
            }, 
            "User logged in successfully"
        )
    )
});




/**
 * @name registerUser
 * @description Controller to handle user registration
 * @route POST /api/v1/users/register
 * @access Public
 */
export const registerUser = asyncHandler(async(req, res) => {
    let { email, password, userName, fullName } = req.body;
    userName = userName.toLowerCase();

    //vaidation
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
        ||
        !fullName || !email || !userName || !password
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
        throw new ApiError(400, "Username already taken");
    }

    // Create new user
    const newUser = await User.create({
        email,
        password,
        userName,
        fullName
    });

    //now from the created user we have to remove password and refresh token field, we can do it by findById and select method of mongoose
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    ) // syntax to exclude fields in mongoose


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
});




/**
 * @name logoutUser
 * @description Controller to handle user logout
 * @route POST /api/v1/users/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (req,res) => {
    // get refresh token from cookies
    // validation - not empty
    // find user with the refresh token in db, if found then remove refresh token from db
    // remove access token and refresh token from cookies
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
});



/**
 * @name changeCurrentPassword
 * @description Controller to handle change current password
 * @route POST /api/v1/users/change-password
 * @access Private
 */
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    // get current password and new password from req body
    // validation - not empty
    // find user in db, compare current password with the password in db
    // if matches then update password with the new password
    // remove refresh token from db, so that all the existing sessions will be logged out and user has to login again with new password

    const { currentPassword, newPassword ,confirmNewPassword} = req.body
    if ([currentPassword, newPassword, confirmNewPassword].some((field) => field?.trim() === "") || !currentPassword || !newPassword || !confirmNewPassword) {
        throw new ApiError(400, "All fields are required")
    }
    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "New password and confirm new password do not match")
    }

    if(newPassword === currentPassword){
        throw new ApiError(400, "New password cannot be same as current password")
    }
    
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "Please login again to change the password")
    }
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect")
    }
    user.password = newPassword;
    user.refreshToken = undefined; // this will log out user from all the existing sessions, so that user has to login again with new password
    await user.save({
        validateBeforeSave: false
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully, please login again with new password")
    )

});


/**
 * @name getCurrentUser
 * @description Controller to get current user details
 * @route GET /api/v1/users/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    // get user details from req.user which is set in auth middleware after verifying access token
    // return user details in response
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User details fetched successfully")
    )
});



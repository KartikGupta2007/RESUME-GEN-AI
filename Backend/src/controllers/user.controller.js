import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production"
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    }
}

const validatePasswordStrength = (password) => {
    if (password.length < 8) {
        return "Password must be at least 8 characters long"
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must include at least one uppercase letter"
    }

    if (!/[a-z]/.test(password)) {
        return "Password must include at least one lowercase letter"
    }

    if (!/[0-9]/.test(password)) {
        return "Password must include at least one number"
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must include at least one special character"
    }

    return null
}

const sanitizeUserName = (value) => value
    ?.toLowerCase()
    ?.replace(/[^a-z0-9._-]/g, "")
    ?.replace(/^[^a-z0-9]+/, "")

const generateUniqueUserName = async (baseValue, email) => {
    const normalizedBase = sanitizeUserName(baseValue) || "user"
    const normalizedEmailBase = sanitizeUserName(email?.split("@")[0]) || normalizedBase

    const candidatePool = [
        normalizedBase,
        `${normalizedBase}.${normalizedEmailBase}`,
        `${normalizedEmailBase}.${normalizedBase}`,
        normalizedEmailBase,
    ]

    for (const candidate of candidatePool) {
        if (candidate && !(await User.findOne({ userName: candidate }))) {
            return candidate
        }
    }

    let suffix = 1
    let candidate = `${normalizedBase}.${normalizedEmailBase}${suffix}`

    while (await User.findOne({ userName: candidate })) {
        suffix += 1
        candidate = `${normalizedBase}.${normalizedEmailBase}${suffix}`
    }

    return candidate
}

const serializePublicUser = (userDoc) => {
    if (!userDoc) {
        return null
    }

    const userObject = typeof userDoc.toObject === "function"
        ? userDoc.toObject()
        : { ...userDoc }

    const hasPassword = Boolean(userDoc.password)
    delete userObject.password
    delete userObject.refreshToken

    return {
        ...userObject,
        hasPassword,
    }
}

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
    email = email?.trim()?.toLowerCase()
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

    if (existingUser.authProvider === "google" && !existingUser.password) {
        throw new ApiError(400, "Please sign in with Google first and set your password in My Profile before logging in locally");
    }

    const isPasswordCorrect = await existingUser.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id);
    const loggedInUser = serializePublicUser(existingUser)

    const options = getCookieOptions()

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse( 
            200, 
            {
                user : loggedInUser,
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
    email = email?.trim()?.toLowerCase();

    //vaidation
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
        ||
        !fullName || !email || !userName || !password
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const passwordValidationError = validatePasswordStrength(password)
    if (passwordValidationError) {
        throw new ApiError(400, passwordValidationError)
    }

    userName = userName.toLowerCase();

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
        fullName,
        authProvider: "local",
    });

    //now from the created user we have to remove password and refresh token field, we can do it by findById and select method of mongoose
    const createdUser = serializePublicUser(newUser)


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
});
// _____________________________________________________________________________________________
/**
 * @name googleAuth
 * @description Controller to handle Google login/sign-up
 * @route POST /api/v1/users/google
 * @access Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
    // googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { credential } = req.body;
    console.log("Received Google credential:", credential) // Log whether credential is received
    if (!credential) {
        throw new ApiError(400, "Google credential is required");
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new ApiError(500, "Google auth is not configured on the server");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("Google ID token verified successfully") // Log successful verification
    const payload = ticket.getPayload();
    console.log("Google token payload:", payload) // Log the payload received from Google
    if (!payload?.email || !payload?.sub) {
        throw new ApiError(401, "Unable to verify Google account");
    }

    if (!payload?.email_verified){
        throw new ApiError(401, "Google account email is not verified");
    }

    const email = payload.email.trim().toLowerCase();
    const googleId = payload.sub;
    const fullName = payload.name || payload.given_name || email.split("@")[0];
    const avatarUrl = payload.picture || "";

    let user = await User.findOne({
        $or: [{ googleId }, { email }],
    });

    if (!user) {
        const userName = await generateUniqueUserName(payload.given_name || payload.name || email.split("@")[0], email);

        user = await User.create({
            userName,
            email,
            fullName,
            authProvider: "google",
            googleId,
            avatarUrl,
        });
    } else {
        // link google account, if same user have logged in with local auth previously with same email, then we can link google account by saving googleId and avatarUrl in db, so that next time when user tries to login with google then we can find the user by googleId and allow login, if googleId is not present but email is same then also we can allow login but we have to save googleId in db for future logins, this linking will be done only first time when user tries to login with google, after that user can login with google or local auth as per their choice without any issue
        let shouldSave = false;

        if (!user.googleId){
            user.googleId = googleId;
            shouldSave = true;
        }

        if (!user.avatarUrl && avatarUrl) {
            user.avatarUrl = avatarUrl;
            shouldSave = true;
        }

        if (!user.fullName && fullName) {
            user.fullName = fullName;
            shouldSave = true;
        }

        if (shouldSave) {
            await user.save({ validateBeforeSave: false });
        }
    }

    const authenticatedUser = serializePublicUser(user)

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = getCookieOptions()

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: authenticatedUser,
                    accessToken,
                    refreshToken,
                },
                "Google authentication successful"
            )
        )
});

// _____________________________________________________________________________________________


/**
 * @name logoutUser
 * @description Controller to handle user logout
 * @route POST /api/v1/users/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (req,res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }
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

    const options = getCookieOptions()

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
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }
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
    if (user.authProvider === "google" && !user.password) {
        throw new ApiError(400, "Google-authenticated accounts do not have a password to change")
    }
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordCorrect) {
        throw new ApiError(400, "Current password is Incorrect.")
    }
    user.password = newPassword;
    user.refreshToken = undefined; // this will log out user from all the existing sessions, so that user has to login again with new password
    await user.save({
        validateBeforeSave: false
    })

    const options = getCookieOptions()

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "Password changed successfully, please login again with new password")
    )

});


/**
 * @name setGoogleAccountPassword
 * @description Controller to set a password for a Google-authenticated account
 * @route POST /api/v1/users/set-password
 * @access Private
 */
export const setGoogleAccountPassword = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    const { newPassword, confirmNewPassword } = req.body

    if ([newPassword, confirmNewPassword].some((field) => field?.trim() === "") || !newPassword || !confirmNewPassword) {
        throw new ApiError(400, "All fields are required")
    }

    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "New password and confirm new password do not match")
    }

    const passwordValidationError = validatePasswordStrength(newPassword)
    if (passwordValidationError) {
        throw new ApiError(400, passwordValidationError)
    }

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "Please login again to set a password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    const updatedUser = serializePublicUser(user)

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user: updatedUser }, "Password set successfully. You can now login locally with email and password")
        )
});


/**
 * @name getCurrentUser
 * @description Controller to get current user details
 * @route GET /api/v1/users/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }
    // get user details from req.user which is set in auth middleware after verifying access token
    // return user details in response
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, serializePublicUser(user), "User details fetched successfully")
    )
});

/**
 * @name refreshAccessToken
 * @description Controller to refresh access token
 * @route POST /api/v1/users/refresh-token
 * @access Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = getCookieOptions()

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});



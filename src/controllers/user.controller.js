import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Controller (async, no extra DB queries)
export const registerUser = async (req, res, next) => {
    try {
        const { fullName, username, email, password } = req.body;

        // 1️⃣ Validate required fields
        if (!fullName || !username || !email || !password) {
            throw new ApiError(400, "All fields are required");
        }

        // 2️⃣ Check if user exists
        const existedUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existedUser) throw new ApiError(409, "User with email or username already exists");

        // 3️⃣ Get file paths from multer
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        // 4️⃣ Upload to Cloudinary concurrently
        const [avatarUpload, coverUpload] = await Promise.all([
            uploadOnCloudinary(avatarLocalPath),
            coverImageLocalPath ? uploadOnCloudinary(coverImageLocalPath) : Promise.resolve(null)
        ]);

        if (!avatarUpload) throw new ApiError(400, "Avatar field is required");

        // 5️⃣ Create user (password will be hashed in pre-save hook)
        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatarUpload.url,
            coverImage: coverUpload?.url || ""
        });

        // 6️⃣ Return user without password/refreshToken
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            coverImage: user.coverImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return res.status(200).json(new ApiResponse(200, userResponse, "User registered successfully"));

    } catch (error) {
        next(error);
    }
};
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js";

export const registerUser=asyncHandler(async (req,res) => {
    //get user details from frontend
    //validation -not empty
    //check if user already exists :username,email
    //check for images ,avatar
    //upload avatar to cloudinary
    //create user object - create entry in db
    //remove password and refresh token from response
    //check for user creation
    //send response
    const {fullName,username,email}=req.body
    console.log('email : ',email);

    if(fullName===""||email===""||password===""||username===""){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){throw new ApiError(409,"User with email or username already exists")}

    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath=req.files?.cooverImage[0].path;

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar field is required")
    }
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const userCreated=await User.findById(user._id).select("-password -refrefhToken")

    if(!userCreated){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(200).json(
        new ApiResponse(200,userCreated,"User registered succesfully ")
    )
})

import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
         userName : {
            type: String,
            required: true,
            unique: [true, "Username already exists"],
            trim: true,
            lowercase: true, 
            index: true, 
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password:{
            type: String,
            required: function () {
                return this.authProvider !== "google"
            },
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index:true,
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatarUrl: {
            type: String,
            trim: true,
        },
        refreshToken: {
            type: String
        }
    }
)


userSchema.pre("save", async function(){
    if(!this.password || !this.isModified("password")){
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("findOneAndUpdate", async function(){
    const update = this.getUpdate();
    if(update.password){
        update.password = await bcrypt.hash(update.password, 10);
    }
    return;
});

userSchema.methods.comparePassword = async function(candidatePassword){
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)
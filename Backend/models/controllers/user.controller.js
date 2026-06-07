import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body; 
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                 message: "Something is missing. Please provide all required fields." ,
                 success: false
                });
        };
        const user= await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                message: "User already exists with this email." ,
                success: false
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,  
            phoneNumber,
            password: hashedPassword,
            role
        });
        
    } catch (error) {
        
    }
}
export const login = async (req, res) => {
    try {
        const { email, password ,role} = req.body; 
        if (!email || !password || !role) {
            return res.status(400).json({
                 message: "Something is missing. Please provide all required fields." ,
                 success: false
                });
        }; 
        const user= await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                message: "incorrect  email  or password.",
                success: false
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "incorrect  email  or password.",
                success: false
            });
        }
        // If password is valid, you might want to generate a JWT token here
        // and include it in the response for authentication in future requests.

        //chech role is correct or not 
        if(role !== user.role){
            return res.status(400).json({
                message: "Account does not exist with current role.",
                success: false
            });
        };
        const tokendata={
            userId: user._id,

        }
        const token = jwt.sign(tokendata, process.env.SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, { httpOnly: true, secure: true });
    } catch (error) {
        
    }
}
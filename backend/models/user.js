    import mongoose from "mongoose";

    const userSchema = new mongoose.Schema({
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            }
        ],
        image:{
            type:String,
            required:true
        },
        accountType:{
            type:String,
            enum:["Student","Professor"],
            default:"Student"
        }
    })

    export default mongoose.model("User",userSchema);
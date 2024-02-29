
const userCollection = require("../models/userModel")
const {AddressModel} = require("../models/addressModel")
const {emailOtp} = require("./authController")
const bcrypt = require("bcrypt")



//userOtpValue verify 



const userOtpValue = async (req,res)=>{


    try{

        const userEnterOTP = Number(req.body.OtpNum)
        const gentrateOTP = Number(req.session.otp)

        if(userEnterOTP ===  gentrateOTP){

            const isUser = req.session.userIsthere

            const userChangeEmail = req.session.forGetEmail
            await userCollection.findByIdAndUpdate({_id:isUser.userId},{$set:{userEmail:userChangeEmail}})

            res.status(200).send({success:true})

        }

        res.status(500).send({success:false})
    }catch(err){
        console.log(`Error from userOtpValue ${err}`)
    }
}

// userOTPpage rendered 

const userOTPpage = async (req,res)=>{

    try{
        req.session.isWrongOtp;
        res.render("user/userOTP",{isAlive:req.session.userIsthere,isWrongOtp:req.session.isWrongOtp})
        req.session.isWrongOtp = false
    }catch(err){

        console.log(`Error fron userOTPpage ${err}`)
    }
}



// editAndUpdateuserProfile 


const editAndUpdateProfile = async(req,res)=>{
    try{

        console.log(req.body)
        const {userId,userEmail,lastName,firstName:userMobile} = req.body



        const userDetail = await userCollection.findById({_id:userId})

        if(userEmail === userDetail.userEmail){
           
            await userCollection.findByIdAndUpdate({_id:userId},{firstName:req.body.firstName,lastName:req.body.lastName,userMobile:req.body.userMobile,userEmail:req.body.userEmail})
            console.log(`update success`)
            res.status(200).send({success:true,otp:false})
        }else{

           const emailIsthere = await userCollection.findOne({userEmail:req.body.userEmail})

           console.log(typeof(emailIsthere))

        console.log(`emailIsthere : \n ${emailIsthere}`)
           if(!emailIsthere){

               console.log(`emailNew`)
            const profileEditOTP = await emailOtp(req.body.userEmail)

            req.session.forGetEmail = req.body.userEmail

            req.session.otp = profileEditOTP

            req.session.save()
            res.status(200).send({success:true,otp:true})
             
           }

           res.status(501).send({sucess:false})
        }

        


    }catch(err){

        console.log(`Error from editAndUpdateProfile ${err}`)
    }
}

// edit Profile is rendered


const editProfile = async(req, res)=>{

    try{
        const id = req.params.id
        const profileDetails = await userCollection.findOne({_id:id})
        console.log(`EditProfile controle reach`)
        res.render("user/editProfile",{isAlive:req.session.userIsthere,profileDetails})
    }catch(err){

        console.log(`Error from editProfile function ${err}`)
    }
}

// userPassword change 

const updateUserPass = async(req,res)=>{

    try{

        const user = req.body

        const userDetail = await userCollection.findOne({_id:user.id})

        const passMatch = await bcrypt.compare(user.currentPass,userDetail.userPassword)

        console.log(passMatch)

        if(passMatch)
        {
            const newPass = user.newPass
            const passwordDcrypt = await bcrypt.hash(newPass,10)
            console.log(passwordDcrypt)
            await userCollection.findByIdAndUpdate({_id:user.id},{userPassword:passwordDcrypt})
            console.log('success')
            res.status(200).send({success:true})
        }else{

            res.status(501).send({success:false,pass:false})
        }

        console.log(req.body)
    }catch(err){
        res.status(501).send({success:false})
        console.log(`Error from updateUserPass ${err}`)
    }
}


// change password page render
const changePassword = async (req,res)=>{
    try{
        const {userId} = req.session.userIsthere
  
        res.render("user/changePassUser",{userId})

    }catch(err){

    }
}

// edit Address update data

const editUserData = async (req,res)=>{

    try{

        const {_id} = req.body
       
        await AddressModel.findByIdAndUpdate({_id:_id},{$set:{name:req.body.name,phone:req.body.phone,houseNo:req.body.houseNo,state:req.body.state,city:req.body.city,pincode:req.body.pincode}})

        res.status(200).send({success:true})

    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from editUserData ${err}`)
    }

}
// editAddress user side render

const editAddress = async (req,res)=>{

    try{
        const id= req.params.id
        const address = await AddressModel.findOne({_id:id})
        res.render("user/editAddress",{isAlive:req.session.userIsthere,address})

    }catch(err){
        console.log(`Error from editAddress ${err}`)
    }
}
// delet Address


const daleteAdd = async (req,res)=>{
    try{

        const id = req.params.id

        await AddressModel.findByIdAndDelete({_id:id})
        
        res.status(200).send({success:true})

    }catch(err){

        res.status(500).send({success:false})
        console.log(`Error from data`)

    }
}


// render my address Page

const myAddress = async (req,res)=>{
    try{

        const {userId} = req.session.userIsthere

        console.log(userId)

        const userAddress = await  AddressModel.find({user_id:userId})

        console.log(`userAddress\n ${userAddress}` )

        res.render("user/myAddress",{isAlive:req.session.userIsthere,userAddress})


    }catch(err){
        console.log(`Error from my Address\n ${err}`)
    }
}

const addAddressData = async (req,res)=>{

    try{
        console.log(req.body)
        console.log(req.session.userIsthere)

        const {userId} = req.session.userIsthere

        const newAddress = {
            user_id:userId,
            name : req.body.userName,
            phone : req.body.userMobile,
            houseNo : req.body.houseNo,
            state : req.body.state,
            city : req.body.city,
            pincode : req.body.pincode
        }
       
        await AddressModel(newAddress).save()

        res.redirect("/user/myAddress")


    }catch(err){
        console.log(`Error from addAddressData ${err}`)
    }
}



// addProfile


const addAddress = async (req,res)=>{

    try{

        res.render("user/addAddress",{isAlive:req.session.userIsthere})

    }catch(err){

        console.log(`Error from addAddress function ${err}`)
    }
}



// show profile
const profile = async (req,res)=>{

    try{
        const profileDetails = await userCollection.findOne({_id:req.session.userIsthere.userId})

        res.render("user/profile",{isAlive:req.session.userIsthere,profileDetails})
    }catch(err){


        console.log(`Error from  profile function\n${err}`)

    }

}


module.exports = {
    userOtpValue ,              //  verfy the otp for user profile update new email
    userOTPpage,                // userOTPpage rendered
    editAndUpdateProfile,       //editAndUpdateProfile
    editProfile,        // edit Page rendered
    updateUserPass,   // userPassword change
    changePassword,     // changPassword page render
    editUserData,
    editAddress, // edite Address page render
    daleteAdd,
    myAddress,
    addAddressData,
    profile,
    addAddress}
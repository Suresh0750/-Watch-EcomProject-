
const productOfferCollection = require("../models/productOfferModel")
const productCollection = require("../models/productModel")
const categoryModel = require("../models/categoriesModel")
const applyProductOffers = require("../service/applyProductOffers").applyProductOffer
const formatDate = require("../service/formatDateHelper");
const categoryOfferModel = require("../models/categoryOfferModel")
const applyCategoryOffer= require("../service/applyCategoryOffer").applyCategoryOffer;

//** == categoryOffersManagement   == **/


const editCategoryOfferStatus = async (req, res) => {
                try {
                  const { id } = req.params;
                  const offer = await categoryOfferModel.findOne({ _id: id });
                  if (offer?.isAvailable) {
                    await categoryOfferModel.findByIdAndUpdate(id, {
                      isAvailable: false,
                    });
                  } else {
                    await categoryOfferModel.findByIdAndUpdate(id, {
                      isAvailable: true,
                    });
                  }
                  res.redirect("/admin/category-offer-list");
                } catch (error) {
                  console.log(error);
                }
              }

const editCategoryOffer = async (req, res) => {
            try {
              const { id, offerPercentage, startDate, endDate } = req.body;

              const offer = await categoryOfferModel.findByIdAndUpdate(id, {
                offerPercentage,
                startDate,
                endDate,
              });

              return res.status(200).send({ success: true });
            } catch (error) {
              console.log(error);
              return res.status(500).send({ success: false });
            }
          }

const  addCategoryOffer = async (req, res) => {
              try {
                console.log(`req reached addCategoryOffer`)
              
                const { category, offerPercentage, startDate, endDate } = req.body;
           
                const offerExist = await categoryOfferModel.findOne({ category });


                if (offerExist) {
                  return res.status(500).send({ exist: true });
                }

                const offer = await new categoryOfferModel({
                  category,
                  offerPercentage,
                  startDate,
                  endDate,
                }).save();

                return res.status(200).send({ success: true });
              } catch (error) {
                console.log(`error from addCategoryOffer ${error}`);
                return res.status(500).send({ success: false });
              }
            }



//* categoryPage render

const getCategoryOffer = async (req, res) => {
              try {
                console.log(`req reached getCategoryOffer`)
                const categories = await categoryModel.find();
                console.log(categories)
                const offers = await categoryOfferModel.find().populate("category");
                console.log(offers)
                applyCategoryOffer();
                res.render("Admin/categoryOfferList", { categories, offers });
              } catch (error) {
                console.log(error);
              }
            }

//*==========================================================*//

//productOfferManagement

const productOfferManagement = async (req,res)=>{
   
        try {
          console.log(`req reached productOfferManagement `)
          // updating the currentStatus field by checking with the current date
          let productOfferData = await productOfferCollection.find();
          productOfferData.forEach(async (v) => {
            await productOfferCollection.updateOne(
              { _id: v._id },
              {
                $set: {
                  currentStatus:
                    v.endDate >= new Date() && v.startDate <= new Date(),
                },
              }
            );
          });
    
          console.log(productOfferData)
          //sending the formatted date to the page
          productOfferData = productOfferData.map((v) => {
            v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
            v.endDateFormatted = formatDate(v.endDate, "YYYY-MM-DD");
            return v;
          });
    
          let productData = await productCollection.find();
          let categoryData = await categoryModel.find();

          console.log(productData)
    
          res.render("Admin/productOfferList", {
            productData,
            productOfferData,
            categoryData,
    
          });
        } catch (error) {
          console.error(error);
        }
      
}

const   addOffer = async (req, res) => {
                 try {
                  console.log(` req reached addOffer`)
                    //check if the product already has an offer applied
                    let { productName } = req.body;
                    console.log(req.body)
                    let existingOffer = await productOfferCollection.findOne({ productName });


console.log(`step 1`)                 
                    if (!existingOffer) {
                        //if offer for that particular product doesn't exist:
            
                        let product = req.body?.productName
                        let productData = await productCollection.findOne({productName:product});

                        console.log(productData)
                        let { productOfferPercentage, startDate, endDate } = req.body;
                        console.log(`step 2`) 
                        await productOfferCollection.insertMany([
                        {
                            productId: productData._id,
                            productName,
                            productOfferPercentage,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                        },
                        ]);
                        console.log(`step 3`) 
                        await applyProductOffers("addOffer");
                        console.log(`step 4`) 
                        res.json({ success: true });
                    } else {
                        res.json({ success: false });
                    }
                    } catch (error) {
                    console.error(error);
                    }

                }


const editOffer = async (req,res)=>{

    try {

        console.log(`req reached editOffer`)
        let { productName } = req.body;
        let existingOffer = await productOfferCollection.findOne({
          productName: { $regex: new RegExp(req.body.productName, "i") },
        });
  
        if (!existingOffer || existingOffer._id == req.params.id) {
        
          let { discountPercentage, startDate, expiryDate } = req.body;
          let updateFields = {
           productName,
           productOfferPercentage:Number( discountPercentage),
            startDate: new Date(startDate),
            endDate:new Date(expiryDate),
          };
   
          const hhh=await productOfferCollection.findByIdAndUpdate(
            req.params.id,
            updateFields
          );
          await applyProductOffers("editOffer");
          res.json({ success: true });
        } else {
          console.log(`else is working`)
          res.json({ success: false });
        }
      } catch (error) {
        console.error(error);
      }

}

module.exports =  {productOfferManagement,addOffer,editOffer,getCategoryOffer,addCategoryOffer,editCategoryOffer,editCategoryOfferStatus}
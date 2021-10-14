//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const dotenv=require('dotenv');
const app = express();
dotenv.config();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var url = process.env.MONGOLAB_URI;
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

// -------------------------------------------------------
const itemSchema={
  name:String
};

const Item=mongoose.model("Item",itemSchema);

const defaultItems=[];


//  ---------------------------------------------------

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);



// ------------------------------------------------------


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
 

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){

        //create new list

        const list=new List({ 
          name:customListName,
          items:defaultItems
        })

        list.save();
        res.redirect("/"+customListName);

      }else{

        //show an existing list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});

      }
    }
  });

   
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName === "Today"){

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);

      foundList.save();
      res.redirect("/"+listName);
    });
  }

});



app.post("/delete",function(req,res){

  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){

    Item.findOneAndRemove({_id:checkedItemId},function(err){
      if(!err){
        console.log("success");
      }
    }); 

    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
          res.redirect("/"+listName);
      }
    });
  
  }

  
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
  console.log("server started successfully.");
});





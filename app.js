const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://poojan9603:poojan9603@cluster0.5rejfte.mongodb.net/toDoListV2");

mongoose.connect("mongodb://localhost:27017/pineapple");

//
// mongoose.connect(
//     process.env.MONGODB_URI,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }
// );

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to my Project"
})
const item2 = new Item({
  name: "Write the note in the box below and press (+) to add it to your List."
})

const item3 = new Item({
  name: "<== Press this to cancel the point out!"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("file.ejs", {
        todayName: "Today",
        newItemByUser: foundItems
      });
    }
  });
});

app.get("/:userReqPage", function(req, res) {
  const userReqPage= _.capitalize(req.params.userReqPage);

  List.findOne({name:userReqPage}, function(err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name:   userReqPage,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ userReqPage);
            } else {
res.render("file",   {todayName: result.name,  newItemByUser: result.items})
}
    } else {
      console.log(err);
    }
  })


})


app.post("/", function(req, res) {
  const itemName = req.body.nextitem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
        foundList.save();
        res.redirect("back"+ listName );

});
  }

});



app.post("/delete", function(req, res) {
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;

if (listName === "Today"){

  Item.findByIdAndRemove(deleteId, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("deleted");
      res.redirect("/");
    }
  })
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteId}}}, function(err, result){
    if(!err){
      res.redirect("/"+listName);
    }else{console.log(err);}
  })
}

})

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("The Server is listening on the port 3000");

})








//
// app.get("/work", function(req, res) {
//
//   res.render("file.ejs", {
//     todayName: "Work List",
//     newItemByUser: workItemByUser
//   });
// })
//
// app.post("/work", function(req, responce){
//   workItemByUser.push(req.body.nextitem);
//   responce.redirect("/work");
// })

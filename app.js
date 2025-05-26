const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;
const UserModel = require("./models/user");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, MOGOURI } = require("./config/keys");
const Todo = require("./models/todo");

mongoose.connect(MOGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo yeahhh");
});
mongoose.connection.on("error", (err) => {
  console.log("error", err);
});

app.use(cors());
app.use(express.json());

const requireLogin = (req, res, next) => {
  //ye akk userdefine midelware hai jo cheak karta authentication token ke through
  const { authorization } = req.headers; //req.headers frontend se aata hai postman main dekhoge aise dikhega "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..." clint ya server se token lega aur assign kar dega authorization mai
  if (!authorization) {
    // cheak karega token nhi hai toh ye chlega aur error dega postman mai
    return res.status(401).json({ error: "you must be logged in" });
  }
  try {
    const { userId } = jwt.verify(authorization, JWT_SECRET); //abhi ye id de raha hai. Iska kaam hota hai: token ko decode + verify karna. ye payload return karta jo userId mai main assign kar raha hai aur ye synchronous hai await lagane ki jarurat nhi
    // console.log(userId);
    req.user = userId; // ye assign ho raha hai req.user mai
    next();
  } catch (err) {
    return res.status(401).json({ error: "you must be logged in" });
  }
};

// app.get("/test", requireLogin, (req, res) => { //testing ke liye tha ye midleware sahi se kam kar raha hai ki nhi
//   res.json({ message: req.user });
// });

app.post("/signup", async (req, res) => {
  const { email, password } = req.body; //ye frontend se email aur password lega

  try {
    // console.log(req.body);
    if (!email || !password) {
      //ager user email ya password akk bhi nhi deta toh ye chalega
      return res.status(422).json({ error: "Please Provide All Fields" }); //ye response deta hai postman main
    }
    const user = await UserModel.findOne({ email }); //ye mongodb mai find karega email aur user mai assign kar dega

    if (user) {
      //ager ka email hai toh ye return ka dega postman main ager email nhi toh ye nhi chalega
      return res.status(423).json({ error: "User Already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // jo tum frontend mai password daloge wo bcrypt kar dega matlab encrypt kar dega password ko aur process 12 baar hoga

    await new UserModel({
      //email aur password mongodb mai save kar dega
      email,
      password: hashedPassword,
    }).save();

    res.status(201).json({ message: "signup successfully" }); // ager sab process successfull ho jayega tab ye response dega postman ko
  } catch (error) {
    console.log(`error in signup ${error}`); //ager signup koi bhi error aata hai toh console pe dekh jayega
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body; //ye frontend se email aur password lega

  try {
    // console.log(req.body);
    if (!email || !password) {
      //ager user email ya password akk bhi nhi deta toh ye chalega
      return res.status(422).json({ error: "Please Provide All Fields" }); //ye response deta hai postman main
    }
    const user = await UserModel.findOne({ email }); //ye mongodb mai find karega email aur user mai assign kar dega

    if (!user) {
      //ager user ka email nhi hai toh ye return ka dega postman main ager email hai toh ye nhi chalega
      return res.status(400).json({ error: "User does't exists" });
    }

    const doMatch = await bcrypt.compare(password, user.password); // ye compare karega jo fortend mai password diye ho aur mongodb main jo password diye ho aur ye return karega true or false

    if (doMatch) {
      //ager password true hota hai tab ye chalega nhi toh else
      const token = jwt.sign({ userId: user._id }, JWT_SECRET); //jab user login hota hai toh server akk token create karke user ko dega aur ye synchronus hai await lagane ki jarurat nhi hai
      return res.status(201).json({ token }); // postman main respose dega akk token
    } else {
      return res.status(401).json({ error: "email or password is invalid" });
    }
  } catch (error) {
    console.log(`error in signip ${error}`); //ager signin koi bhi error aata hai toh console pe dekh jayega
  }
});

app.post("/createtodo", requireLogin, async (req, res) => {
  //create todo ka route hai aur midleware bhi jab tak id rahega

  const data = await new Todo({
    //todo model mai ya mongodb mai todo aur user ka id save hoga

    todo: req.body.todo, //fronted se jab todo add karege

    todoBy: req.user, //jo req.user hai isme user ki id hai
  }).save(); //database mai save hoga
  res.status(201).json({ message: data });
});

app.get("/gettodos", requireLogin, async (req, res) => {
  const data = await Todo.find({
    todoBy: req.user,
  });
  res.status(200).json({ message: data });
});

// app.delete("/remove/:id", requireLogin, async (req, res) => {
//   //delete method aur parameter mai id dega user with middleware
//   const removedTodo = await Todo.findOneAndRemove({ _id: req.params.id }); //jo frontend se id laye ho usko mogodb ke mai id find karke remove kar dega
//   res.status(200).json({ message: removedTodo });
// });
app.delete("/remove/:id", requireLogin, async (req, res) => {
  try {
    const removedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!removedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: removedTodo });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

if (process.env.NODE_ENV === "production") {
  const path = require("path");

  // Serve static files
  app.use(express.static(path.resolve(__dirname, "client", "dist")));

  // Handle SPA
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});



const User = require("../Model/userModel");
const bcrypt = require("bcryptjs");
const {
  addDoc,
  getDocs,
  where,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
} = require("firebase/firestore");

async function SignupUser(req, res) {
  console.log("User signup executed");
  try {
    const { name, phNumber, email, address, dob, password } = req.body;

    // Check if all fields are provided
    if (!name || !phNumber || !email || !address || !dob || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const phoneQuery = query(User, where("phNumberD", "==", phNumber));
    const phoneSnapshot = await getDocs(phoneQuery);

    if (!phoneSnapshot.empty) {
      return res
        .status(400)
        .json({ message: "User with this phone number already exists" });
    }

    // Check if a user with the same email already exists
    const q = query(User, where("emailD", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document with a unique ID
    const newUser = {
      nameD: name,
      phNumberD: phNumber,
      emailD: email.toLowerCase(),
      addressD: address,
      dobD: dob,
      passwordD: hashedPassword,
    };

    // Add the new user to Firestore
    await addDoc(User, newUser); // Add user document

    // Send a success response
    res.status(201).json({ message: "User registered successfully!", newUser });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Error registering user", details: err });
  }
}

async function LoginUser(req, res) {
  console.log("User Login executed");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Phone number, Email and password are required " });
    }

    // Find user in Firestore
    const q = query(User, where("emailD", "==", email));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = userSnapshot.docs[0].data(); // Assuming first user found is the correct one

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.passwordD);
    if (!passwordMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Error logging in", details: err });
  }
}

async function AllUsersDetail(req, res) {
  try {
    const allUsersSnapshot = await getDocs(User);
    const allUsers = allUsersSnapshot.docs.map((doc) => doc.data());

    return res.json(allUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users", details: err });
  }
}

async function userExists(req, res) {
  try {
    const { email } = req.body;
    console.log(email);

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Query Firestore to check if the user exists
    const q = query(User, where("emailD", "==", email));
    const userSnapshot = await getDocs(q);

    // Check if any documents match the query
    if (!userSnapshot.empty) {
      return res
        .status(200)
        .json({ exists: true, message: "User exists", email });
    } else {
      return res
        .status(404)
        .json({ exists: false, message: "User does not exist" });
    }
  } catch (err) {
    console.error("Error checking user existence:", err);
    res
      .status(500)
      .json({ error: "Error checking user existence", details: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const { email, product } = req.body;

    // Validate input
    if (!email || !product) {
      return res
        .status(400)
        .json({ message: "Email and product are required" });
    }

    // Query Firestore to check if the user exists
    const q = query(User, where("emailD", "==", email)); // Assuming emailD is the field for email
    const userSnapshot = await getDocs(q);

    // Check if any documents match the query
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Get the user's document reference (assuming there's one match)
    const userDocRef = userSnapshot.docs[0].ref;

    // Retrieve the user's cart from the document
    const userDoc = userSnapshot.docs[0].data();
    const cartItems = userDoc.cart || [];

    // Generate a uniqueId based on the current length of the cart
    const uniqueId = cartItems.length + 1; // Using the cart length to generate a new unique ID

    // Attach the generated unique ID to the product
    product.uniqueIdD = uniqueId;

    // Check if the product already exists in the cart
    const productExists = cartItems.some(
      (item) =>
        item.idD === product.idD &&
        item.selectedColorD === product.selectedColorD &&
        item.selectedSizeD === product.selectedSizeD
    );

    if (productExists) {
      return res.status(201).json({ message: "Item already exists in cart" });
    }

    // Add the product to the user's cart (using arrayUnion to avoid duplication)
    await updateDoc(userDocRef, {
      cart: arrayUnion(product),
    });

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", product });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res
      .status(500)
      .json({ error: "Error adding product to cart", details: err.message });
  }
}




async function getCart(req, res) {
    try {
      const { email } = req.body;
  
      // Validate input
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      // Query Firestore to check if the user exists
      const q = query(User, where("emailD", "==", email));
      const userSnapshot = await getDocs(q);
  
      // Check if any documents match the query
      if (userSnapshot.empty) {
        return res.status(404).json({ message: "User does not exist" });
      }
  
      // Get the user's document reference (assuming there's one match)
      const userDocRef = userSnapshot.docs[0].data();
  
      // Retrieve the cart data from the user's document
      const cartItems = userDocRef.cart || []; // Default to an empty array if cart doesn't exist
  
      return res.status(200).json({ message: "Cart retrieved successfully", cart: cartItems });
    } catch (err) {
      console.error("Error retrieving cart data:", err);
      res.status(500).json({ error: "Error retrieving cart data", details: err.message });
    }
  }



async function deleteFromCart(req, res) {
  try {
    const { email, uniqueId } = req.body;

    // Validate input
    if (!email || !uniqueId) {
      return res.status(400).json({
        message: "Email and unique ID are required",
      });
    }

    // Query Firestore to check if the user exists
    const q = query(User, where("emailD", "==", email));
    const userSnapshot = await getDocs(q);

    // Check if any documents match the query
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Get the user's document reference (assuming there's one match)
    const userDocRef = userSnapshot.docs[0].ref;

    // Get the user's current cart
    const userData = userSnapshot.docs[0].data();
    const currentCart = userData.cart || [];

    // Find the product in the cart using the unique ID
    const productToRemove = currentCart.find((item) => item.uniqueIdD === uniqueId);

    if (!productToRemove) {
      return res
        .status(404)
        .json({ message: "Product with the specified unique ID not found in the cart" });
    }

    // Remove the product from the cart
    await updateDoc(userDocRef, {
      cart: arrayRemove(productToRemove),
    });

    return res.status(200).json({
      message: "Product removed from cart successfully",
      uniqueId,
    });
  } catch (err) {
    console.error("Error removing product from cart:", err);
    res.status(500).json({
      error: "Error removing product from cart",
      details: err.message,
    });
  }
}


// module.exports = {addToCart};

module.exports = {
  SignupUser,
  LoginUser,
  AllUsersDetail,
  userExists,
  addToCart,
  deleteFromCart,
  getCart
};
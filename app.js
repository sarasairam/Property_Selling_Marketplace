const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const cors = require('cors')

const dbPath = path.join(__dirname, "database.db");
let db = null;
const PORT = process.env.PORT || 3000;

db = new sqlite3.Database("./database.db",sqlite3.OPEN_READWRITE, (err)=>{
        if(err){
            return console.error(err.message)
        }
        else{
            console.log("Connection sucessfull")
        }
    })

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(PORT, () => {
        console.log(`Server Running at http://localhost:${PORT}/`);
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  
  initializeDBAndServer();

  app.use(cors());

  //  CREATE TABLE
// const sql = `CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(200),role VARCHAR(200),phone_number VARCHAR(10),email VARCHAR(200))`
// db.run(sql,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Table is Created")
//     }
// }) 

// initiating user table with user
// const sqlpost = `INSERT INTO users (name,role,phone_number,email)
// VALUES ("ram","buyer","7845784520","ram@gmail.com")`   
// db.run(sqlpost)



// CREATE TABLE property
// const sql = `CREATE TABLE property (id INTEGER PRIMARY KEY AUTOINCREMENT,location VARCHAR(200),no_of_rooms INTEGER,cost VARCHAR(200),owner VARCHAR(200),property_status VARCHAR(200), FOREIGN KEY (owner) REFERENCES users(name))`
// db.run(sql,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Table is Created")
//     }
// }) 

// db.run(`DROP TABLE property`)

// initiating user table with property
// const sqlpost = `INSERT INTO property (id,location,no_of_rooms,cost,owner,property_status)
// VALUES (1,"Hyderabad",3,"20 Lakhs","sara","Available")`   
// db.run(sqlpost)

// db.run(`delete from property where id = 2`)


// Retrieving users irrespective of Role
app.get('/all-users',async(request,response)=>{
  const sqlGetAllUsers = `SELECT * FROM users`
  const responseData = await db.all(sqlGetAllUsers)
  response.send(responseData)
})


// Retrieving property irrespective of Role
app.get('/all-property',async(request,response)=>{
  const sqlGetAllProperty = `SELECT * FROM property`
  const responseData = await db.all(sqlGetAllProperty)
  response.send(responseData)
})

// Retrieving single property 
app.get('/single-property/:propertyId',async(request,response)=>{
  const {propertyId} = request.params;
  const sqlGetAllProperty = `SELECT * FROM property WHERE id = ${propertyId}`
  const responseData = await db.get(sqlGetAllProperty)
  response.send(responseData)
})

// Retrieving properties based on property Owner
app.get('/property/:name',async(request,response)=>{
  const {name} = request.params;
  const sqlGetAllProperty = `SELECT * FROM property WHERE owner = '${name}'`
  const responseData = await db.all(sqlGetAllProperty)
  response.send(responseData)
})


// login in users with Role
app.post("/login/", async (request,response)=>{
    const {name,role} = request.body;
    const getUserQuery = `SELECT * FROM users WHERE (name = '${name}' AND role = '${role}');`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser===undefined){
        response.send(JSON.stringify(`User ${name} is not registered with ${role} role`))
    }else{
        response.send(JSON.stringify(true))
    }
  }
    )

//  sign up for new users 
app.post("/sign-up/", async (request,response)=>{
    const {name,role,phoneNumber,email} = request.body;
    const getUserQuery = `SELECT * FROM users WHERE (name = '${name}' AND role = '${role}');`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser===undefined){
      const sqlpost = `INSERT INTO users (name,role,phone_number,email)
            VALUES ('${name}','${role}','${phoneNumber}','${email}')`   
        await db.run(sqlpost)
        response.send(JSON.stringify(true))
    }else{
        response.send(JSON.stringify(`User ${name} already registered with ${role} role`))
    }
  }
    )

// Adding new property  based on Role - 'owner'
app.post("/add/", async (request,response)=>{
    const {location,noOfRooms,cost,owner,propertyStatus,role} = request.body;
    if(role==="owner"){
      const sqlpost = `INSERT INTO property (location,no_of_rooms,cost,owner,property_status)
      VALUES ('${location}',${noOfRooms},'${cost}','${owner}','${propertyStatus}')`    
        await db.run(sqlpost)
        response.send(JSON.stringify(`New property is added.`))
    }else{
        response.send(JSON.stringify(`You cannot add property with ${role} role`))
    }
  }
    )


// Removing existing property  based on Role - 'owner'
app.post("/remove/", async (request,response)=>{
    const {propertyId,role} = request.body;
    if(role==="owner"){
      const sqlpost = `DELETE FROM property WHERE id = ${propertyId}`    
        await db.run(sqlpost)
        response.send(JSON.stringify(true))
    }else{
        response.send(JSON.stringify(`You cannot remove property with ${role} role`))
    }
  }
    )


// Searching properties using location input
app.post("/search/", async (request,response)=>{
    const {search} = request.body;
    const sqlpost = `Select * FROM property WHERE location like '%${search}%'`    
        const responseData = await db.all(sqlpost)
        response.send(responseData)
    }
    )

// Updating existing property  based on Role - 'owner'
app.put("/update/:propertyId/", async (request,response)=>{
    const {propertyId} = request.params;
    const {location,noOfRooms,cost,owner,propertyStatus,role} = request.body;
    if(role==="owner"){
      const sqlpost = `UPDATE property SET
      location='${location}',
      no_of_rooms=${noOfRooms},
      cost='${cost}',
      owner='${owner}',
      property_status='${propertyStatus}'
      WHERE id = ${propertyId}`    
        await db.run(sqlpost)
        response.send(JSON.stringify(true))
    }else{
        response.send(JSON.stringify(`You cannot update property with ${role} role`))
    }
  }
    )

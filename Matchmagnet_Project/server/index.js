const PORT=8000
const express = require('express')
const { MongoClient }= require('mongodb')
const {v4: uuidv4}=require('uuid')
const jwt = require('jsonwebtoken')
const uri='mongodb+srv://Zod:zodbroxyz@cluster0.zahhmrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const cors=require('cors')
const bcrypt = require('bcrypt');


const app=express()
app.use(cors())
app.use(express.json({limit: '50mb'}))

app.get('/', (req, res) => {
  res.json('Hello to my app')                         
})

app.post('/signup', async(req, res) => {
  const client=new MongoClient(uri)   
  const {email,password}= req.body       
  const generateUserId = uuidv4()
  const hashedPassword = await bcrypt.hash(password,10)

  try{
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')

    const existingUser = await users.findOne({ email})

    if(existingUser){
      return res.status(409).send('Users already exists. Please login')
    }

    const sanitizedEmail = email.toLowerCase()

    const data = {
      user_id: generateUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword
    }
    const insertedUser=await users.insertOne(data)

    const token = jwt.sign({user_id: insertedUser.insertedId}, sanitizedEmail, {
      expiresIn: 60*24,
    })

    res.status(201).json({token,userId:generateUserId})
  } catch(err){
    console.log(err)
  }
})

app.post('/login',async (req,res)=>{
  const client = new MongoClient(uri)
  const {email,password}=req.body

  try{
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')

    const user = await users.findOne({ email})

    const correctPassword = await bcrypt.compare(password,user?.hashed_password)

    if (user && (correctPassword)){
      const token =jwt.sign({user_id:user._id},email,{
        expiresIn:60*24
      })
      return res.status(201).json({token,userId: user.user_id})

    }
    res.status(400).send('Invalid Credentials')
  } catch(err) {
    console.log(err);
  }
})

app.get('/user',async(req,res)=>{
  const client = new MongoClient(uri)
  const userId = req.query.userId

  try{
    await client.connect()
    const database =client.db('app-data')
    const users = database.collection('users')

    const query ={user_id: userId}
    const user=await users.findOne(query, { projection: { hashed_password: 0 } })
    res.send(user)
  }finally{
    await client.close()
  }
})

app.get('/users',async(req,res)=>{
  const client=new MongoClient(uri)
  console.log("/users", req.query)
  try{
    const userIds=JSON.parse(req.query?.userIds)
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')

    const pipeline= [
        {
          '$match':{
            'user_id':{
              '$in':userIds || []
            }
          }
        }
      ]
      const foundUsers=await users.aggregate(pipeline).toArray()
      res.json(foundUsers)
  } catch (err) {
      console.log(err.message);
      res.status(500).json({error: err});
  } finally{
    await client.close()
  }
})


app.get('/gendered-users',async (req, res) => {
  const client=new MongoClient(uri)
  const gender=req.query.gender

  // console.log('gender',gender)
  
  try{
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')
    const query={gender_identity:{$eq:gender}}
    const foundUsers=await users.find(query).toArray()

    res.send(foundUsers)
  } finally{
      await client.close()
  }
})


app.put('/user',async(req,res)=>{
  const client = new MongoClient(uri)
  const formData = req.body.formData

  try{
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')

    const query ={user_id:formData.user_id}
    const updateDocument = {
      $set: {
        first_name: formData.first_name,
        dob_day: formData.dob_day,
        dob_month: formData.dob_month,
        dob_year: formData.dob_year,
        show_gender: formData.show_gender,
        hobbies: formData.hobbies,
        gender_identity: formData.gender_identity,
        gender_interest: formData.gender_interest,
        url: formData.url,
        about: formData.about,
        matches: formData.matches
      },
    }
    const insertedUser= await users.updateOne(query,updateDocument)
    res.send(insertedUser)
  }finally{

    await client.close()
  }
})

app.put('/addmatch',async(req,res)=>{
  const client = new MongoClient(uri)
  const {userId,matchedUserId}=req.body

  try{
    await client.connect()
    const database=client.db('app-data')
    const users=database.collection('users')

    const query={user_id:userId}

    const updateDocument={
      $push: {matches: matchedUserId}
    }

    await users.updateOne({...query, $or: [{ matches: null }, {matches: { $exists: false }}]}, { $set: { matches: [] } })
    const user= await users.updateOne(query,updateDocument)
    res.send(user)
  } catch(err) {
    console.log("/addmatch: ", err)
    res.status(500)
  }
  finally{
    await client.close()
  }
})

app.post("/matches", async (req, res) => {
  const client = new MongoClient(uri)
  const targetArray = req.body.hobbies;
  const gender = req.body.gender_interest;

  try {
    await client.connect()
    const database = client.db("app-data")
    const users = database.collection("users")
    const pipeline = [
      {
        $match: { gender_identity: gender }
      },
      {
        $addFields: { intersection: { $setIntersection: ["$hobbies", targetArray] } }
      },
      {
        $addFields: { intersectionSize: { $size: {$ifNull: ["$intersection", []]} } }
      },
      {
        $sort: { intersectionSize: -1 }
      },
      {
        $limit: 10
      }
    ];
    const results = await users.aggregate(pipeline).toArray();
   
    res.send(results.reverse());
  } finally {
    await client.close()
  }
});

app.get('/messages', async (req, res) => {
  const {userId, correspondingUserId} = req.query
  const client = new MongoClient(uri)

  try {
      await client.connect()
      const database = client.db('app-data')
      const messages = database.collection('messages')

      const query = {
          from_userId: userId, to_userId: correspondingUserId
      }
      const foundMessages = await messages.find(query).toArray()
      res.send(foundMessages)
  } finally {
      await client.close()
  }
})

app.post('/message', async (req, res) => {
  const client = new MongoClient(uri)
  const message = req.body.message

  try {
      await client.connect()
      const database = client.db('app-data')
      const messages = database.collection('messages')

      const insertedMessage = await messages.insertOne(message)
      res.send(insertedMessage)
  } finally {
      await client.close()
  }
})

app.listen(PORT,()=>console.log('Server running on PORT '+ PORT))
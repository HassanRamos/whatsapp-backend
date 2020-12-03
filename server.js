//importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js'
import Pusher from 'pusher';
import cors from 'cors'

//app config
const app = express()
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1117126",
    key: "89a4f9ced045ae7f0dba",
    secret: "72882dbfe0062cdb80d3",
    cluster: "mt1",
    useTLS: true
  });

  const db = mongoose.connection;
  db.once('open',()=>{
      console.log('Db connected');

      const msgCollection = db.collection('messagecontents');
      const changeStream = msgCollection.watch();

      changeStream.on('change',(change)=>{
          console.log('A Change occured',change)

          if(change.operationType ==='insert'){
              
              const  messageDetails = change.fullDocument;
              pusher.trigger('messages','insert',{
                  name: messageDetails.name,
                  message:messageDetails.message,
                  timestamp:messageDetails.timestamp,
                  received:messageDetails.received,
              });
          }else{
              console.log('Error trigerring pusher');
        }
         });
  });

// middleware
app.use(express.json());
app.use(cors())


//DB config
const connection_url = 'mongodb+srv://RamosH:Hassanku1@cluster0.lie7f.mongodb.net/<dbname>?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    userCreateIndex: true,
    userNewUrlParser: true,
    userUnifiedTopology: true,
})
//????


//api routes
app.get('/',(req,res)=>res.status(200).send('hello world'));
app.get('/messages/sync', (req,res) => { 
    Messages.find((err,data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req,res) => { 
    const dbMessage = req.body;
    Messages.create(dbMessage, (err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

//listen
app.listen(port,()=>console.log(`Listening on localhost:${port}`))
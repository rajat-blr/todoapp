const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const serviceAccount = require('./config/firebaseConfig.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://to-do-9b3a3-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = admin.database();
const tasksRef = db.ref('tasks');

app.get('/api/tasks', (req, res) => {
    tasksRef.once('value', (snapshot) => {
        const tasks = snapshot.val();
        if (tasks) {
            const taskList = Object.keys(tasks).map((taskId) => ({
                id: taskId,
                ...tasks[taskId],
            }));
            res.json(taskList);
        } else {
            res.json([]);
        }
    });
});

app.post('/api/tasks', (req, res) => {
    const { task, deadline } = req.body;
    const newTaskRef = tasksRef.push();
    newTaskRef
        .set({
            task,
            deadline,
            done: false,
        })
        .then(() => {
            res.status(201).json({ id: newTaskRef.key });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to add task' });
        });
});

app.patch('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { done } = req.body;
    tasksRef
        .child(id)
        .update({ done })
        .then(() => {
            res.json({ success: true });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to update task' });
        });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    tasksRef
        .child(id)
        .remove()
        .then(() => {
            res.json({ success: true });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to delete task' });
        });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

import { BlobServiceClient } from '@azure/storage-blob';
import { readFileSync } from 'fs'
import { config } from 'dotenv';
import express, { response } from 'express';
config();

console.log = (...o: any) => console.debug(JSON.stringify(o, null, 2));
const app = express()

// manipulate blob containers
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZ_CONNECTION_STRING!);

// create container
// PUT http://localhost:8080/container
app.put("/container", async (req, res) => {
    try {
        await blobServiceClient.getContainerClient("testcontainer").create();
        response.sendStatus(200);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(500);
    }
});

// upload blobs to a container
// POST http://localhost:8080/blob
app.put("/blob", async (req, res) => {
    try {
        await blobServiceClient.getContainerClient("testcontainer").getBlockBlobClient("weather.csv").uploadData(
            readFileSync("./data/weather.csv"),
            { metadata: { nature: "lit" } },
        );
        const { metadata } = await blobServiceClient.getContainerClient("testcontainer").getBlockBlobClient("weather.csv").getProperties();
        res.send(metadata);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(500);
    }
});

// list all blobs
// GET http://localhost:8080/listblob
app.get("/listblob", async (req, res) => {
    try {
        const iterator = blobServiceClient.getContainerClient("testcontainer").listBlobsFlat();
        for await (const item of iterator) {
            console.log(item.name);
        }
        res.sendStatus(200);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(500);
    }
});

// list all blobs
// GET http://localhost:8080/downloadblob
app.get("/downloadblob", async (req, res) => {
    try {
        await blobServiceClient.getContainerClient("testcontainer").getBlockBlobClient("weather.csv").downloadToFile("./data/download-weather.csv");
        res.sendStatus(200);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(500);
    }
});

// deletes the container
// DELETE http://localhost:8080/container
app.delete("/container", async (req, res) => {
    try {
        await blobServiceClient.getContainerClient("testcontainer").delete();
        res.sendStatus(200);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(500);
    }
});

app.listen(8080);
//


//BASIC VARIABLES AND FUNCTIONS
const fs = require("fs");
const path = require("path");
const http = require("http");

const itemsPath = path.join(__dirname, "items.json");

const PORT = 8000;


//HANDLER FUNCTIONS
function requestHandler(req, res) {
  if (req.url === "/items" && req.method === "POST") {
    postItem(req, res);
  }

  if (req.url === "/items" && req.method === "GET") {
    getAllItems(req, res);
  }

  if (req.url.startsWith("/items/") && req.method === "GET") {
    getOneItem(req, res);
  }

  if (req.url.startsWith("/items/") && req.method === "PATCH") {
    updateItem(req, res);
  }

  if (req.url.startsWith("/items/") && req.method === "DELETE") {
    deleteItem(req, res);
  }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server has started running at http://localhost:${PORT}`);
});




//TO POST AN ITEM
function postItem(req, res) {
  const preRead = fs.readFileSync(itemsPath)
  const  itemsArrayOfObj = JSON.parse(preRead)

  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const itemToPost = JSON.parse(parsedBody);

    itemsArrayOfObj.push({
      ...itemToPost,
      id: Math.floor(Math.random() * 500).toString(),
    });

    fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
      if (err) {
       serverError()
      }

      res.end(JSON.stringify(itemToPost));
    });
  });
}


//TO GET ALL ITEMS
function getAllItems(req, res) {
  fs.readFile(itemsPath, "utf8", (err, data) => {
    if (err) {
     serverError()
    }
    res.end(data);
  });
}


//TO GET ONE ITEM
function getOneItem(req, res) {
  const id = req.url.split("/")[2];
  const items = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(items);

  const itemIndex = itemsArrayOfObj.findIndex((item) => {
    return item.id === id;
  });
  if (itemIndex === -1) {
    clientError()
  }
  res.end(JSON.stringify(itemsArrayOfObj[itemIndex]));
}


//TO UPDATE AN ITEM
function updateItem(req, res) {
  const id = req.url.split("/")[2];

  const items = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(items);

  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const update = JSON.parse(parsedBody);

    const itemIndex = itemsArrayOfObj.findIndex((item) => {
      return item.id === id;
    });

    if (itemIndex == -1) {
      res.end(`item not found`);
    }

    itemsArrayOfObj[itemIndex] = { ...itemsArrayOfObj[itemIndex], ...update };

    fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
      if (err) {
        serverError()
      }
      res.end(JSON.stringify(itemsArrayOfObj[itemIndex]));
    });
  });
}


//TO DELETE AN ITEM
function deleteItem(req, res) {
  const id = req.url.split("/")[2];

  const items = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(items);

  const itemIndex = itemsArrayOfObj.findIndex((item) => {
    return item.id === id;
  });

  if (itemIndex == -1) {
    res.end(`item not found`);
  }

  itemsArrayOfObj.splice(itemIndex, 1);

  fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
    if (err) {
      serverError()
    }

    res.end(`item successfully deleted`);
  });
}


//ERROR HANDLERS
function serverError(){
  res.writeHead("500");
  res.end("internal server error");
}

function clientError(){
  res.writeHead("404");
  res.end("item not found");
}

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Door = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createDoor(door: Door) {
  if (!door.id) {
    door.id = uuid();
  }
  const params = {
    TableName: process.env.DOOR_TABLE,
    Item: door,
  };
  try {
    await docClient.put(params).promise();
    return door;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateDoor(door: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.DOOR_TABLE,
    Key: {
      id: door.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(door);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = door[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return door;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteDoor(doorId: string) {
  const params = {
    TableName: process.env.DOOR_TABLE,
    Key: {
      id: doorId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return doorId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getDoor(doorId: string) {
  const params = {
    TableName: process.env.DOOR_TABLE,
    Key: { id: doorId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listDoors() {
  const params = {
    TableName: process.env.DOOR_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

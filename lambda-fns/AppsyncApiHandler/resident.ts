const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Resident = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createResident(resident: Resident) {
  if (!resident.id) {
    resident.id = uuid();
  }
  const params = {
    TableName: process.env.RESIDENT_TABLE,
    Item: resident,
  };
  try {
    await docClient.put(params).promise();
    return resident;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateResident(resident: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.RESIDENT_TABLE,
    Key: {
      id: resident.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(resident);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = resident[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return resident;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteResident(residentId: string) {
  const params = {
    TableName: process.env.RESIDENT_TABLE,
    Key: {
      id: residentId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return residentId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getResident(residentId: string) {
  const params = {
    TableName: process.env.RESIDENT_TABLE,
    Key: { id: residentId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listResidents() {
  const params = {
    TableName: process.env.RESIDENT_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

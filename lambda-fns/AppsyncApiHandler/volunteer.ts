const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Volunteer = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createVolunteer(volunteer: Volunteer) {
  if (!volunteer.id) {
    volunteer.id = uuid();
  }
  const params = {
    TableName: process.env.VOLUNTEER_TABLE,
    Item: volunteer,
  };
  try {
    await docClient.put(params).promise();
    return volunteer;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateVolunteer(volunteer: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.VOLUNTEER_TABLE,
    Key: {
      id: volunteer.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(volunteer);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = volunteer[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return volunteer;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteVolunteer(volunteerId: string) {
  const params = {
    TableName: process.env.VOLUNTEER_TABLE,
    Key: {
      id: volunteerId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return volunteerId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getVolunteer(volunteerId: string) {
  const params = {
    TableName: process.env.VOLUNTEER_TABLE,
    Key: { id: volunteerId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listVolunteers() {
  const params = {
    TableName: process.env.VOLUNTEER_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

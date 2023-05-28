const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Assignment = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createAssignment(assignment: Assignment) {
  if (!assignment.id) {
    assignment.id = uuid();
  }
  const params = {
    TableName: process.env.ASSIGNMENT_TABLE,
    Item: assignment,
  };
  try {
    await docClient.put(params).promise();
    return assignment;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateAssignment(assignment: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.ASSIGNMENT_TABLE,
    Key: {
      id: assignment.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(assignment);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = assignment[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return assignment;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteAssignment(assignmentId: string) {
  const params = {
    TableName: process.env.ASSIGNMENT_TABLE,
    Key: {
      id: assignmentId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return assignmentId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getAssignment(assignmentId: string) {
  const params = {
    TableName: process.env.ASSIGNMENT_TABLE,
    Key: { id: assignmentId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listAssignments() {
  const params = {
    TableName: process.env.ASSIGNMENT_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

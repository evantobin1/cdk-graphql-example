const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Route = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createRoute(route: Route) {
  if (!route.id) {
    route.id = uuid();
  }
  const params = {
    TableName: process.env.ROUTE_TABLE,
    Item: route,
  };
  try {
    await docClient.put(params).promise();
    return route;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateRoute(route: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.ROUTE_TABLE,
    Key: {
      id: route.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(route);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = route[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return route;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteRoute(routeId: string) {
  const params = {
    TableName: process.env.ROUTE_TABLE,
    Key: {
      id: routeId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return routeId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getRoute(routeId: string) {
  const params = {
    TableName: process.env.ROUTE_TABLE,
    Key: { id: routeId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listRoutes() {
  const params = {
    TableName: process.env.ROUTE_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

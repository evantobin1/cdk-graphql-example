const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require("uuid");

export type Campaign = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
};

/* MUTATORS */

export async function createCampaign(campaign: Campaign) {
  if (!campaign.id) {
    campaign.id = uuid();
  }
  const params = {
    TableName: process.env.CAMPAIGN_TABLE,
    Item: campaign,
  };
  try {
    await docClient.put(params).promise();
    return campaign;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function updateCampaign(campaign: any) {
  type Params = {
    TableName: string | undefined;
    Key: string | {};
    ExpressionAttributeValues: any;
    ExpressionAttributeNames: any;
    UpdateExpression: string;
    ReturnValues: string;
  };

  let params: Params = {
    TableName: process.env.CAMPAIGN_TABLE,
    Key: {
      id: campaign.id,
    },
    UpdateExpression: "",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  let prefix = "set ";
  let attributes = Object.keys(campaign);
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] +=
        prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = campaign[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
  try {
    await docClient.update(params).promise();
    return campaign;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export async function deleteCampaign(campaignId: string) {
  const params = {
    TableName: process.env.CAMPAIGN_TABLE,
    Key: {
      id: campaignId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return campaignId;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

/* QUERIERS */

export async function getCampaign(campaignId: string) {
  const params = {
    TableName: process.env.CAMPAIGN_TABLE,
    Key: { id: campaignId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export async function listCampaigns() {
  const params = {
    TableName: process.env.CAMPAIGN_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}
